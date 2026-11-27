const fs = require('fs');
const path = require('path');

const TAKAOTAKU =
	'https://raw.githubusercontent.com/TakaOtaku/Digimon-Card-App/main/src/assets/cardlists/PreparedDigimonCardsENG.json';
const ALYSIONMETA = 'https://alysionmeta.com/api/cards';
const DIGIMONCARDIO = 'https://digimoncard.io/api-public/search?n=';
const TYPES = { D: 'Digimon', E: 'Digi-Egg', T: 'Tamer', O: 'Option' };
const CARDS = path.join(__dirname, '..', 'public', 'json', 'dcg', 'cards.json');
const DEST = path.join(__dirname, '..', 'public', 'json', 'alysion', 'cards.json');
const GAME8_LIST = 'https://game8.jp/digimonalysion/727885';
const GAME8_DEST = path.join(__dirname, '..', 'src', 'json', 'alysion', 'game8-images.json');
const GAME8_ROW = /data-src='(https:\/\/img\.game8\.jp\/[^']+)'[\s\S]{0,600}?>(BD\d)-0?(\d{2}) /g;

const POOL_ID =
	/^(BT[1-4]-\d{3}|ST[1-6]-\d{2}|P-0(0[1-9]|1\d|2[0-7])|BD0[1-4]-\d{2}|SD0[12]-\d{2})$/;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

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

const INHERITED_PREFIX = /^Inherited Effect\s*/i;

const fromDigimonCardIo = card => {
	const main = value(card.main_effect);
	const source = value(card.source_effect);
	const isDigimon = card.type === 'Digimon' || card.type === 'Digi-Egg';
	const mainIsInherited = main && INHERITED_PREFIX.test(main);
	const cost = number(card.evolution_cost);
	return {
		dp: number(card.dp),
		cost: number(card.play_cost),
		digivolve:
			cost !== undefined ?
				[[value(card.evolution_color) ?? null, number(card.evolution_level) ?? null, cost]]
			:	[],
		form: value(card.form),
		attribute: value(card.attribute),
		traits: [card.digi_type, card.digi_type2, card.digi_type3, card.digi_type4]
			.map(value)
			.filter(Boolean)
			.join('/') || undefined,
		effect: mainIsInherited ? undefined : main,
		...(isDigimon ?
			{ inherited: mainIsInherited ? main.replace(INHERITED_PREFIX, '') : source }
		:	{ security: source }),
	};
};

const textLength = card => `${card.main_effect || ''}${card.source_effect || ''}`.length;

const normalize = name => (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const searchDigimonCardIo = async query => {
	const results = await get(`${DIGIMONCARDIO}${encodeURIComponent(query)}`).catch(() => []);
	return Array.isArray(results) ? results : [];
};

const findOnDigimonCardIo = async ([id, name, , colors, type]) => {
	const set = id.slice(0, 2);
	const matches = card =>
		normalize(card.name) === normalize(name) &&
		card.type === TYPES[type] &&
		card.color === colors[0] &&
		(card.digi_type2 === 'ALYSION' || card.id?.startsWith(set));
	let candidates = (await searchDigimonCardIo(name)).filter(matches);
	if (!candidates.length) {
		const word = name.split(/[^A-Za-z0-9]+/).sort((a, b) => b.length - a.length)[0];
		await wait(800);
		candidates = (await searchDigimonCardIo(word)).filter(matches);
	}
	return (
		candidates.find(card => card.id === id && textLength(card)) ||
		candidates
			.filter(card => card.id?.startsWith(set))
			.sort((a, b) => textLength(b) - textLength(a))[0] ||
		null
	);
};

const compact = entry =>
	Object.fromEntries(
		Object.entries(entry).filter(
			([, item]) => item !== undefined && !(Array.isArray(item) && !item.length)
		)
	);

const main = async () => {
	const pool = JSON.parse(fs.readFileSync(CARDS, 'utf8')).filter(row => POOL_ID.test(row[0]));

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
	const missing = [];
	for (const row of pool) {
		const id = row[0];
		const fromPaper = paper.get(id);
		const fromGame = alysion.get(key(id));
		if (!fromPaper && !fromGame) {
			missing.push(row);
			continue;
		}
		details[id] = compact({
			...(fromGame ? fromAlysionMeta(fromGame) : {}),
			...(fromPaper ? compact(fromTakaOtaku(fromPaper)) : {}),
		});
	}

	const unresolved = [];
	for (const row of missing) {
		const card = await findOnDigimonCardIo(row);
		if (card) details[row[0]] = compact(fromDigimonCardIo(card));
		else unresolved.push(row[0]);
		await wait(800);
	}

	fs.mkdirSync(path.dirname(DEST), { recursive: true });
	fs.writeFileSync(DEST, JSON.stringify(details));
	console.log(
		`${Object.keys(details).length} cards -> ${path.relative(process.cwd(), DEST)}` +
			(unresolved.length ? `, without details: ${unresolved.join(', ')}` : '')
	);
};

const game8Images = async () => {
	const response = await fetch(GAME8_LIST, { headers: { 'User-Agent': 'Mozilla/5.0' } });
	if (!response.ok) throw new Error(`${GAME8_LIST}: ${response.status}`);
	const html = await response.text();
	const images = {};
	for (const [, url, set, number] of html.matchAll(GAME8_ROW)) {
		images[`${set.replace(/(\d)$/, '0$1')}-${number}`] = url;
	}
	const count = Object.keys(images).length;
	if (!count) throw new Error('No image found on the Game8 card list');
	fs.mkdirSync(path.dirname(GAME8_DEST), { recursive: true });
	fs.writeFileSync(GAME8_DEST, `${JSON.stringify(images, null, '\t')}\n`);
	console.log(`${count} Game8 images -> ${path.relative(process.cwd(), GAME8_DEST)}`);
};

game8Images().catch(error => console.warn(`Game8 images unavailable: ${error.message}`));

main().catch(error => {
	console.error(error);
	process.exit(1);
});
