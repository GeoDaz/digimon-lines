import { createContext } from 'react';

export interface LicenceProps {
	key: string;
	name: string;
}

export const defaultLicenceContext: LicenceProps = {
	key: 'digimon',
	name: 'Digimon',
};

export const licences: Record<string, LicenceProps> = {
	digimon: defaultLicenceContext,
	pokemon: { key: 'pokemon', name: 'Pokémon' },
};

export const getLicence = (key?: string | null): LicenceProps =>
	licences[key || ''] || defaultLicenceContext;

export const licencePath = (base: string, key?: string | null): string => {
	const licence = getLicence(key);
	return licence.key === defaultLicenceContext.key ? base : `${base}/${licence.key}`;
};

export const licenceBuildPath = (key?: string | null): string =>
	licencePath('/build', key);

export const licenceCommunityPath = (key?: string | null): string =>
	licencePath('/community', key);

export const licenceStorageKey = (key?: string | null): string =>
	`${getLicence(key).key}-line`;

export const LicenseContext = createContext<LicenceProps>(defaultLicenceContext);
