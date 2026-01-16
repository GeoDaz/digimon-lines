import { NumberObject, Option } from '@/types/Ui';

export const zooms: number[] = [15, 25, 50, 75, 100, 125, 150];

export const zoomOptions: Option[] = zooms.map((zoom, index) => ({
	key: index,
	value: zoom,
}));
