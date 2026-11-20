const fs = require('fs');
const path = require('path');

const SOURCE =
	'https://raw.githubusercontent.com/TakaOtaku/Digimon-Card-App/main/src/assets/cardlists/PreparedDigimonCardsENG.json';
const DEST = path.join(__dirname, '..', 'public', 'json', 'dcg', 'cards.json');

const TYPES = { Digimon: 'D', 'Digi-Egg': 'E', Tamer: 'T', Option: 'O', 'Digimon/Option': 'D' };

const level = value => {
	const match = /Lv\.(\d+)/.exec(value || '');
	return match ? Number(match[1]) : 0;
};

const main = async () => {
	const response = await fetch(SOURCE);
	if (!response.ok) throw new Error(`Download failed: ${response.status}`);
	const cards = await response.json();

	const seen = new Set();
	const compact = cards
		.filter(card => card.id && card.name?.english && TYPES[card.cardType])
		.filter(card => !seen.has(card.id) && seen.add(card.id))
		.map(card => {
			const version = (card.version || '').trim();
			const entry = [
				card.id,
				card.name.english.trim(),
				level(card.cardLv),
				(card.color || '').split('/').filter(Boolean),
				TYPES[card.cardType],
			];
			if (version && version !== 'Normal') entry.push(version);
			return entry;
		})
		.sort((a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0], 'en', { numeric: true }));

	fs.mkdirSync(path.dirname(DEST), { recursive: true });
	fs.writeFileSync(DEST, JSON.stringify(compact));
	console.log(`${compact.length} cards -> ${path.relative(process.cwd(), DEST)}`);
};

main().catch(error => {
	console.error(error);
	process.exit(1);
});
