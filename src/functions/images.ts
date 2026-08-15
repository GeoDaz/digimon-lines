import { DIGIEGG, DIGIMON, GROUP } from '@/consts/ui';
import { formatPokemonFileName } from './file';

/**
 * Une image "uploadée" est stockée en data URI base64 dans le JSON de la ligne,
 * contrairement à une image d'URL qui n'y pèse que la longueur de son adresse.
 * Ce sont les seules qui menacent la limite de poids d'une ligne.
 */
export const isUploadedImage = (image?: string): boolean =>
	!!image && image.startsWith('data:');

/**
 * Poids réel d'une chaîne une fois écrite en base, en octets UTF-8 : c'est ce
 * que compte `octet_length` côté Postgres.
 */
export const byteSize = (value: string): number => new TextEncoder().encode(value).length;

/** Affichage court d'un poids, pour les messages destinés à l'utilisateur. */
export const formatBytes = (bytes: number): string => {
	if (bytes < 1024) return `${bytes} B`;
	const kilo = bytes / 1024;
	if (kilo < 1024) return `${Math.round(kilo)} KB`;
	return `${(kilo / 1024).toFixed(1)} MB`;
};

const imgDirs = [DIGIMON, GROUP, DIGIEGG];

const imgPathByLicence: Record<string, CallableFunction> = {
	digimon: (name: string, type: string) =>
		`/images/${imgDirs.includes(type) ? type : 'digimon'}/${name}.jpg`,
	pokemon: (name: string) =>
		`https://www.coupcritique.fr/images/pokemons/${formatPokemonFileName(name)}.png`,
};

export default imgPathByLicence;
