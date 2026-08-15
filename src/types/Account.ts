import { Database } from '@/types/supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export type UserLineRow = Database['public']['Tables']['user_lines']['Row'];
export type UserLineInsert = Database['public']['Tables']['user_lines']['Insert'];

export type AuthProvider = 'google' | 'discord';

/** Une ligne publique accompagnée du pseudo de son auteur, en une seule requête. */
export interface UserLineWithAuthor extends UserLineRow {
	profiles: Pick<Profile, 'pseudo' | 'avatar_url'> | null;
}
