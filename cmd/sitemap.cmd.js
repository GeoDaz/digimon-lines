const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SITE_URL = 'https://digimon-lines.com';
const ROOT = path.join(__dirname, '..');
const JSON_DIR = path.join(ROOT, 'public', 'json');
const OUTPUT = path.join(ROOT, 'public', 'sitemap.xml');

const readJson = file => JSON.parse(fs.readFileSync(path.join(JSON_DIR, file), 'utf8'));
const toNames = list => list.map(item => (typeof item === 'string' ? item : item.name));

const gamesSource = fs.readFileSync(path.join(ROOT, 'src', 'consts', 'games.ts'), 'utf8');
const gamesBlock = gamesSource.split('export const digimonGames')[1].split('\n};')[0];
const games = [...gamesBlock.matchAll(/^\t([a-z0-9_]+): \{\r?$/gm)].map(
	match => match[1]
);

const redirected = new Set(Object.keys(require(path.join(ROOT, 'redirects.json'))));

const getLastModified = () => {
	const dates = {};
	try {
		const git = command =>
			execSync(command, { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }).toString();
		if (git('git rev-parse --is-shallow-repository').trim() === 'true') return dates;
		let date = null;
		git('git log --format=@%cs --name-only -- public/json')
			.split(/\r?\n/)
			.forEach(line => {
				if (line.startsWith('@')) date = line.slice(1);
				else if (line && date && !dates[line]) dates[line] = date;
			});
	} catch {
		return {};
	}
	return dates;
};
const lastModified = getLastModified();
const json = file => `public/json/${file}`;
const notRedirected = name => !redirected.has(name);

const pages = [
	['/'],
	['/lines'],
	['/pokemon'],
	['/list'],
	['/build'],
	['/build/pokemon'],
	['/cards'],
	['/community'],
	['/community/pokemon'],
	['/groups'],
	['/vbs'],
	...games.map(name => [`/games/${name}`, json(`games/${name}/digimons.json`)]),
	...games.flatMap(name =>
		readJson(`games/${name}/digimons.json`).map(digimon => [
			`/games/${name}/${digimon.slug}`,
			json(`games/${name}/details.json`),
		])
	),
	...toNames(readJson('lines/_index.json'))
		.filter(notRedirected)
		.map(name => [`/lines/${name}`, json(`lines/${name}.json`)]),
	...toNames(readJson('lines/_fusion.json'))
		.filter(notRedirected)
		.map(name => [`/lines/${name}`, json(`lines/${name}.json`)]),
	...toNames(readJson('groups/_index.json')).map(name => [
		`/groups/${name}`,
		json(`groups/${name}.json`),
	]),
	...toNames(readJson('vb/_index.json')).map(name => [
		`/vbs/${name}`,
		json(`vb/${name}.json`),
	]),
	...toNames(readJson('appmons/_index.json')).map(name => [
		`/appmons/${name}`,
		json(`appmons/${name}.json`),
	]),
	['/privacy'],
	['/terms'],
];

const xml = [
	'<?xml version="1.0" encoding="UTF-8"?>',
	'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
	...pages.map(([page, file]) => {
		const lastmod = file && lastModified[file];
		return `\t<url><loc>${SITE_URL}${page}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
	}),
	'</urlset>',
	'',
].join('\n');

fs.writeFileSync(OUTPUT, xml);
console.log(`sitemap.xml: ${pages.length} pages`);
