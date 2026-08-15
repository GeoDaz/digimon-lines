import { getSupabase } from '@/functions/supabase';
import { Database } from '@/types/supabase';

export type AdminProfile =
	Database['public']['Functions']['admin_list_profiles']['Returns'][number];

/**
 * Liste des comptes pour la page d'administration.
 *
 * Passe par un RPC `security definer` qui ne renvoie que des compteurs : le
 * contenu des lignes privées reste inaccessible, conformément à la politique de
 * confidentialité du site. Un appelant non administrateur reçoit zéro ligne, le
 * filtrage étant fait en base et non dans l'interface.
 */
export const listAdminProfiles = async (search?: string): Promise<AdminProfile[]> => {
	const supabase = await getSupabase();
	// Le filtre est appliqué en base : chercher une adresse email ne la fait pas
	// transiter par un tri côté client sur la liste complète.
	const { data, error } = await supabase.rpc('admin_list_profiles', {
		search: search?.trim() || undefined,
	});
	if (error) throw error;
	return data ?? [];
};

/** Réservé aux administrateurs : un trigger rejette tout autre appelant. */
export const setLineQuota = async (profileId: string, quota: number): Promise<void> => {
	const supabase = await getSupabase();
	const { error } = await supabase
		.from('profiles')
		.update({ line_quota: quota })
		.eq('id', profileId);
	if (error) throw error;
};
