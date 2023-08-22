import { Option } from '@/types/Ui';

export const zooms: { [key: number | string]: number } = {
	'-3': 25,
	'-2': 50,
	'-1': 75,
	0: 100,
	1: 125,
	2: 150,
};
// cannot use Object.entries(zooms) because keys will wrong be ordered
export const zoomOptions: Array<Option> = [
	{ key: -3, value: 25 },
	{ key: -2, value: 50 },
	{ key: -1, value: 75 },
	{ key: 0, value: 100 },
	{ key: 1, value: 125 },
	{ key: 2, value: 150 },
];
