import { Regulations } from '@/consts/yugioh/limitations';
import { Card } from '@/types/YugiohCard';
import { Deck, DeckSource } from '@/types/YugiohDeck';

interface TopDeck extends DeckSource {
	main: string[];
	extra: string[];
}

interface TopDecks {
	cards: Record<string, Card>;
	md: TopDeck[];
	tcg: TopDeck[];
	ocg: TopDeck[];
}

const DECKS_BY_REGULATION: Record<Regulations, 'md' | 'tcg' | 'ocg'> = {
	[Regulations.md]: 'md',
	[Regulations.dl]: 'md',
	[Regulations.tcg]: 'tcg',
	[Regulations.ocg]: 'ocg',
};

let cache: Promise<TopDecks> | null = null;

const loadTopDecks = (): Promise<TopDecks> =>
	(cache ??= fetch('/json/ygo/top-decks.json')
		.then(response => {
			if (!response.ok) throw new Error('Failed to load the top decks');
			return response.json() as Promise<TopDecks>;
		})
		.catch(error => {
			cache = null;
			throw error;
		}));

export const randomTopDeck = async (regulation: Regulations): Promise<Deck> => {
	const data = await loadTopDecks();
	const decks = data[DECKS_BY_REGULATION[regulation]];
	if (!decks.length) throw new Error('No top deck for this format');
	const { main, extra, ...source } = decks[Math.floor(Math.random() * decks.length)];
	const toCards = (ids: string[]) =>
		ids.map(id => data.cards[id]).filter((card): card is Card => !!card);
	return { mainDeck: toCards(main), extraDeck: toCards(extra), source };
};
