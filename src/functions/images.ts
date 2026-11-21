import { DIGIEGG, DIGIMON, GROUP } from '@/consts/ui';
import { formatPokemonFileName } from './file';

/**
 * Une image "uploadée" est stockée en data URI base64 dans le JSON de la ligne,
 * contrairement à une image d'URL qui n'y pèse que la longueur de son adresse.
 * Ce sont les seules qui menacent la limite de poids d'une ligne.
 */
export const isUploadedImage = (image?: string): boolean =>
	!!image && image.trimStart().toLowerCase().startsWith('data:');

const TRUSTED_IMAGE_HOSTS = [
	'fandom.com',
	'wikia.com',
	'wikia.nocookie.net',
	'bulbagarden.net',
	'masterduelmeta.com',
	'duellinksmeta.com',
	'ygoprodeck.com',
	'yugioh-card.com',
	'ygorganization.com',
	'digimoncard.com',
	'digimoncard.io',
	'digimoncard.app',
	'digimoncard.dev',
	'takaotaku.de',
	'orangeswim.dev',
	'cardlist.dev',
	'digimon.net',
];
const WIKI_LABEL = /wiki|pedia/;

export const isTrustedImageUrl = (image?: string): boolean => {
	if (!image) return false;
	try {
		const { protocol, hostname } = new URL(image.trim());
		if (protocol !== 'https:') return false;
		const host = hostname.toLowerCase();
		return (
			TRUSTED_IMAGE_HOSTS.some(trusted => host === trusted || host.endsWith(`.${trusted}`)) ||
			host.split('.').some(label => WIKI_LABEL.test(label))
		);
	} catch {
		return false;
	}
};

export const isUntrustedImageUrl = (image?: string): boolean =>
	!!image && !!image.trim() && !isUploadedImage(image) && !isTrustedImageUrl(image);

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

const YUGIOH = 'yugioh';
const imgDirs = [DIGIMON, GROUP, DIGIEGG];

const coverKeyByLicence: Record<string, (name: string) => string> = {
	digimon: name => name,
	pokemon: formatPokemonFileName,
};

export const coverKey = (name: string, licence: string = DIGIMON): string | undefined => {
	if (licence === YUGIOH) return name.trim().toLowerCase().slice(0, 100) || undefined;
	const format = coverKeyByLicence[licence] || coverKeyByLicence[DIGIMON];
	const key = format(name)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9_.-]/g, '')
		.slice(0, 64);
	return key || undefined;
};

const imgPathByLicence: Record<string, CallableFunction> = {
	digimon: (name: string, type: string) =>
		`/images/${imgDirs.includes(type) ? type : 'digimon'}/${name}.jpg`,
	pokemon: (name: string) =>
		`https://www.coupcritique.fr/images/pokemons/${formatPokemonFileName(name)}.png`,
	yugioh: (name: string) =>
		/^[0-9a-f]{24}$/.test(name) ?
			`/api/yugioh-card/${name}/w260`
		:	`/api/yugioh-card/name/${encodeURIComponent(name)}`,
};

export default imgPathByLicence;
