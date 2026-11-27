import { DcgCardType } from '@/functions/dcgCards';
import {
	ALYSION_RESTRICTED,
	AlysionCard,
	compareCards,
	DeckEntry,
	toAlysionCard,
} from '@/functions/alysionCards';

export type { AlysionCard } from '@/functions/alysionCards';
export { CARD_SECTIONS, decklistText, TIER_LABELS } from '@/functions/alysionCards';

type CardRow = [string, string, number, string[], DcgCardType, string?];
type Entry = DeckEntry;

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

const loadRaw = (): { updated: string; decks: RawDeck[] } =>
	require('../../public/json/alysion/decks.json');

const loadCards = (): Map<string, CardRow> =>
	new Map((require('../../public/json/dcg/cards.json') as CardRow[]).map(row => [row[0], row]));

const toCard = (cards: Map<string, CardRow>, entry: Entry): AlysionCard => {
	const row = cards.get(entry[0]);
	return toAlysionCard(entry, row && { name: row[1], level: row[2], type: row[4], colors: row[3] });
};

export const getAlysionUpdated = () => loadRaw().updated;

export const getAlysionRestricted = (): AlysionCard[] => {
	const cards = loadCards();
	return ALYSION_RESTRICTED.map(id => toCard(cards, [id, 1]));
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
