import { DigimonItem } from '@/types/Digimon';

// Flatten a ranked list ({ [level]: { [name]: DigimonItem } }) into a flat
// name -> DigimonItem lookup, so components with only a name (e.g. the expanded
// image modal) can resolve a digimon's relations.
export const flattenDigimonItems = (
	list: { [level: string]: { [name: string]: DigimonItem } } | undefined
): { [name: string]: DigimonItem } =>
	Object.values(list || {}).reduce(
		(acc, digimons) => Object.assign(acc, digimons),
		{} as { [name: string]: DigimonItem }
	);

// Flat name -> level lookup from a ranked list, so editing a digimon from the
// image modal knows which level its ranked entry lives in.
export const getDigimonItemLevels = (
	list: { [level: string]: { [name: string]: DigimonItem } } | undefined
): { [name: string]: string } =>
	Object.entries(list || {}).reduce(
		(acc, [level, digimons]) => {
			Object.keys(digimons).forEach(name => {
				acc[name] = level;
			});
			return acc;
		},
		{} as { [name: string]: string }
	);
