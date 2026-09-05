/**
 * Purge ciblée du cache Cloudflare pour les images modifiées depuis un commit.
 *
 *   npm run purge:cache                 -> images modifiées depuis SINCE_DEFAULT
 *   npm run purge:cache -- HEAD~3       -> depuis une autre référence git
 *   npm run purge:cache -- --dry-run    -> affiche les URLs sans rien purger
 *   npm run purge:cache -- --since=<ref> --to=<ref>
 *
 * Pourquoi : les chemins d'images sont stables (/images/digimon/greymon.jpg) et
 * public/_headers leur donne un cache long. Une image corrigée reste donc servie
 * en ancienne version par l'edge Cloudflare jusqu'à expiration. La purge par URL
 * évite de vider tout le cache de la zone.
 *
 * À noter : la purge ne touche QUE l'edge Cloudflare. Les visiteurs qui ont déjà
 * l'image gardent leur copie navigateur (max-age 1 jour, cf. public/_headers).
 * Pour une propagation immédiate, il faut changer le nom du fichier.
 *
 * Requiert dans .env.local :
 *   CLOUDFLARE_PURGE_TOKEN  token API avec la permission Zone -> Cache Purge
 *                           (à défaut, CLOUDFLARE_TOKEN est essayé)
 *   CLOUDFLARE_ZONE_ID      (optionnel) sinon résolu depuis ZONE_NAME, ce qui
 *                           demande en plus la permission Zone -> Zone Read
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// Commit de référence : dernier déploiement dont les images sont déjà purgées.
const SINCE_DEFAULT = '52c5e099112a206ebafb29e5a89dc57e73590281';
const ZONE_NAME = 'digimon-lines.com';
const SITE_URL = 'https://digimon-lines.com';
const PUBLIC_DIR = 'public'; // préfixe à retirer pour obtenir le chemin public
const CHUNK_SIZE = 30; // maximum d'URLs par requête de purge (plans non-Enterprise)

const ROOT = path.join(__dirname, '..');
const envPath = path.join(ROOT, '.env.local');

// --- arguments -------------------------------------------------------------

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const flag = name => {
	const found = args.find(a => a.startsWith(`--${name}=`));
	return found ? found.slice(name.length + 3) : undefined;
};
const positional = args.filter(a => !a.startsWith('--'));

const since = flag('since') || positional[0] || SINCE_DEFAULT;
const to = flag('to') || positional[1] || 'HEAD';

// --- liste des images -------------------------------------------------------

const git = (...gitArgs) =>
	execFileSync('git', gitArgs, { cwd: ROOT, encoding: 'utf8' }).trim();

let range;
try {
	// Vérifie les deux références avant de calculer le diff (message d'erreur clair).
	git('rev-parse', '--verify', since);
	git('rev-parse', '--verify', to);
	range = `${since}..${to}`;
} catch {
	console.error(`Référence git introuvable : ${since} ou ${to}`);
	process.exit(1);
}

// ACMRT : ajoutées, copiées, modifiées, renommées, type changé. Les suppressions
// (D) sont volontairement incluses aussi : purger une image supprimée évite que
// l'edge continue de servir un fichier qui n'existe plus.
const changed = git(
	'diff',
	'--name-only',
	'--diff-filter=ACMRTD',
	range,
	'--',
	`${PUBLIC_DIR}/images`
)
	.split('\n')
	.filter(Boolean)
	.filter(f => /\.(jpe?g|png|gif|webp|avif|svg|ico)$/i.test(f));

// git renvoie toujours des chemins en slashs : public/images/... -> /images/...
const urls = [...new Set(changed)].map(f => SITE_URL + f.slice(PUBLIC_DIR.length));

if (!urls.length) {
	console.log(`Aucune image modifiée dans ${range}. Rien à purger.`);
	process.exit(0);
}

console.log(`${urls.length} image(s) modifiée(s) dans ${range} :`);
for (const url of urls) console.log(`  ${url}`);

if (dryRun) {
	console.log('\n--dry-run : aucune purge effectuée.');
	process.exit(0);
}

// --- credentials -----------------------------------------------------------

const env = { ...process.env };
if (fs.existsSync(envPath)) {
	for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
		// Pas d'interpolation : les valeurs peuvent contenir $, § ou des espaces.
		const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
		if (match) env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
	}
}

// Token dédié si présent : celui utilisé pour les autres usages Cloudflare n'a
// pas forcément la permission Cache Purge, et peut être restreint par IP (9109).
const token = env.CLOUDFLARE_PURGE_TOKEN || env.CLOUDFLARE_TOKEN;
if (!token) {
	console.error('\nCLOUDFLARE_PURGE_TOKEN / CLOUDFLARE_TOKEN manquant (.env.local).');
	process.exit(1);
}

const api = async (endpoint, init) => {
	const res = await fetch(`https://api.cloudflare.com/client/v4${endpoint}`, {
		...init,
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			...init?.headers,
		},
	});
	const body = await res.json().catch(() => ({}));
	if (!res.ok || !body.success) {
		const detail = (body.errors || [])
			.map(e => `${e.code} ${e.message}`)
			.join(' / ');
		throw new Error(detail || `HTTP ${res.status}`);
	}
	return body.result;
};

// --- purge -----------------------------------------------------------------

(async () => {
	let zoneId = env.CLOUDFLARE_ZONE_ID;

	if (!zoneId) {
		try {
			const zones = await api(`/zones?name=${ZONE_NAME}`);
			zoneId = zones?.[0]?.id;
		} catch (e) {
			console.error(`\nRésolution de la zone impossible : ${e.message}`);
		}
		if (!zoneId) {
			console.error(
				`Zone ${ZONE_NAME} introuvable. Ajoute CLOUDFLARE_ZONE_ID dans .env.local ` +
					"(dashboard Cloudflare, page d'accueil de la zone, colonne de droite)."
			);
			process.exit(1);
		}
		console.log(`\nZone ${ZONE_NAME} : ${zoneId}`);
	}

	// La purge est limitée à CHUNK_SIZE fichiers par requête.
	for (let i = 0; i < urls.length; i += CHUNK_SIZE) {
		const files = urls.slice(i, i + CHUNK_SIZE);
		const label = `${i + 1}-${i + files.length}/${urls.length}`;
		try {
			await api(`/zones/${zoneId}/purge_cache`, {
				method: 'POST',
				body: JSON.stringify({ files }),
			});
			console.log(`Purgé ${label}`);
		} catch (e) {
			console.error(`Échec sur ${label} : ${e.message}`);
			process.exit(1);
		}
	}

	console.log(
		`\n${urls.length} URL(s) purgée(s). Rappel : le cache navigateur des ` +
			'visiteurs (max-age 1 jour) conserve encore l’ancienne version.'
	);
})();
