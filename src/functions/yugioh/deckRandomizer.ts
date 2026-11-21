import { Deck } from '@/types/YugiohDeck';
import { Card } from '@/types/YugiohCard';
import { getRegulationRelease, getLimitationValue, isExtraDeck } from './card';
import { Regulations } from '@/consts/yugioh/limitations';
import { STAPLE_MIN_DECK_TYPES } from '@/consts/yugioh/deck';

export type RandomizeDeckArgs = {
	cards: Record<string, Card>;
	names: Record<Card['name'], Card['_id']>;
	mainCards: Card['_id'][];
	extraCards: Card['_id'][];
	staples: Card['_id'][];
	regulation?: Regulations;
	consistency?: number;
};

export const randomizeDeck = ({
	cards,
	names,
	mainCards,
	extraCards,
	staples,
	regulation = Regulations.md,
	consistency = 1,
}: RandomizeDeckArgs): Promise<Deck> => {
	const mainDeck: Deck['mainDeck'] = [];
	const extraDeck: Deck['extraDeck'] = [];
	const joinedCards: Set<string> = new Set();

	const generateDeck = (deck: Card[], cardPool: string[], limit: number) => {
		let i = 0;
		do {
			i++;
			const rid = getRandomCard(cardPool);
			const card = cards[rid];
			addCard(card, deck);
		} while (deck.length < limit && i < limit * 3);
	};

	const getRandomCard = (array: any[]) =>
		array[Math.floor(Math.random() * array.length)];

	const addCard = (card: Card, deck: Card[], limit?: number) => {
		if (!card || !card.name) return;
		if (!cardIsAddable(card, deck, limit)) return;

		if (consistency > 0) {
			const cascadeCards = getCascadeCards(card);
			if (cascadeCards.length > 0) {
				deck.push({ ...card, required: true });
				cascadeCards.forEach(c => {
					if (isExtraDeck(c)) {
						addCard(c, extraDeck, 1);
					} else {
						addCard(c, mainDeck, 1);
					}
				});
			} else {
				deck.push(card);
			}
		} else {
			deck.push(card);
		}
	};

	const cardIsAddable = (card: Card, array: Card[], limit: number = 3) => {
		const cardRelease = getRegulationRelease(card, regulation);
		if (!cardRelease) return false;
		const cardLimit = getLimitationValue(card, regulation);
		if (cardLimit === 0) return false;
		const calculatedLimit = cardLimit == null ? limit : Math.min(cardLimit, limit);
		return array.filter(c => c._id === card._id).length < calculatedLimit;
	};

	const getCascadeCards = (card: Card): Card[] => {
		joinedCards.add(card.name);
		if (!card.description) return [];
		let matches: string[] | null = card.description.match(/"([^"]+)"/g);
		if (!matches) return [];
		matches = Array.from(new Set(matches))
			.map(match => match.slice(1, -1)) // remove quotes
			.filter(name => !joinedCards.has(name)); // remove cards which joined or is joined

		// if consistency is limited add to joinedCards after processing
		if (consistency < 2) {
			matches.forEach(v => joinedCards.add(v));
		}

		return matches
			.map(name => {
				let card = cards[names[name]];
				if (!card) {
					const archetypeCards = mainCards.filter(c =>
						cards[c].name.includes(name)
					);
					if (archetypeCards.length === 0) return null;
					const cardId = getRandomCard(archetypeCards);
					card = cards[cardId];
				}
				return { ...card, required: true };
			})
			.filter(card => card !== null) as Card[];
	};

	const gapDeck = (deck: Card[], limit: number, maxLimit: number = limit) => {
		if (deck.length > limit) {
			// Remove non-required cards from the end until we reach 40 cards
			let i = deck.length - 1;
			while (deck.length > limit && i >= 0) {
				if (!deck[i].required) {
					deck.splice(i, 1);
				}
				i--;
			}
			// If we still have more than maxLimit cards after removing non-required cards,
			// then remove the excess cards from the end
			if (deck.length > maxLimit) {
				deck.splice(maxLimit, deck.length - maxLimit);
			}
		}
	};

	const orderDeck = (deck: Card[]) => {
		deck.sort((a, b) => {
			let aRef = getDeckTypeForOrder(a);
			let bRef = getDeckTypeForOrder(b);
			if (aRef == null) {
				if (bRef == null) return 0;
				return 1;
			}
			if (bRef == null) return -1;
			if (aRef === bRef) {
				aRef = a.name;
				bRef = b.name;
			}
			return aRef.localeCompare(bRef);
		});
	};

	const getDeckTypeForOrder = (card: Card): string | null => {
		if (card.archetype) return card.archetype;
		if (card.deckTypes.length === 0) return null;
		if (card.deckTypes.length === 1) return card.deckTypes[0];
		if (card.deckTypes.length >= STAPLE_MIN_DECK_TYPES) return '1';
		return card.deckTypes.sort((a, b) => a.localeCompare(b))[0];
	};

	return new Promise(resolve => {
		generateDeck(mainDeck, staples, 9);
		generateDeck(extraDeck, extraCards, 15);
		generateDeck(mainDeck, mainCards, 40);

		gapDeck(mainDeck, 40, 60);
		gapDeck(extraDeck, 15);

		orderDeck(mainDeck);
		orderDeck(extraDeck);

		resolve({ mainDeck, extraDeck });
	});
};
