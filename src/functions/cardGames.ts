import type { ColorPalette } from '@/functions/cardCanvas';
import {
	CARD_LEVELS,
	DEFAULT_CARD_LEVELS,
	cardImageUrl,
	loadDcgCards,
	loadNamePairs,
	searchDcgCards,
} from '@/functions/dcgCards';
import { loadPokemonCards, searchPokemonCards } from '@/functions/pokemonCards';
import { loadYugiohCards, searchYugiohCards } from '@/functions/yugiohCards';

export interface GameCard {
	id: string;
	name: string;
	level: number;
	colors: string[];
	thumbnail: string;
	image: string;
	code?: string;
	version?: string;
}

export const cardTitle = (card: GameCard) =>
	[card.name, card.code, card.version].filter(Boolean).join(' - ');

export type CardSearch = (query: string, level: number | null) => GameCard[];

export interface CardGame {
	storageKey: string;
	palette: ColorPalette;
	fallbackColors: string[];
	defaultCustomColors: string[];
	levels: Record<number, string> | null;
	defaultLevels: number[];
	cardId: RegExp;
	searchPlaceholder: string;
	loadCards: () => Promise<GameCard[]>;
	prepareSearch: () => Promise<CardSearch>;
}

export const DIGIMON_COLORS: ColorPalette = {
	Red: '#e8243a',
	Blue: '#1e90e6',
	Yellow: '#f5c400',
	Green: '#13a86b',
	Black: '#121218',
	Purple: '#8a4fd0',
	White: '#d9dce4',
};

export const POKEMON_COLORS: ColorPalette = {
	Grass: '#4fae47',
	Fire: '#e8542a',
	Water: '#2f8fe0',
	Electric: '#f5cd1e',
	Psychic: '#9b59c6',
	Fighting: '#c0612b',
	Darkness: '#1f2430',
	Steel: '#9aa3ad',
	Dragon: '#b39a2e',
	Fairy: '#e67fb5',
	Normal: '#d8d8d0',
};

export const YUGIOH_COLORS: ColorPalette = {
	Normal: '#d8b25c',
	Effect: '#c8743a',
	Ritual: '#4d7fc4',
	Fusion: '#8b55a8',
	Synchro: '#e6e6ea',
	Xyz: '#23232a',
	Link: '#234f93',
	Pendulum: '#3aa596',
	Token: '#9a9a9a',
	Spell: '#1d9a86',
	Trap: '#b23a7f',
};

let digimonCards: Promise<GameCard[]> | null = null;

const loadDigimonCards = () =>
	(digimonCards ??= loadDcgCards()
		.then(cards =>
			cards.map(card => ({
				id: card.id,
				name: card.name,
				level: card.level,
				colors: card.colors,
				thumbnail: cardImageUrl(card.id),
				image: cardImageUrl(card.id),
				code: card.id,
				version: card.version,
			}))
		)
		.catch(error => {
			digimonCards = null;
			throw error;
		}));

export const DIGIMON_GAME: CardGame = {
	storageKey: 'card-line',
	palette: DIGIMON_COLORS,
	fallbackColors: ['Yellow', 'Purple'],
	defaultCustomColors: ['Purple', 'Blue'],
	levels: CARD_LEVELS,
	defaultLevels: DEFAULT_CARD_LEVELS,
	cardId: /^[A-Z]{1,4}\d{0,2}-\d{1,3}(_P\d{1,2})?$/,
	searchPlaceholder: 'Digimon name or card number (BT1-010)',
	loadCards: loadDigimonCards,
	prepareSearch: async () => {
		const [cards, gameCards, pairs] = await Promise.all([
			loadDcgCards(),
			loadDigimonCards(),
			loadNamePairs(),
		]);
		const byId = new Map(gameCards.map(card => [card.id, card]));
		return (query, level) =>
			searchDcgCards(cards, query, level, pairs, Infinity)
				.map(card => byId.get(card.id))
				.filter((card): card is GameCard => !!card);
	},
};

export const POKEMON_GAME: CardGame = {
	storageKey: 'pokemon-card-line',
	palette: POKEMON_COLORS,
	fallbackColors: ['Fire', 'Water'],
	defaultCustomColors: ['Psychic', 'Water'],
	levels: null,
	defaultLevels: [0, 0, 0],
	cardId: /^[A-Za-z0-9.-]{1,40}$/,
	searchPlaceholder: 'Pokémon name (English or French) or card number (sv03.5-006)',
	loadCards: loadPokemonCards,
	prepareSearch: async () => {
		const cards = await loadPokemonCards();
		return query => searchPokemonCards(cards, query, Infinity);
	},
};

export const YUGIOH_GAME: CardGame = {
	storageKey: 'yugioh-card-line',
	palette: YUGIOH_COLORS,
	fallbackColors: ['Spell', 'Trap'],
	defaultCustomColors: ['Xyz', 'Fusion'],
	levels: null,
	defaultLevels: [0, 0, 0],
	cardId: /^[0-9a-f]{24}$/,
	searchPlaceholder: 'Card name',
	loadCards: loadYugiohCards,
	prepareSearch: async () => {
		const cards = await loadYugiohCards();
		return query => searchYugiohCards(cards, query, Infinity);
	},
};
