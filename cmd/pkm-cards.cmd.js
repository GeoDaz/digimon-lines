const fs = require('fs');
const path = require('path');

const API = 'https://api.tcgdex.net/v2';
const ASSETS = 'https://assets.tcgdex.net/';
const DEST = path.join(__dirname, '..', 'public', 'json', 'pkm', 'cards.json');
const TYPES = [
	'Colorless',
	'Darkness',
	'Dragon',
	'Fairy',
	'Fighting',
	'Fire',
	'Grass',
	'Lightning',
	'Metal',
	'Psychic',
	'Water',
];
const CATEGORIES = { Trainer: 'T', Energy: 'E' };

const get = async url => {
	const response = await fetch(url, { headers: { 'User-Agent': 'DigimonLinesCardList/1.0' } });
	if (!response.ok) throw new Error(`${url}: ${response.status}`);
	return response.json();
};

const main = async () => {
	const [english, french] = await Promise.all([get(`${API}/en/cards`), get(`${API}/fr/cards`)]);

	const types = {};
	for (const type of TYPES) {
		for (const card of await get(`${API}/en/cards?types=${type}`)) {
			(types[card.id] ??= []).push(type);
		}
	}
	const categories = {};
	for (const [category, code] of Object.entries(CATEGORIES)) {
		for (const card of await get(`${API}/en/cards?category=${category}`)) {
			categories[card.id] = code;
		}
	}

	const frenchNames = Object.fromEntries(french.map(card => [card.id, card.name]));
	const byId = new Map();
	for (const card of english) if (card.image) byId.set(card.id, { ...card, lang: 'en' });
	for (const card of french) {
		if (card.image && !byId.has(card.id)) byId.set(card.id, { ...card, lang: 'fr' });
	}

	const sets = {};
	const rows = [];
	for (const card of byId.values()) {
		if (!card.image.startsWith(ASSETS)) continue;
		const imagePath = card.image.slice(ASSETS.length);
		const [lang, serie, set, localId] = imagePath.split('/');
		const split = card.id.lastIndexOf('-');
		const derived =
			split > 0 && card.id.slice(0, split) === set && card.id.slice(split + 1) === localId;
		if (derived && lang === 'en' && (sets[set] ?? serie) === serie) sets[set] = serie;
		const row = [
			card.id,
			card.name.trim(),
			frenchNames[card.id] && frenchNames[card.id] !== card.name ? frenchNames[card.id].trim() : '',
			types[card.id] || [],
			categories[card.id] || 'P',
		];
		if (!derived || lang !== 'en' || sets[set] !== serie) row.push(imagePath);
		rows.push(row);
	}
	rows.sort((a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0], 'en', { numeric: true }));

	fs.mkdirSync(path.dirname(DEST), { recursive: true });
	fs.writeFileSync(DEST, JSON.stringify({ sets, cards: rows }));
	console.log(`${rows.length} cards -> ${path.relative(process.cwd(), DEST)}`);
};

main().catch(error => {
	console.error(error);
	process.exit(1);
});
