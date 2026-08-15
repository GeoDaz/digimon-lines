import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type { User } from '@supabase/supabase-js';
import {
	getSupabase,
	isAuthCallback,
	IS_SUPABASE_ENABLED,
	shouldRestoreSession,
} from '@/functions/supabase';
import { useToast } from '@/context/toast';
import { DEV_AUTH_EMAIL, DEV_AUTH_PASSWORD, IS_DEV } from '@/consts/env';
import { AuthProvider as OAuthProvider, Profile } from '@/types/Account';

interface AuthContextValue {
	user: User | null;
	profile: Profile | null;
	/** true tant que la session initiale n'a pas été résolue. */
	loading: boolean;
	enabled: boolean;
	signIn: (provider: OAuthProvider) => Promise<void>;
	signOut: () => Promise<void>;
	/** Compte de test disponible en local ; chaîne vide en production. */
	devEmail: string;
	signInAsDev: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
	user: null,
	profile: null,
	loading: true,
	enabled: false,
	signIn: async () => {},
	signOut: async () => {},
	devEmail: '',
	signInAsDev: async () => {},
});

/** Retire `?code=` & co. de la barre d'adresse une fois la session établie. */
const cleanAuthParamsFromUrl = () => {
	const url = new URL(window.location.href);
	['code', 'error', 'error_description', 'error_code'].forEach(param =>
		url.searchParams.delete(param)
	);
	if (url.hash.includes('access_token')) url.hash = '';
	window.history.replaceState({}, '', url.toString());
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(IS_SUPABASE_ENABLED);
	const { addToast } = useToast();

	const mounted = useRef(true);
	const unsubscribe = useRef<(() => void) | null>(null);

	/**
	 * Crée le client si besoin, échange un éventuel code OAuth, lit la session et
	 * s'abonne aux changements. Idempotent : appelé au montage, mais aussi après
	 * une connexion sans redirection (comptes de test), qui sinon ne
	 * déclencherait aucun listener.
	 */
	const ensureSession = useCallback(async () => {
		const supabase = await getSupabase();

		if (isAuthCallback()) {
			const params = new URLSearchParams(window.location.search);
			// exchangeCodeForSession attend le code seul, pas la query string.
			const code = params.get('code');
			const oauthError = params.get('error_description') || params.get('error');

			if (code) {
				const { error } = await supabase.auth.exchangeCodeForSession(code);
				if (error) {
					console.error('OAuth code exchange failed:', error);
					addToast(`Sign in failed: ${error.message}`, 'danger');
				}
			} else if (oauthError) {
				console.error('OAuth provider returned an error:', oauthError);
				addToast(`Sign in failed: ${oauthError}`, 'danger');
			}

			// Nettoyée même en cas d'échec, pour ne pas rejouer à chaque
			// rechargement un code déjà consommé.
			cleanAuthParamsFromUrl();
		}

		const { data } = await supabase.auth.getSession();
		if (!mounted.current) return;
		setUser(data.session?.user ?? null);
		setLoading(false);

		if (!unsubscribe.current) {
			const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
				if (!mounted.current) return;
				setUser(session?.user ?? null);
				setLoading(false);
			});
			unsubscribe.current = () => listener.subscription.unsubscribe();
			// Le composant a pu être démonté pendant l'import dynamique.
			if (!mounted.current) {
				unsubscribe.current();
				unsubscribe.current = null;
			}
		}
	}, [addToast]);

	useEffect(() => {
		mounted.current = true;

		// Visiteur anonyme : on ne charge même pas la librairie. Elle n'arrivera
		// que s'il clique sur « Sign in ».
		if (!shouldRestoreSession()) {
			setLoading(false);
			return () => {
				mounted.current = false;
			};
		}

		ensureSession().catch(error => {
			console.error('Failed to initialise Supabase:', error);
			if (mounted.current) setLoading(false);
		});

		return () => {
			mounted.current = false;
			unsubscribe.current?.();
			unsubscribe.current = null;
		};
	}, [ensureSession]);

	useEffect(() => {
		if (!user) {
			setProfile(null);
			return;
		}
		let active = true;

		const loadProfile = async () => {
			try {
				const supabase = await getSupabase();
				const { data, error } = await supabase
					.from('profiles')
					.select('*')
					.eq('id', user.id)
					.maybeSingle();

				if (!active) return;
				if (error) throw error;
				setProfile(data);
			} catch (error) {
				console.error('Failed to load profile:', error);
			}
		};

		loadProfile();
		return () => {
			active = false;
		};
	}, [user]);

	const signIn = useCallback(
		async (provider: OAuthProvider) => {
			try {
				const supabase = await getSupabase();
				const { error } = await supabase.auth.signInWithOAuth({
					provider,
					// On revient exactement là où l'utilisateur a cliqué.
					options: { redirectTo: window.location.href },
				});
				if (error) throw error;
			} catch (error) {
				console.error('Failed to sign in:', error);
				addToast('Sign in failed', 'danger');
			}
		},
		[addToast]
	);

	const signInAsDev = useCallback(async () => {
		if (!IS_DEV || !DEV_AUTH_EMAIL || !DEV_AUTH_PASSWORD) return;
		try {
			const supabase = await getSupabase();
			const { error } = await supabase.auth.signInWithPassword({
				email: DEV_AUTH_EMAIL,
				password: DEV_AUTH_PASSWORD,
			});
			if (error) throw error;
			// Pas de redirection ici : il faut (ré)accrocher le listener.
			await ensureSession();
			addToast(`Signed in as ${DEV_AUTH_EMAIL}`);
		} catch (error: any) {
			console.error('Dev sign in failed:', error);
			addToast(`Dev sign in failed: ${error?.message ?? 'unknown error'}`, 'danger');
		}
	}, [addToast, ensureSession]);

	const signOut = useCallback(async () => {
		try {
			const supabase = await getSupabase();
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			addToast('Signed out');
		} catch (error) {
			console.error('Failed to sign out:', error);
			addToast('Sign out failed', 'danger');
		}
	}, [addToast]);

	const value = useMemo(
		() => ({
			user,
			profile,
			loading,
			enabled: IS_SUPABASE_ENABLED,
			signIn,
			signOut,
			devEmail: DEV_AUTH_PASSWORD ? DEV_AUTH_EMAIL : '',
			signInAsDev,
		}),
		[user, profile, loading, signIn, signOut, signInAsDev]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
