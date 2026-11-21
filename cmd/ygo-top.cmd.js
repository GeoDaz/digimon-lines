const fs = require('fs');
const path = require('path');

const API = 'https://www.masterduelmeta.com/api/v1/cards';
const TOP = 1000;
const PAGE = 500;
const FIELDS = [
	'_id',
	'name',
	'type',
	'monsterType',
	'race',
	'attribute',
	'level',
	'atk',
	'def',
	'description',
	'konamiID',
	'popRank',
	'deckTypes',
	'release',
	'tcgRelease',
	'ocgRelease',
	'banStatus',
	'tcgBanStatus',
	'ocgBanStatus',
	'alternateArt',
];
const DIR = path.join(__dirname, '..', 'src', 'json', 'yugioh');
const DEST = path.join(DIR, 'top.json');

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const get = async query => {
	const response = await fetch(`${API}?${query}&fields=${FIELDS.join(',')}`, {
		headers: { 'User-Agent': 'DigimonLinesCardList/1.0' },
	});
	if (!response.ok) throw new Error(`${query}: ${response.status}`);
	return response.json();
};

const clean = card => {
	const entry = {};
	for (const field of FIELDS) {
		if (field !== 'alternateArt' && card[field] !== undefined) entry[field] = card[field];
	}
	entry.monsterType ??= [];
	entry.deckTypes ??= [];
	return entry;
};

const main = async () => {
	const top = {};
	for (let page = 1; Object.keys(top).length < TOP; page++) {
		const cards = await get(`cardSort=popRank&aggregate=search&limit=${PAGE}&page=${page}`);
		for (const card of cards) {
			if (!card.alternateArt && Object.keys(top).length < TOP) top[card._id] = clean(card);
		}
		if (cards.length < PAGE) break;
		await wait(1000);
	}

	fs.writeFileSync(DEST, JSON.stringify(top));
	console.log(`${Object.keys(top).length} cards -> ${path.relative(process.cwd(), DEST)}`);
};

main().catch(error => {
	console.error(error);
	process.exit(1);
});
