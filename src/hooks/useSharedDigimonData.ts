import { useEffect, useState } from 'react';
import { Digimon, DigimonItem } from '@/types/Digimon';
import { StringObject } from '@/types/Ui';
import Search from '@/types/Search';
import { flattenDigimonItems, getDigimonItemLevels } from '@/functions/items';
import { buildSearchList } from '@/functions/dubNames';

export interface SharedDigimonData {
	digimons: { [name: string]: Digimon };
	items: { [name: string]: DigimonItem };
	itemLevels: StringObject;
	levels: string[];
	dubNames: StringObject;
	search: Search;
}

// Cache module : le chunk n'est demandé qu'une fois par session, et les pages
// suivantes (navigation client) ont les données dès leur premier rendu.
let cache: SharedDigimonData | undefined;
let pending: Promise<SharedDigimonData> | undefined;

export const loadSharedDigimonData = (): Promise<SharedDigimonData> => {
	if (!pending) {
		pending = import('@/data/sharedDigimonData')
			.then(({ default: raw }) => {
				cache = {
					digimons: raw.digimons,
					items: flattenDigimonItems(raw.ranked),
					itemLevels: getDigimonItemLevels(raw.ranked),
					levels: Object.keys(raw.ranked),
					dubNames: raw.dubNames,
					search: buildSearchList(raw.names, raw.dubNames),
				};
				return cache;
			})
			.catch(e => {
				// Permet de retenter au prochain montage (ex. réseau coupé).
				pending = undefined;
				throw e;
			});
	}
	return pending;
};

// Données digimons communes (fiches, relations, noms doublés, recherche),
// chargées au montage plutôt que passées dans les props de chaque page.
// `enabled` à false : rien n'est chargé (ex. builder Pokémon).
const useSharedDigimonData = (enabled: boolean = true) => {
	const [data, setData] = useState<SharedDigimonData | undefined>(cache);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (!enabled || data) return;
		let active = true;
		loadSharedDigimonData()
			.then(result => active && setData(result))
			.catch(e => {
				console.error('Failed to load the digimon data:', e);
				if (active) setError(true);
			});
		return () => {
			active = false;
		};
	}, [enabled]);

	return {
		data: enabled ? data : undefined,
		loading: enabled && !data && !error,
		error,
	};
};

export default useSharedDigimonData;
