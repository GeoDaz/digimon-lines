import { DcgCardType } from '@/functions/dcgCards';

type CardRow = [string, string, number, string[], DcgCardType, string?];
type Entry = [string, number];

interface RawDeck {
	slug: string;
	name: string;
	colors: string[];
	tier: number;
	style: string;
	summary: string;
	keyCards: string[];
	eggs: Entry[];
	main: Entry[];
	source: string;
}

export interface AlysionCard {
	id: string;
	name: string;
	level: number;
	type: DcgCardType;
	count: number;
	restricted?: boolean;
}

export interface AlysionDeckSummary {
	slug: string;
	name: string;
	colors: string[];
	tier: number;
	style: string;
	cover: string;
	coverName: string;
}

export interface AlysionDeck extends Omit<AlysionDeckSummary, 'cover' | 'coverName'> {
	summary: string;
	keyCards: AlysionCard[];
	cards: AlysionCard[];
	source: string;
}

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

const loadRaw = (): { updated: string; restricted: string[]; decks: RawDeck[] } =>
	require('../../public/json/alysion/decks.json');

const loadCards = (): Map<string, CardRow> =>
	new Map((require('../../public/json/dcg/cards.json') as CardRow[]).map(row => [row[0], row]));

const toCard = (cards: Map<string, CardRow>, [id, count]: Entry): AlysionCard => {
	const row = cards.get(id);
	const restricted = loadRaw().restricted.includes(id);
	const level = row?.[2] || 0;
	const type = row?.[4] || 'D';
	return {
		id,
		name: row?.[1] || id,
		level,
		type: type === 'D' && !level ? 'T' : type,
		count,
		...(restricted && { restricted }),
	};
};

const compareCards = (a: AlysionCard, b: AlysionCard) =>
	TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) ||
	a.level - b.level ||
	a.id.localeCompare(b.id, 'en', { numeric: true });

export const getAlysionUpdated = () => loadRaw().updated;

export const getAlysionRestricted = (): AlysionCard[] => {
	const cards = loadCards();
	return loadRaw().restricted.map(id => toCard(cards, [id, 1]));
};

export const getAlysionSlugs = () => loadRaw().decks.map(deck => deck.slug);

export const getAlysionDeckSummaries = (): AlysionDeckSummary[] => {
	const cards = loadCards();
	return loadRaw().decks.map(({ slug, name, colors, tier, style, keyCards }) => ({
		slug,
		name,
		colors,
		tier,
		style,
		cover: keyCards[0],
		coverName: cards.get(keyCards[0])?.[1] || name,
	}));
};

export const getAlysionDeck = (slug: string): AlysionDeck | null => {
	const deck = loadRaw().decks.find(item => item.slug === slug);
	if (!deck) return null;
	const cards = loadCards();
	const list = [...deck.eggs, ...deck.main].map(entry => toCard(cards, entry)).sort(compareCards);
	const { eggs: _eggs, main: _main, keyCards, ...rest } = deck;
	return {
		...rest,
		keyCards: keyCards.map(id => list.find(card => card.id === id) || toCard(cards, [id, 0])),
		cards: list,
	};
};

export const decklistText = (cards: AlysionCard[]) =>
	cards.map(card => `${card.count} ${card.id} ${card.name}`).join('\n');
