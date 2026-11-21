const fs = require('fs');
const path = require('path');

const API = 'https://www.masterduelmeta.com/api/v1/cards';
const FIELDS = '_id,name,type,monsterType,alternateArt';
const LIMIT = 3000;
const DEST = path.join(__dirname, '..', 'public', 'json', 'ygo', 'cards.json');
const EXTRA_FRAMES = ['Link', 'Xyz', 'Synchro', 'Fusion', 'Ritual', 'Pendulum', 'Token', 'Normal'];

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const frame = card => {
	if (card.type === 'Spell' || card.type === 'Trap') return card.type;
	const types = card.monsterType || [];
	return EXTRA_FRAMES.find(type => types.includes(type)) || 'Effect';
};

const main = async () => {
	const cards = [];
	for (let page = 1; ; page++) {
		const response = await fetch(`${API}?limit=${LIMIT}&page=${page}&fields=${FIELDS}`, {
			headers: { 'User-Agent': 'DigimonLinesCardList/1.0' },
		});
		if (!response.ok) throw new Error(`Page ${page}: ${response.status}`);
		const list = await response.json();
		cards.push(...list);
		if (list.length < LIMIT) break;
		await wait(1000);
	}

	const rows = cards
		.filter(card => /^[0-9a-f]{24}$/.test(card._id) && card.name)
		.map(card => {
			const row = [card._id, card.name.trim(), frame(card)];
			if (card.alternateArt) row.push(1);
			return row;
		})
		.sort((a, b) => a[1].localeCompare(b[1]) || (a[3] || 0) - (b[3] || 0));

	fs.mkdirSync(path.dirname(DEST), { recursive: true });
	fs.writeFileSync(DEST, JSON.stringify(rows));
	console.log(`${rows.length} cards -> ${path.relative(process.cwd(), DEST)}`);
};

main().catch(error => {
	console.error(error);
	process.exit(1);
});
