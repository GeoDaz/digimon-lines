export const DEV = 'development';
export const PROD = 'production';
export const TEST = 'test';
export const IS_DEV = process.env.NODE_ENV === DEV;
export const SITE_URL = 'https://digimon-lines.com';
// Clés publiques Supabase : elles sont embarquées dans le bundle client, c'est
// leur usage prévu. Toute la sécurité repose sur les policies RLS.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
// Compte de test pour se connecter en un clic en local, sans passer par le tour
// OAuth. C'est un vrai compte Supabase (vraie session, vraie RLS), pas une
// simulation. Neutralisé hors développement pour que ni l'adresse ni le mot de
// passe n'atterrissent dans le bundle de production.
export const DEV_AUTH_EMAIL =
	IS_DEV ? (process.env.NEXT_PUBLIC_DEV_AUTH_EMAIL ?? '').trim() : '';
export const DEV_AUTH_PASSWORD =
	IS_DEV ? process.env.NEXT_PUBLIC_DEV_AUTH_PASSWORD ?? '' : '';

export const DISCORD_URL = 'https://discord.gg/RJrEuN7cQs';
// TODO à confirmer : adresse affichée dans les pages légales et utilisée pour
// les demandes RGPD (accès, suppression de compte).
export const CONTACT_EMAIL = 'contact@digimon-lines.com';
/** Dernière révision des pages légales (/privacy et /terms). */
export const LEGAL_UPDATED_AT = '15 August 2026';
export const PUPPETEER_URL = 'https://digimon-lines-puppeteer.onrender.com';
export const DONATE_URL = 'https://ko-fi.com/digimonlines';
export const LINKTREE_URL = 'https://linktr.ee/azeralt';
