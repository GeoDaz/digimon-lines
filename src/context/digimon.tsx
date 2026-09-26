import React from 'react';
import { Digimon, DigimonItem } from '@/types/Digimon';
import { StringObject } from '@/types/Ui';
import { createContext, useMemo } from 'react';

const defaultObject: any = {};
const defaultArray: any = [];

export interface DigimonProps {
	dubNames: StringObject;
	data: {
		[key: string]: Digimon;
	};
	items: {
		[key: string]: DigimonItem;
	};
	// name -> ranked level, needed to edit a digimon's ranked entry from anywhere.
	itemLevels: StringObject;
	// List of ranked levels, for the level picker in the edit form.
	levels: string[];
	// Données communes encore en cours de chargement (voir useSharedDigimonData).
	loading: boolean;
}

export const defaultDigimonContext: DigimonProps = {
	dubNames: defaultObject,
	data: defaultObject,
	items: defaultObject,
	itemLevels: defaultObject,
	levels: defaultArray,
	loading: false,
};

export const DigimonContext = createContext<DigimonProps>(defaultDigimonContext);

export const DigimonProvider = ({
	dubNames,
	data,
	items,
	itemLevels,
	levels,
	loading = false,
	children,
}: {
	dubNames?: StringObject;
	data?: { [key: string]: Digimon };
	items?: { [key: string]: DigimonItem };
	itemLevels?: StringObject;
	levels?: string[];
	loading?: boolean;
	children: React.ReactNode;
}) => {
	const digimonContext = useMemo(
		() => ({
			dubNames: dubNames || defaultObject,
			data: data || defaultObject,
			items: items || defaultObject,
			itemLevels: itemLevels || defaultObject,
			levels: levels || defaultArray,
			loading,
		}),
		[dubNames, data, items, itemLevels, levels, loading]
	);
	return (
		<DigimonContext.Provider value={digimonContext}>
			{children}
		</DigimonContext.Provider>
	);
};
