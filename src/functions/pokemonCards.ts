import type { GameCard } from '@/functions/cardGames';

type PokemonRow = [string, string, string, string[], 'P' | 'T' | 'E', string?];

interface PokemonCardList {
	sets: Record<string, string>;
	cards: PokemonRow[];
}

export interface PokemonCard extends GameCard {
	frenchName: string;
	category: 'P' | 'T' | 'E';
}

const imagePath = (row: PokemonRow, sets: Record<string, string>) => {
	if (row[5]) return row[5];
	const split = row[0].lastIndexOf('-');
	const set = row[0].slice(0, split);
	return `en/${sets[set]}/${set}/${row[0].slice(split + 1)}`;
};

let cache: Promise<PokemonCard[]> | null = null;

export const loadPokemonCards = (): Promise<PokemonCard[]> =>
	(cache ??= fetch('/json/pkm/cards.json')
		.then(response => {
			if (!response.ok) throw new Error('Failed to load the card list');
			return response.json() as Promise<PokemonCardList>;
		})
		.then(({ sets, cards }) =>
			cards.map(row => {
				const path = `/api/pokemon-card/${imagePath(row, sets)}`;
				return {
					id: row[0],
					name: row[1],
					frenchName: row[2],
					colors: row[3],
					category: row[4],
					level: 0,
					thumbnail: `${path}/low`,
					image: `${path}/high`,
				};
			})
		)
		.catch(error => {
			cache = null;
			throw error;
		}));

const normalize = (value: string) =>
	value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();

export const searchPokemonCards = (
	cards: PokemonCard[],
	query: string,
	limit = 60
): GameCard[] => {
	const terms = normalize(query).split(/\s+/).filter(Boolean);
	const results: GameCard[] = [];
	for (const card of cards) {
		const haystack = normalize(`${card.name} ${card.frenchName} ${card.id}`);
		if (terms.every(term => haystack.includes(term))) {
			results.push(card);
			if (results.length >= limit) break;
		}
	}
	return results;
};
