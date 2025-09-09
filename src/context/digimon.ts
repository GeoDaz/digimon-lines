import { Digimon } from '@/types/Digimon';
import { StringObject } from '@/types/Ui';
import { createContext } from 'react';

export interface DigimonProps {
	dubNames: StringObject;
	data: {
		[key: string]: Digimon;
	};
}

export const defaultDigimonContext: DigimonProps = {
	dubNames: {},
	data: {},
};
export const DigimonContext = createContext<DigimonProps>(defaultDigimonContext);
