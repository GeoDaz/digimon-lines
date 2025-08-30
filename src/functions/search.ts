import { StringObject } from '@/types/Ui';
import { stringToKey } from '.';
import Search from '@/types/Search';

export const getSearchPriority = (search: string, name: string): number | null => {
	if (!search.startsWith('app')) {
		name = name.replace('app_', '');
	}
	name = stringToKey(name);
	search = stringToKey(search);
	let index =
		search.length > 3 ? name.indexOf(search) : name.startsWith(search) ? 0 : -1; // digimon string contains search string
	if (index === -1) return null;
	let priority: number = index * -1;
	priority -= Math.abs(name.length - search.length);
	return priority;
};

export const getDubbedSearchList = (
	baseSearchList: string[],
	dubList: StringObject
): Search => {
	Object.entries(dubList).forEach(([key, value]) => {
		dubList[value] = key;
	});

	return baseSearchList.reduce(
		(result, name) => {
			// self map
			result.mapped[name] = name;

			// dub map
			const dubName = dubList[name];
			if (!dubName) return result;
			if (result.mapped[dubName]) return result;

			result.mapped[dubName] = name;
			result.keys.push(dubName);

			// map when there is a name like current name + something and the dub name + something not exists, so create it
			baseSearchList.forEach(subName => {
				if (subName != name && !dubList[subName] && subName.startsWith(name)) {
					const subDubName = subName.replace(name, dubName);
					result.mapped[subDubName] = subName;
					result.keys.push(subDubName);
				}
			});
			return result;
		},
		{
			mapped: {},
			values: baseSearchList.slice(),
			keys: baseSearchList.slice(),
		} as Search
	);
};
