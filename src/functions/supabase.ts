import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/consts/env';
import { Database } from '@/types/supabase';

/**
 * Le site reste 100 % statique côté Netlify : le navigateur parle directement à
 * Supabase avec la clé publishable, et les policies RLS font la sécurité. Aucune
 * Netlify Function n'est impliquée, donc aucun crédit de compute consommé.
 */

export const IS_SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Supabase range la session sous une clé `sb-<ref>-auth-token`. */
const hasStoredSession = (): boolean => {
	try {
		for (let i = 0; i < window.localStorage.length; i++) {
			const key = window.localStorage.key(i);
			if (key?.startsWith('sb-') && key.endsWith('-auth-token')) return true;
		}
	} catch {
		// localStorage indisponible (navigation privée, cookies bloqués).
	}
	return false;
};

/** Retour d'un provider OAuth : `?code=` en PKCE, `#access_token=` en implicite. */
export const isAuthCallback = (): boolean =>
	/[?&]code=/.test(window.location.search) ||
	/[?&]error=/.test(window.location.search) ||
	window.location.hash.includes('access_token');

/**
 * Faut-il initialiser le client au chargement de la page ? Non pour un visiteur
 * anonyme : il ne télécharge alors jamais la librairie. Le client sera créé à la
 * demande s'il clique sur « Sign in ».
 */
export const shouldRestoreSession = (): boolean =>
	IS_SUPABASE_ENABLED &&
	typeof window !== 'undefined' &&
	(hasStoredSession() || isAuthCallback());

let clientPromise: Promise<SupabaseClient<Database>> | null = null;

/**
 * Singleton paresseux, avec import dynamique : la librairie (~35 Ko gzip) part
 * dans un chunk séparé au lieu du bundle commun, pour ne pas la faire payer aux
 * visiteurs qui ne se connectent jamais. Sans les variables d'env (clone du repo
 * sans .env.local), l'import ne casse pas le build, seul l'appel échoue.
 */
export const getSupabase = (): Promise<SupabaseClient<Database>> => {
	if (!IS_SUPABASE_ENABLED) {
		return Promise.reject(
			new Error(
				'Supabase is not configured: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.'
			)
		);
	}
	if (!clientPromise) {
		clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
			createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
				auth: {
					persistSession: true,
					autoRefreshToken: true,
					// L'échange du `?code=` est fait explicitement dans le contexte
					// d'auth : on peut ainsi remonter l'erreur à l'utilisateur et
					// nettoyer l'URL, au lieu d'un échec silencieux.
					detectSessionInUrl: false,
					flowType: 'pkce',
				},
			})
		);
	}
	return clientPromise;
};

export default getSupabase;
