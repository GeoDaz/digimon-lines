import { createContext } from 'react';

export interface LicenceProps {
	key: string;
	name: string;
}

export const defaultLicenceContext: LicenceProps = {
	key: 'digimon',
	name: 'Digimon',
};
export const LicenseContext = createContext<LicenceProps>(defaultLicenceContext);
