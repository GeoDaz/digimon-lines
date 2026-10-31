const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://digimon-lines.com';
const ROOT = path.join(__dirname, '..');
const JSON_DIR = path.join(ROOT, 'public', 'json');
const OUTPUT = path.join(ROOT, 'public', 'sitemap.xml');

const readJson = file => JSON.parse(fs.readFileSync(path.join(JSON_DIR, file), 'utf8'));
const toNames = list => list.map(item => (typeof item === 'string' ? item : item.name));

const gamesSource = fs.readFileSync(path.join(ROOT, 'src', 'consts', 'games.ts'), 'utf8');
const gamesBlock = gamesSource.split('export const digimonGames')[1].split('\n};')[0];
const games = [...gamesBlock.matchAll(/^\t([a-z0-9_]+): \{$/gm)].map(match => match[1]);

const pages = [
	['/', 1],
	['/list', 0.8],
	['/build', 0.6],
	['/build/pokemon', 0.4],
	['/community', 0.6],
	['/community/pokemon', 0.4],
	['/groups', 0.7],
	['/vbs', 0.7],
	...games.map(name => [`/games/${name}`, 0.8]),
	...toNames(readJson('lines/_index.json')).map(name => [`/lines/${name}`, 0.8]),
	...toNames(readJson('lines/_fusion.json')).map(name => [`/lines/${name}`, 0.6]),
	...toNames(readJson('groups/_index.json')).map(name => [`/groups/${name}`, 0.6]),
	...toNames(readJson('vb/_index.json')).map(name => [`/vbs/${name}`, 0.6]),
	...toNames(readJson('appmons/_index.json')).map(name => [`/appmons/${name}`, 0.5]),
	['/privacy', 0.1],
	['/terms', 0.1],
];

const xml = [
	'<?xml version="1.0" encoding="UTF-8"?>',
	'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
	...pages.map(
		([page, priority]) =>
			`\t<url><loc>${SITE_URL}${page}</loc><priority>${priority}</priority></url>`
	),
	'</urlset>',
	'',
].join('\n');

fs.writeFileSync(OUTPUT, xml);
console.log(`sitemap.xml: ${pages.length} pages`);
