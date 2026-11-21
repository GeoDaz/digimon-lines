const fs = require('fs');
const path = require('path');

const MDM = 'https://www.masterduelmeta.com/api/v1';
const YGOPRODECK = 'https://ygoprodeck.com/api/decks/getDecks.php';
const CARDINFO = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';
const DECKS = 60;
const PAGE = 3000;
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
	'alternateArt',
];
const FORMATS = { tcg: 'Tournament Meta Decks', ocg: 'Tournament Meta Decks OCG' };
const DEST = path.join(__dirname, '..', 'public', 'json', 'ygo', 'top-decks.json');

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const get = async url => {
	const response = await fetch(url, { headers: { 'User-Agent': 'DigimonLinesCardList/1.0' } });
	if (!response.ok) throw new Error(`${url}: ${response.status}`);
	return response.json();
};

const loadCards = async () => {
	const cards = [];
	for (let page = 1; ; page++) {
		const list = await get(`${MDM}/cards?limit=${PAGE}&page=${page}&fields=${FIELDS.join(',')}`);
		cards.push(...list);
		if (list.length < PAGE) return cards;
		await wait(1000);
	}
};

const clean = card => {
	const entry = {};
	for (const field of FIELDS) {
		if (field !== 'alternateArt' && card[field] !== undefined) entry[field] = card[field];
	}
	entry.monsterType ??= [];
	entry.deckTypes = [];
	return entry;
};

const main = async () => {
	const all = await loadCards();
	const byId = new Map(all.map(card => [card._id, card]));
	const byPasscode = new Map();
	for (const card of all) {
		const passcode = Number(card.konamiID);
		if (passcode && (!card.alternateArt || !byPasscode.has(passcode))) {
			byPasscode.set(passcode, card);
		}
	}

	const used = {};
	const use = card => {
		used[card._id] ??= clean(card);
		return card._id;
	};
	const expand = entries =>
		(entries || []).flatMap(({ card, amount }) =>
			byId.has(card._id) ? Array(amount).fill(use(byId.get(card._id))) : []
		);
	const fromPasscodes = (json, missing) =>
		JSON.parse(json || '[]').flatMap(code => {
			const card = byPasscode.get(Number(code));
			if (!card) missing.add(code);
			return card ? [use(card)] : [];
		});

	const mdDecks = await get(`${MDM}/top-decks?limit=${DECKS}&sort=-created`);
	const md = mdDecks
		.map(deck => ({
			name: deck.deckType?.name || 'Top deck',
			author: deck.author?.username,
			event: deck.rankedType?.name || deck.tournamentType?.name,
			date: deck.created?.slice(0, 10),
			url: `https://www.masterduelmeta.com/top-decks${deck.url}`,
			main: expand(deck.main),
			extra: expand(deck.extra),
		}))
		.filter(deck => deck.main.length >= 40);

	const paperDecks = {};
	for (const [key, format] of Object.entries(FORMATS)) {
		paperDecks[key] = [];
		for (let offset = 0; offset < DECKS; offset += 20) {
			paperDecks[key].push(
				...(await get(`${YGOPRODECK}?format=${encodeURIComponent(format)}&limit=20&offset=${offset}`))
			);
			await wait(500);
		}
	}

	const unknown = new Set(
		Object.values(paperDecks)
			.flat()
			.flatMap(deck => [...JSON.parse(deck.main_deck || '[]'), ...JSON.parse(deck.extra_deck || '[]')])
			.map(Number)
			.filter(code => !byPasscode.has(code))
	);
	if (unknown.size) {
		const byName = new Map(all.filter(card => !card.alternateArt).map(card => [card.name, card]));
		const { data = [] } = await get(`${CARDINFO}?id=${[...unknown].join(',')}`).catch(() => ({}));
		for (const info of data) {
			const card = byName.get(info.name);
			if (!card) continue;
			for (const image of info.card_images || []) {
				if (unknown.has(image.id)) byPasscode.set(image.id, card);
			}
			if (unknown.has(info.id)) byPasscode.set(info.id, card);
		}
	}

	const result = { md };
	const missing = new Set();
	for (const [key, decks] of Object.entries(paperDecks)) {
		result[key] = decks
			.map(deck => ({
				name: deck.deck_name,
				author: deck.tournamentPlayerName || deck.username,
				event: [deck.tournamentName, deck.tournamentPlacement].filter(Boolean).join(' - '),
				url: `https://ygoprodeck.com/deck/${deck.pretty_url}`,
				main: fromPasscodes(deck.main_deck, missing),
				extra: fromPasscodes(deck.extra_deck, missing),
			}))
			.filter(deck => deck.main.length >= 40);
	}

	fs.mkdirSync(path.dirname(DEST), { recursive: true });
	fs.writeFileSync(DEST, JSON.stringify({ cards: used, ...result }));
	console.log(
		`md ${result.md.length}, tcg ${result.tcg.length}, ocg ${result.ocg.length} decks, ${Object.keys(used).length} cards -> ${path.relative(process.cwd(), DEST)}`
	);
	if (missing.size) console.log(`Unknown passcodes: ${[...missing].join(', ')}`);
};

main().catch(error => {
	console.error(error);
	process.exit(1);
});
