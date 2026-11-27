const fs = require('fs');
const path = require('path');

const TAKAOTAKU =
	'https://raw.githubusercontent.com/TakaOtaku/Digimon-Card-App/main/src/assets/cardlists/PreparedDigimonCardsENG.json';
const ALYSIONMETA = 'https://alysionmeta.com/api/cards';
const CARDS = path.join(__dirname, '..', 'public', 'json', 'dcg', 'cards.json');
const DEST = path.join(__dirname, '..', 'public', 'json', 'alysion', 'cards.json');

const POOL_ID =
	/^(BT[1-4]-\d{3}|ST[1-6]-\d{2}|P-0(0[1-9]|1\d|2[0-7])|BD0[1-4]-\d{2}|SD0[12]-\d{2})$/;

const get = async url => {
	const response = await fetch(url, { headers: { 'User-Agent': 'DigimonLinesCardList/1.0' } });
	if (!response.ok) throw new Error(`${url}: ${response.status}`);
	return response.json();
};

const value = text => {
	const clean = (text ?? '').toString().trim();
	return clean && clean !== '-' ? clean : undefined;
};

const number = text => {
	const parsed = Number.parseInt(value(text), 10);
	return Number.isFinite(parsed) ? parsed : undefined;
};

const key = id => {
	const match = /^([A-Z]+)(\d*)-(\d+)$/.exec(id || '');
	return match ? `${match[1]}${Number(match[2] || 0)}-${Number(match[3])}` : id;
};

const fromTakaOtaku = card => ({
	dp: number(card.dp),
	cost: number(card.playCost),
	digivolve: (card.digivolveCondition || [])
		.map(({ color, level, cost }) => [color, number(level), number(cost)])
		.filter(([, level, cost]) => level !== undefined && cost !== undefined),
	form: value(card.form),
	attribute: value(card.attribute),
	traits: value(card.type),
	effect: value(card.effect),
	inherited: value(card.digivolveEffect),
	security: value(card.securityEffect),
	rarity: value(card.rarity),
});

const fromAlysionMeta = card => ({
	dp: number(card.dp),
	form: value(card.stage),
	attribute: value(card.attribute),
	traits: value(card.type),
	effect: value(card.effect),
	...(card.category === 'Digimon' ?
		{ inherited: value(card.inherited_effect) }
	:	{ security: value(card.inherited_effect) }),
});

const compact = entry =>
	Object.fromEntries(
		Object.entries(entry).filter(
			([, item]) => item !== undefined && !(Array.isArray(item) && !item.length)
		)
	);

const main = async () => {
	const pool = JSON.parse(fs.readFileSync(CARDS, 'utf8'))
		.map(row => row[0])
		.filter(id => POOL_ID.test(id));

	const paper = new Map();
	for (const card of await get(TAKAOTAKU)) {
		if (!card.id || (paper.has(card.id) && card.version !== 'Normal')) continue;
		paper.set(card.id, card);
	}

	const alysion = new Map();
	try {
		for (const card of await get(ALYSIONMETA)) alysion.set(key(card.set_code), card);
	} catch (error) {
		console.warn(`alysionmeta unavailable: ${error.message}`);
	}

	const details = {};
	let missing = 0;
	for (const id of pool) {
		const fromPaper = paper.get(id);
		const fromGame = alysion.get(key(id));
		if (!fromPaper && !fromGame) {
			missing++;
			continue;
		}
		details[id] = compact({
			...(fromGame ? fromAlysionMeta(fromGame) : {}),
			...(fromPaper ? compact(fromTakaOtaku(fromPaper)) : {}),
		});
	}

	fs.mkdirSync(path.dirname(DEST), { recursive: true });
	fs.writeFileSync(DEST, JSON.stringify(details));
	console.log(
		`${Object.keys(details).length} cards (${missing} without details) -> ${path.relative(process.cwd(), DEST)}`
	);
};

main().catch(error => {
	console.error(error);
	process.exit(1);
});
