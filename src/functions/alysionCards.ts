import { DcgCardType } from '@/functions/dcgCards';

export type DeckEntry = [string, number];

export interface AlysionCard {
	id: string;
	name: string;
	level: number;
	type: DcgCardType;
	count: number;
	colors?: string[];
	restricted?: boolean;
}

export interface CardInfo {
	name: string;
	level: number;
	type: DcgCardType;
	colors: string[];
}

export const ALYSION_RESTRICTED = ['BT2-047', 'BT3-103'];

export const DECK_SIZE = 50;
export const MAX_EGGS = 5;
export const MAX_COPIES = 4;

export const ALYSION_COLORS = ['Red', 'Blue', 'Yellow', 'Green', 'Black', 'Purple', 'White'];

const POOL_ID = /^(BT[1-4]-\d{3}|ST[1-6]-\d{2}|P-0(0[1-9]|1\d|2[0-7])|BD0[1-4]-\d{2}|SD0[12]-\d{2})$/;

export const isAlysionCard = (id: string) => POOL_ID.test(id);

export const TIER_LABELS: Record<number, string> = {
	1: 'Tier 1',
	2: 'Tier 2',
	3: 'Tier 3',
	4: 'Rogue',
};

export const CARD_SECTIONS: Array<{ type: DcgCardType; title: string }> = [
	{ type: 'E', title: 'Digi-Eggs' },
	{ type: 'D', title: 'Digimon' },
	{ type: 'T', title: 'Tamers' },
	{ type: 'O', title: 'Options' },
];

const TYPE_ORDER: DcgCardType[] = ['E', 'D', 'T', 'O'];

export const fixCardType = (type: DcgCardType, level: number): DcgCardType =>
	type === 'D' && !level ? 'T' : type;

export const toAlysionCard = (
	[id, count]: DeckEntry,
	info: CardInfo | undefined
): AlysionCard => ({
	id,
	name: info?.name || id,
	level: info?.level || 0,
	type: fixCardType(info?.type || 'D', info?.level || 0),
	count,
	...(info?.colors && { colors: info.colors }),
	...(ALYSION_RESTRICTED.includes(id) && { restricted: true }),
});

export const compareCards = (a: AlysionCard, b: AlysionCard) =>
	TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) ||
	a.level - b.level ||
	a.id.localeCompare(b.id, 'en', { numeric: true });

export const countCards = (cards: AlysionCard[]) =>
	cards.reduce((sum, card) => sum + card.count, 0);

export const decklistText = (cards: AlysionCard[]) =>
	cards.map(card => `${card.count} ${card.id} ${card.name}`).join('\n');

export const validateDeck = (cards: AlysionCard[]): string[] => {
	const errors: string[] = [];
	const eggs = countCards(cards.filter(card => card.type === 'E'));
	const main = countCards(cards.filter(card => card.type !== 'E'));
	if (main !== DECK_SIZE) errors.push(`The main deck has ${main} cards instead of ${DECK_SIZE}.`);
	if (eggs > MAX_EGGS) errors.push(`The Digi-Egg deck has ${eggs} cards, ${MAX_EGGS} maximum.`);
	for (const card of cards) {
		const max = card.restricted ? 1 : MAX_COPIES;
		if (card.count > max) {
			errors.push(
				`${card.name} (${card.id}) is limited to ${max} ${max > 1 ? 'copies' : 'copy'}.`
			);
		}
	}
	return errors;
};

export const suggestColors = (cards: AlysionCard[]): string[] => {
	const copies: Record<string, number> = {};
	for (const card of cards) {
		if (card.type === 'E') continue;
		for (const color of card.colors || []) copies[color] = (copies[color] || 0) + card.count;
	}
	const sorted = Object.entries(copies).sort((a, b) => b[1] - a[1]);
	const top = sorted[0]?.[1] || 0;
	return sorted
		.filter(([color, count]) => color !== 'White' && count >= top / 3)
		.slice(0, 3)
		.map(([color]) => color);
};

export const suggestCover = (cards: AlysionCard[]): string | null => {
	const digimon = cards.filter(card => card.type === 'D');
	const best = [...digimon].sort((a, b) => b.level - a.level || b.count - a.count)[0];
	return best?.id || cards[0]?.id || null;
};

const DECKLIST_LINE = /^\s*(\d{1,2})\s*x?\s+([A-Za-z]{1,4}\d{0,2}-\d{1,3})\b/;

export const parseDecklist = (text: string): { entries: DeckEntry[]; invalid: string[] } => {
	const counts = new Map<string, number>();
	const invalid: string[] = [];
	for (const line of text.split(/\r?\n/)) {
		if (!line.trim()) continue;
		const match = DECKLIST_LINE.exec(line);
		if (!match) {
			invalid.push(line.trim());
			continue;
		}
		const id = match[2].toUpperCase();
		counts.set(id, (counts.get(id) || 0) + Number(match[1]));
	}
	return { entries: Array.from(counts.entries()), invalid };
};
