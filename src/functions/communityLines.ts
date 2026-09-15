import { getSupabase } from '@/functions/supabase';
import { stringToKey } from '@/functions';
import { CommunityLine } from '@/types/Account';

/** Colonnes de /community : tout sauf `data`, et le pseudo de l'auteur. */
const SELECT_COMMUNITY =
	'id, user_id, slug, title, cover, like_count, created_at, ' +
	'profiles!user_lines_user_id_fkey!inner(pseudo, avatar_url)';

export interface CommunitySort {
	label: string;
	column: 'like_count' | 'created_at' | 'title';
	ascending: boolean;
}

/**
 * Tris proposés dans la page. `likes` est le défaut : à égalité de likes — le
 * cas de loin le plus fréquent, zéro — c'est la plus récente qui passe devant,
 * d'où le départage systématique sur created_at.
 */
export const COMMUNITY_SORTS: Record<string, CommunitySort> = {
	likes: { label: 'Most liked', column: 'like_count', ascending: false },
	recent: { label: 'Newest', column: 'created_at', ascending: false },
	oldest: { label: 'Oldest', column: 'created_at', ascending: true },
	title: { label: 'Title (A-Z)', column: 'title', ascending: true },
};

export type CommunitySortKey = keyof typeof COMMUNITY_SORTS;

export const DEFAULT_SORT: CommunitySortKey = 'likes';

export const isCommunitySort = (value: any): value is CommunitySortKey =>
	typeof value === 'string' && value in COMMUNITY_SORTS;

export const COMMUNITY_PAGE_SIZE = 24;

export interface ListCommunityLinesParams {
	/** Titre ou nom de Digimon. Normalisé comme en base, cf. search_text. */
	search?: string;
	sort?: CommunitySortKey;
	page?: number;
}

/**
 * Une page de lignes publiques.
 *
 * La recherche est faite en base sur `search_text`, une colonne générée qui
 * aplatit le titre et les Digimon de la ligne en tokens normalisés. Le terme
 * passe par stringToKey(), exactement comme les tokens à l'écriture : « Greymon
 * X » retrouve donc « greymon_x ». Le résultat ne contenant que [a-z0-9], il ne
 * peut pas porter de joker `%` ou `_`.
 */
export const listCommunityLines = async ({
	search,
	sort = DEFAULT_SORT,
	page = 0,
}: ListCommunityLinesParams = {}): Promise<CommunityLine[]> => {
	const supabase = await getSupabase();
	const { column, ascending } = COMMUNITY_SORTS[sort] ?? COMMUNITY_SORTS[DEFAULT_SORT];

	let query = supabase
		.from('user_lines')
		.select(SELECT_COMMUNITY)
		.eq('is_public', true)
		.order(column, { ascending, nullsFirst: false });

	if (column !== 'created_at') {
		query = query.order('created_at', { ascending: false });
	}

	const key = search ? stringToKey(search) : '';
	if (key) {
		query = query.ilike('search_text', `%${key}%`);
	}

	const from = page * COMMUNITY_PAGE_SIZE;
	const { data, error } = await query.range(from, from + COMMUNITY_PAGE_SIZE - 1);

	if (error) throw error;
	return (data as unknown as CommunityLine[] | null) ?? [];
};

export const listLikedLineIds = async (
	userId: string,
	lineIds: string[]
): Promise<string[]> => {
	if (!lineIds.length) return [];
	const supabase = await getSupabase();
	const { data, error } = await supabase
		.from('line_likes')
		.select('line_id')
		.eq('user_id', userId)
		.in('line_id', lineIds);

	if (error) throw error;
	return (data ?? []).map(row => row.line_id);
};

export const setLineLike = async (
	lineId: string,
	userId: string,
	liked: boolean
): Promise<void> => {
	const supabase = await getSupabase();
	const { error } =
		liked ?
			await supabase.from('line_likes').insert({ line_id: lineId, user_id: userId })
		:	await supabase
				.from('line_likes')
				.delete()
				.eq('line_id', lineId)
				.eq('user_id', userId);

	if (error) throw error;
};

export const hasLikedLine = async (lineId: string, userId: string): Promise<boolean> =>
	(await listLikedLineIds(userId, [lineId])).length > 0;
