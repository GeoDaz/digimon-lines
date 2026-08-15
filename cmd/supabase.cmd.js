/**
 * Wrapper autour de la CLI Supabase : charge .env.local puis passe la main.
 *
 *   npm run supabase -- config push
 *   npm run supabase -- db push
 *   npm run supabase -- gen types typescript --linked --schema public
 *
 * Évite d'exposer les secrets (token d'accès, mot de passe DB, secrets OAuth)
 * dans l'historique du shell.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const envPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envPath)) {
	console.error('.env.local introuvable — les identifiants Supabase sont requis.');
	process.exit(1);
}

const env = { ...process.env };

for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
	// Pas d'interpolation : les valeurs peuvent contenir $, § ou des espaces.
	const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
	if (!match) continue;
	const [, key, rawValue] = match;
	env[key] = rawValue.trim().replace(/^(['"])(.*)\1$/, '$2');
}

// La CLI attend SUPABASE_DB_PASSWORD, le projet stocke SUPABASE_DB_PWD.
if (!env.SUPABASE_DB_PASSWORD && env.SUPABASE_DB_PWD) {
	env.SUPABASE_DB_PASSWORD = env.SUPABASE_DB_PWD;
}

const args = process.argv.slice(2);

if (!args.length) {
	console.error('Usage : npm run supabase -- <commande CLI supabase>');
	process.exit(1);
}

const result = spawnSync('npx', ['supabase', ...args], {
	env,
	stdio: 'inherit',
	shell: true,
	cwd: path.join(__dirname, '..'),
});

process.exit(result.status ?? 1);
