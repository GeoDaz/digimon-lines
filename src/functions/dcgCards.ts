export type DcgCardType = 'D' | 'E' | 'T' | 'O';

type DcgCardRow = [string, string, number, string[], DcgCardType, string?];

export interface DcgCard {
	id: string;
	name: string;
	level: number;
	colors: string[];
	type: DcgCardType;
	version?: string;
}

export const CARD_LEVELS: Record<number, string> = {
	2: 'Baby II',
	3: 'Rookie',
	4: 'Champion',
	5: 'Ultimate',
	6: 'Mega',
	7: 'Ultra',
};

export const DEFAULT_CARD_LEVELS = [2, 3, 4, 5, 6, 7];

export const cardImageUrl = (id: string) => `/api/card/${id}`;

let cache: Promise<DcgCard[]> | null = null;

export const loadDcgCards = (): Promise<DcgCard[]> =>
	(cache ??= fetch('/json/dcg/cards.json')
		.then(response => {
			if (!response.ok) throw new Error('Failed to load the card list');
			return response.json() as Promise<DcgCardRow[]>;
		})
		.then(rows =>
			rows.map(([id, name, level, colors, type, version]) => ({
				id,
				name,
				level,
				colors,
				type,
				version,
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

const compact = (value: string) => normalize(value).replace(/[^a-z0-9]/g, '');

export type NamePairs = Array<[string, string]>;

let namePairs: Promise<NamePairs> | null = null;

export const loadNamePairs = (): Promise<NamePairs> =>
	(namePairs ??= fetch('/json/dubnames.json')
		.then(response => (response.ok ? response.json() : {}))
		.then((names: Record<string, string>) =>
			Object.entries(names).map(([name, dub]) => [compact(name), compact(dub)] as [string, string])
		)
		.catch(() => {
			namePairs = null;
			return [];
		}));

const MIN_ALIAS_LENGTH = 3;
const MAX_ALIASES = 12;

const aliasesFor = (query: string, pairs: NamePairs): string[] => {
	const target = compact(query);
	if (target.length < MIN_ALIAS_LENGTH) return [];
	const aliases = new Set<string>();
	for (const [name, dub] of pairs) {
		for (const [from, to] of [
			[name, dub],
			[dub, name],
		]) {
			if (from === to) continue;
			if (from.startsWith(target)) aliases.add(to);
			else if (target.startsWith(from)) aliases.add(to + target.slice(from.length));
		}
		if (aliases.size >= MAX_ALIASES) break;
	}
	return Array.from(aliases);
};

export const searchDcgCards = (
	cards: DcgCard[],
	query: string,
	level: number | null,
	pairs: NamePairs = [],
	limit = 60
): DcgCard[] => {
	const terms = normalize(query).split(/\s+/).filter(Boolean);
	const aliases = aliasesFor(query, pairs);
	const results: DcgCard[] = [];
	for (const card of cards) {
		if (level && card.level !== level) continue;
		const haystack = normalize(`${card.name} ${card.id}`);
		const compactName = compact(card.name);
		if (
			terms.every(term => haystack.includes(term)) ||
			aliases.some(alias => compactName.includes(alias))
		) {
			results.push(card);
			if (results.length >= limit) break;
		}
	}
	return results;
};
