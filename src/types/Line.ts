export interface Line {
	columns: Array<Array<LinePoint | LinePoint[] | null>>;
	size: number;
	related?: Array<string | LineRelation>;
	notes?: Array<string>;
}

export interface LinePoint {
	name: string;
	color?: string;
	color2?: string;
	size?: number;
	skins?: string[];
	from?: number[] | null;
	from2?: number[];
	fusionFrom?: Array<number[]>;
}

export interface LineRelation {
	name: string;
	for: string;
}

export default Line;
