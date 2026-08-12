import { DigimonItem } from '@/types/Digimon';
import { attributeIcons, fieldIcons, levelAttributes } from '@/consts/items';

export interface ItemIcon {
	label: string;
	// Chemin de l'icône, vide quand la valeur n'en a pas (affichée en texte).
	src: string;
}

const toList = (value: string | string[] | undefined): string[] =>
	Array.isArray(value) ? value : value ? [value] : [];

// Nom de fichier d'une valeur : « Dragon's Roar » -> dragons_roar.
const toSlug = (value: string): string =>
	value
		.toLowerCase()
		.replace(/['’]/g, '')
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_|_$/g, '');

// Icônes d'une liste de valeurs, dédoublonnées : deux libellés partageant la
// même icône n'en affichent qu'une.
const toIcons = (values: string[], icons: string[]): ItemIcon[] => {
	const seen = new Set<string>();
	return values.reduce((acc, label) => {
		const key = toSlug(label);
		if (!key || seen.has(key)) return acc;
		seen.add(key);
		acc.push({
			label,
			src: icons.includes(key) ? `/images/items/${key}.png` : '',
		});
		return acc;
	}, [] as ItemIcon[]);
};

// Attribut porté par le niveau (Baby I/II, Armor, Hybrid), en tolérant les
// niveaux détaillés (« Armor II », « Hybrid III »...).
const attributeByLevel = (level: string): string | undefined => {
	const normalized = level.trim().toLowerCase();
	const key = Object.keys(levelAttributes).find(prefix =>
		normalized.startsWith(prefix)
	);
	return key ? levelAttributes[key] : undefined;
};

const isBaby = (level: string | string[] | undefined): boolean =>
	toList(level).some(value => value.trim().toLowerCase().startsWith('baby'));

// Un même attribut ne veut pas dire la même chose selon le niveau : chez les
// Baby I / II, « None » et « Free » valent absence de donnée (No Data) ; ailleurs
// « None » veut juste dire non renseigné (Unknown).
const resolveAttribute = (label: string, baby: boolean): string => {
	const normalized = label.trim().toLowerCase();
	if (baby) return normalized === 'none' || normalized === 'free' ? 'No Data' : label;
	return normalized === 'none' ? 'Unknown' : label;
};

// Les attributs du digimon, complétés par celui que son niveau implique : les
// Baby I / II gardent toujours l'icône « No Data », les Armor « Free » et les
// Hybrid « Variable », même quand la donnée ne le précise pas.
export const getAttributeIcons = (
	attribute: string | string[] | undefined,
	level: string | string[] | undefined
): ItemIcon[] => {
	const baby = isBaby(level);
	return toIcons(
		[
			...toList(attribute).map(label => resolveAttribute(label, baby)),
			...toList(level)
				.map(attributeByLevel)
				.filter((value): value is string => !!value),
		],
		attributeIcons
	);
};

// Le field « Unknown » n'apprend rien au lecteur : on ne l'affiche pas.
export const getFieldIcons = (field: string | string[] | undefined): ItemIcon[] =>
	toIcons(
		toList(field).filter(value => value.trim().toLowerCase() !== 'unknown'),
		fieldIcons
	);

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
