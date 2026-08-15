import { getSupabase } from '@/functions/supabase';
import { prepareLineExport, stripUploadedImages } from '@/functions/line';
import Line from '@/types/Line';
import { UserLineRow, UserLineWithAuthor } from '@/types/Account';
import { Json } from '@/types/supabase';

/** Doit rester compatible avec la contrainte SQL : ^[a-z0-9_-]{1,64}$ */
export const slugifyLine = (title: string): string => {
	const slug = title
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 64)
		.replace(/-+$/g, '');
	return slug || 'line';
};

const SELECT_WITH_AUTHOR = '*, profiles!inner(pseudo, avatar_url)';

export interface SaveUserLineParams {
	userId: string;
	slug: string;
	title?: string;
	line: Line;
	isPublic: boolean;
	/** Nom du Digimon de couverture, résolu en /images/digimon/<cover>.jpg. */
	cover?: string;
}

/**
 * Upsert sur (user_id, slug) : réenregistrer sous le même titre écrase la ligne
 * au lieu d'en créer une seconde.
 */
export const saveUserLine = async ({
	userId,
	slug,
	title,
	line,
	isPublic,
	cover,
}: SaveUserLineParams): Promise<UserLineRow> => {
	const supabase = await getSupabase();
	const { data, error } = await supabase
		.from('user_lines')
		.upsert(
			{
				user_id: userId,
				slug,
				title: title || null,
				// Même sérialisation que l'export "Save as Code", moins les
				// images uploadées. Le retrait est fait ici, au plus près de
				// l'écriture, pour que l'invariant tienne quel que soit
				// l'appelant.
				data: prepareLineExport(stripUploadedImages(line)) as unknown as Json,
				is_public: isPublic,
				cover: cover || null,
			},
			{ onConflict: 'user_id,slug' }
		)
		.select()
		.single();

	if (error) throw error;
	return data;
};

/**
 * Ligne déjà enregistrée sous ce slug, ou null. Sert à distinguer une création
 * d'une mise à jour : au premier enregistrement on demande toujours la
 * couverture plutôt que d'en imposer une. Renvoie aussi la couverture courante,
 * pour qu'un réenregistrement ne l'efface pas.
 */
export const findUserLineBySlug = async (
	userId: string,
	slug: string
): Promise<Pick<UserLineRow, 'id' | 'cover'> | null> => {
	const supabase = await getSupabase();
	const { data, error } = await supabase
		.from('user_lines')
		.select('id, cover')
		.eq('user_id', userId)
		.eq('slug', slug)
		.maybeSingle();

	if (error) throw error;
	return data;
};

/**
 * Renomme le profil. La contrainte d'unicité et le format sont vérifiés en
 * base : l'erreur remonte telle quelle pour être traduite côté interface.
 */
export const updatePseudo = async (userId: string, pseudo: string): Promise<void> => {
	const supabase = await getSupabase();
	const { error } = await supabase
		.from('profiles')
		.update({ pseudo })
		.eq('id', userId);

	if (error) throw error;
};

export const setUserLineVisibility = async (
	id: string,
	isPublic: boolean
): Promise<void> => {
	const supabase = await getSupabase();
	const { error } = await supabase
		.from('user_lines')
		.update({ is_public: isPublic })
		.eq('id', id);

	if (error) throw error;
};

export const deleteUserLine = async (id: string): Promise<void> => {
	const supabase = await getSupabase();
	const { error } = await supabase.from('user_lines').delete().eq('id', id);
	if (error) throw error;
};

/**
 * Ligne partagée : une seule requête pour la ligne et son auteur. Renvoie null
 * si elle n'existe pas ou si la RLS la masque (ligne privée d'un tiers).
 */
export const fetchSharedLine = async (
	pseudo: string,
	slug: string
): Promise<UserLineWithAuthor | null> => {
	const supabase = await getSupabase();
	const { data, error } = await supabase
		.from('user_lines')
		.select(SELECT_WITH_AUTHOR)
		.eq('profiles.pseudo', pseudo)
		.eq('slug', slug)
		.maybeSingle();

	if (error) throw error;
	return (data as UserLineWithAuthor | null) ?? null;
};

/**
 * Lignes d'un profil, pour /profile/<pseudo>.
 *
 * Pas de filtre sur is_public : la policy RLS renvoie les lignes publiques à
 * tout le monde et, en plus, ses propres lignes privées au propriétaire. La
 * page « My lines » est donc littéralement la même que la page publique, vue
 * par son auteur.
 */
export const listProfileLines = async (pseudo: string): Promise<UserLineWithAuthor[]> => {
	const supabase = await getSupabase();
	const { data, error } = await supabase
		.from('user_lines')
		.select(SELECT_WITH_AUTHOR)
		.eq('profiles.pseudo', pseudo)
		.order('updated_at', { ascending: false });

	if (error) throw error;
	return (data as UserLineWithAuthor[] | null) ?? [];
};
