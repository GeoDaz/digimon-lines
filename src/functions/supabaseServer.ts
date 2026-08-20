import type { SupabaseClient } from '@supabase/supabase-js';
import { IS_SUPABASE_ENABLED } from '@/functions/supabase';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/consts/env';
import { Database } from '@/types/supabase';

let clientPromise: Promise<SupabaseClient<Database>> | null = null;

// Rendu serveur toujours anonyme : la session vit dans le navigateur, la RLS ne
// renvoie donc que les lignes publiques.
export const getServerSupabase = (): Promise<SupabaseClient<Database>> => {
	if (!IS_SUPABASE_ENABLED) {
		return Promise.reject(new Error('Supabase is not configured.'));
	}
	if (!clientPromise) {
		clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
			createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
				auth: {
					persistSession: false,
					autoRefreshToken: false,
					detectSessionInUrl: false,
				},
			})
		);
	}
	return clientPromise;
};

export default getServerSupabase;
