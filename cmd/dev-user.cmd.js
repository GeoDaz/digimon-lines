/**
 * Crée (ou vérifie) le compte de test local défini par NEXT_PUBLIC_DEV_AUTH_EMAIL
 * et NEXT_PUBLIC_DEV_AUTH_PASSWORD.
 *
 *   npm run dev:user
 *
 * C'est un vrai compte Supabase : il permet de se connecter en un clic en local
 * avec une vraie session et une vraie RLS, sans faire le tour OAuth.
 * N'utilise que la clé publishable — aucune clé secrète requise.
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envPath)) {
	console.error('.env.local introuvable.');
	process.exit(1);
}

const env = {};
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
	const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
	if (match) env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = (env.NEXT_PUBLIC_DEV_AUTH_EMAIL || '').trim();
const password = env.NEXT_PUBLIC_DEV_AUTH_PASSWORD;
const accessToken = env.SUPABASE_ACCESS_TOKEN;

if (!url || !key) {
	console.error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquants.');
	process.exit(1);
}
if (!email || !password) {
	console.error(
		'NEXT_PUBLIC_DEV_AUTH_EMAIL et NEXT_PUBLIC_DEV_AUTH_PASSWORD sont requis.'
	);
	process.exit(1);
}

(async () => {
	const supabase = createClient(url, key, { auth: { persistSession: false } });

	const pseudoOf = async userId => {
		const { data } = await supabase
			.from('profiles')
			.select('pseudo')
			.eq('id', userId)
			.maybeSingle();
		return data?.pseudo;
	};

	// Déjà créé ? On se contente de vérifier que le mot de passe fonctionne.
	const { data: signedIn } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	let userId;

	if (signedIn?.user) {
		userId = signedIn.user.id;
		console.log(`OK      ${email} — existe déjà, pseudo "${await pseudoOf(userId)}"`);
	} else {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: { data: { name: email.split('@')[0] } },
		});

		if (error) {
			console.error(`ECHEC   ${email} — ${error.message}`);
			process.exit(1);
		}

		userId = data.user.id;
		console.log(`CREE    ${email} — pseudo "${await pseudoOf(userId)}"`);
	}

	// Droits d'administration, pour travailler sur /admin en local.
	//
	// Passe par l'API Management plutôt que par une migration : promouvoir un
	// compte de test n'a rien à faire dans le schéma, qui s'appliquerait à tout
	// environnement lié. Le trigger protect_profile_privileges laisse passer les
	// contextes sans utilisateur connecté, d'où la faisabilité ici.
	if (accessToken) {
		const ref = url.replace(/^https:\/\//, '').split('.')[0];
		const res = await fetch(
			`https://api.supabase.com/v1/projects/${ref}/database/query`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					query: `update public.profiles set is_admin = true where id = '${userId}';`,
				}),
			}
		);
		if (res.ok) {
			console.log('ADMIN   droits d’administration accordés (page /admin)');
		} else {
			console.error(`ATTENTION  promotion admin impossible — ${await res.text()}`);
		}
	} else {
		console.log(
			'INFO    SUPABASE_ACCESS_TOKEN absent : compte créé sans droits admin.'
		);
	}

	console.log('\nLance `npm run dev` : le compte apparaît dans le menu « Sign in ».');
})().catch(e => {
	console.error('ERREUR:', e.message);
	process.exit(1);
});
