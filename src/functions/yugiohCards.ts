import type { GameCard } from '@/functions/cardGames';

type YugiohRow = [string, string, string, 1?];

let cache: Promise<GameCard[]> | null = null;

export const loadYugiohCards = (): Promise<GameCard[]> =>
	(cache ??= fetch('/json/ygo/cards.json')
		.then(response => {
			if (!response.ok) throw new Error('Failed to load the card list');
			return response.json() as Promise<YugiohRow[]>;
		})
		.then(rows =>
			rows.map(([id, name, frame, alternateArt]) => ({
				id,
				name,
				level: 0,
				colors: [frame],
				thumbnail: `/api/yugioh-card/${id}/w260`,
				image: `/api/yugioh-card/${id}/w420`,
				version: alternateArt ? 'Alt art' : undefined,
			}))
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

export const searchYugiohCards = (cards: GameCard[], query: string, limit = 60): GameCard[] => {
	const terms = normalize(query).split(/\s+/).filter(Boolean);
	const results: GameCard[] = [];
	for (const card of cards) {
		const name = normalize(card.name);
		if (terms.every(term => name.includes(term))) {
			results.push(card);
			if (results.length >= limit) break;
		}
	}
	return results;
};
