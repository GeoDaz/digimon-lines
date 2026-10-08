import { Digimon } from '@/types/Digimon';
import { StringObject } from '@/types/Ui';

export interface DigimonFilters {
	level: string;
	attribute: string;
	type: string;
}

export interface DigimonFilterOptions {
	levels: string[];
	attributes: string[];
	types: string[];
}

const LEVEL_ORDER = [
	'Baby I',
	'Baby II',
	'Child',
	'Rookie',
	'Champion',
	'Ultimate',
	'Mega',
	'Mega+',
	'Ultra',
	'Armor',
	'Hybrid',
];

const levelRank = (level: string): number => {
	const index = LEVEL_ORDER.indexOf(level);
	return index === -1 ? LEVEL_ORDER.length : index;
};

export const emptyDigimonFilters: DigimonFilters = { level: '', attribute: '', type: '' };

export const toList = (value: string | string[] | undefined): string[] =>
	Array.isArray(value) ? value : value ? [value] : [];

export const hasDigimonFilters = (filters: DigimonFilters): boolean =>
	!!(filters.level || filters.attribute || filters.type);

export const findDigimonData = (
	data: { [key: string]: Digimon },
	name: string,
	dubNames: StringObject = {}
): Digimon | undefined => {
	const parts = name.replace(/^app_/, '').split('_');
	for (let i = parts.length; i > 0; i--) {
		const key = parts.slice(0, i).join('_');
		const digimon = data[key] || (dubNames[key] && data[dubNames[key]]);
		if (digimon) return digimon;
	}
	return data[name];
};

export const getDigimonFilterOptions = (data: {
	[key: string]: Digimon;
}): DigimonFilterOptions => {
	const levels = new Set<string>();
	const attributes = new Set<string>();
	const types = new Set<string>();
	Object.values(data).forEach(digimon => {
		toList(digimon.level).forEach(value => levels.add(value));
		toList(digimon.attribute).forEach(value => attributes.add(value));
		toList(digimon.type).forEach(value => types.add(value));
	});
	const sort = (values: Set<string>) =>
		Array.from(values).sort((a, b) => a.localeCompare(b));
	return {
		levels: sort(levels).sort((a, b) => levelRank(a) - levelRank(b)),
		attributes: sort(attributes),
		types: sort(types),
	};
};

export const matchDigimonFilters = (
	digimon: Digimon | undefined,
	filters: DigimonFilters
): boolean => {
	if (!hasDigimonFilters(filters)) return true;
	if (!digimon) return false;
	return (
		(!filters.level || toList(digimon.level).includes(filters.level)) &&
		(!filters.attribute || toList(digimon.attribute).includes(filters.attribute)) &&
		(!filters.type || toList(digimon.type).includes(filters.type))
	);
};
