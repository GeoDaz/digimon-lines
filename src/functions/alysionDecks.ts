import { getSupabase } from '@/functions/supabase';
import { stringToKey } from '@/functions';
import { DcgCard, loadDcgCards } from '@/functions/dcgCards';
import {
	AlysionCard,
	CardInfo,
	compareCards,
	DeckEntry,
	isAlysionCard,
	toAlysionCard,
} from '@/functions/alysionCards';
import { Database } from '@/types/supabase';

export type CommunityDeckRow = Database['public']['Tables']['alysion_decks']['Row'];

export interface CommunityDeck extends CommunityDeckRow {
	profiles: { pseudo: string; avatar_url: string | null } | null;
	liked?: boolean;
}

export interface DeckInput {
	title: string;
	description: string | null;
	colors: string[];
	cover: string | null;
	cards: DeckEntry[];
	wins: number;
	losses: number;
	best_rank: string | null;
	is_public: boolean;
}

const SELECT_DECK =
	'id, user_id, slug, title, description, colors, cover, cards, wins, losses, best_rank, ' +
	'is_public, like_count, title_key, created_at, updated_at, ' +
	'profiles!alysion_decks_user_id_fkey!inner(pseudo, avatar_url)';

export const DECK_SORTS = {
	likes: { label: 'Most liked', column: 'like_count', ascending: false },
	recent: { label: 'Newest', column: 'created_at', ascending: false },
	updated: { label: 'Recently updated', column: 'updated_at', ascending: false },
	wins: { label: 'Most wins', column: 'wins', ascending: false },
} as const;

export type DeckSortKey = keyof typeof DECK_SORTS;

export const isDeckSort = (value: unknown): value is DeckSortKey =>
	typeof value === 'string' && value in DECK_SORTS;

export const DECK_PAGE_SIZE = 24;

let pool: Promise<Map<string, DcgCard>> | null = null;

export const loadAlysionPool = (): Promise<Map<string, DcgCard>> =>
	(pool ??= loadDcgCards()
		.then(
			cards =>
				new Map(
					cards.filter(card => isAlysionCard(card.id)).map(card => [card.id, card])
				)
		)
		.catch(error => {
			pool = null;
			throw error;
		}));

export const cardInfo = (card: DcgCard | undefined): CardInfo | undefined =>
	card && { name: card.name, level: card.level, type: card.type, colors: card.colors };

export const resolveDeckCards = (
	entries: DeckEntry[],
	cards: Map<string, DcgCard>
): AlysionCard[] =>
	entries.map(entry => toAlysionCard(entry, cardInfo(cards.get(entry[0])))).sort(compareCards);

export const readDeckEntries = (value: unknown): DeckEntry[] =>
	Array.isArray(value) ?
		value.filter(
			(entry): entry is DeckEntry =>
				Array.isArray(entry) &&
				typeof entry[0] === 'string' &&
				typeof entry[1] === 'number' &&
				entry[1] > 0
		)
	:	[];

export const winRate = (wins: number, losses: number) =>
	wins + losses ? Math.round((wins / (wins + losses)) * 100) : null;

const makeSlug = (title: string) => {
	const base =
		title
			.normalize('NFD')
			.replace(/[̀-ͯ]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 48) || 'deck';
	return `${base}-${Math.random().toString(36).slice(2, 8)}`;
};

export const listCommunityDecks = async ({
	search = '',
	sort = 'likes',
	color = '',
	page = 0,
	userId,
}: {
	search?: string;
	sort?: DeckSortKey;
	color?: string;
	page?: number;
	userId?: string;
}): Promise<CommunityDeck[]> => {
	const supabase = await getSupabase();
	const { column, ascending } = DECK_SORTS[sort] ?? DECK_SORTS.likes;
	let query = supabase.from('alysion_decks').select(SELECT_DECK);
	query = userId ? query.eq('user_id', userId) : query.eq('is_public', true);
	query = query.order(column, { ascending });
	if (column !== 'created_at') query = query.order('created_at', { ascending: false });
	const key = search ? stringToKey(search) : '';
	if (key) query = query.ilike('title_key', `%${key}%`);
	if (color) query = query.contains('colors', [color]);
	const from = page * DECK_PAGE_SIZE;
	const { data, error } = await query.range(from, from + DECK_PAGE_SIZE - 1);
	if (error) throw error;
	return (data as unknown as CommunityDeck[] | null) ?? [];
};

export const fetchCommunityDeck = async (id: string): Promise<CommunityDeck | null> => {
	const supabase = await getSupabase();
	const { data, error } = await supabase
		.from('alysion_decks')
		.select(SELECT_DECK)
		.eq('id', id)
		.maybeSingle();
	if (error) throw error;
	return (data as unknown as CommunityDeck | null) ?? null;
};

export const saveCommunityDeck = async (
	userId: string,
	input: DeckInput,
	id?: string
): Promise<string> => {
	const supabase = await getSupabase();
	if (id) {
		const { error } = await supabase.from('alysion_decks').update(input).eq('id', id);
		if (error) throw error;
		return id;
	}
	const { data, error } = await supabase
		.from('alysion_decks')
		.insert({ ...input, user_id: userId, slug: makeSlug(input.title) })
		.select('id')
		.single();
	if (error) throw error;
	return data.id;
};

export const deleteCommunityDeck = async (id: string): Promise<void> => {
	const supabase = await getSupabase();
	const { error } = await supabase.from('alysion_decks').delete().eq('id', id);
	if (error) throw error;
};

export const listLikedDeckIds = async (userId: string, deckIds: string[]): Promise<string[]> => {
	if (!deckIds.length) return [];
	const supabase = await getSupabase();
	const { data, error } = await supabase
		.from('alysion_deck_likes')
		.select('deck_id')
		.eq('user_id', userId)
		.in('deck_id', deckIds);
	if (error) throw error;
	return (data ?? []).map(row => row.deck_id);
};

export const setDeckLike = async (deckId: string, userId: string, liked: boolean) => {
	const supabase = await getSupabase();
	const { error } =
		liked ?
			await supabase.from('alysion_deck_likes').insert({ deck_id: deckId, user_id: userId })
		:	await supabase
				.from('alysion_deck_likes')
				.delete()
				.eq('deck_id', deckId)
				.eq('user_id', userId);
	if (error) throw error;
};
