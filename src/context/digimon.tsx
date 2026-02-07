import React from 'react';
import { Digimon } from '@/types/Digimon';
import { StringObject } from '@/types/Ui';
import { createContext, useMemo } from 'react';

const defaultObject: any = {};

export interface DigimonProps {
	dubNames: StringObject;
	data: {
		[key: string]: Digimon;
	};
}

export const defaultDigimonContext: DigimonProps = {
	dubNames: defaultObject,
	data: defaultObject,
};

export const DigimonContext = createContext<DigimonProps>(defaultDigimonContext);

export const DigimonProvider = ({
	dubNames,
	data,
	children,
}: {
	dubNames?: StringObject;
	data?: { [key: string]: Digimon };
	children: React.ReactNode;
}) => {
	const digimonContext = useMemo(
		() => ({
			dubNames: dubNames || defaultObject,
			data: data || defaultObject,
		}),
		[dubNames, data]
	);
	return (
		<DigimonContext.Provider value={digimonContext}>
			{children}
		</DigimonContext.Provider>
	);
};
