import { Card } from './YugiohCard';

export type DeckSource = {
	name: string;
	author?: string;
	event?: string;
	date?: string;
	url?: string;
};

export type Deck = {
	mainDeck: Card[];
	extraDeck: Card[];
	source?: DeckSource;
};
