export interface Line {
	title?: string;
	columns: Array<Array<LinePoint | LinePoint[] | null>>;
	size: number;
	related?: Array<string | LineRelation>;
	notes?: string[];
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
	image?: string;
}

export interface LineRelation {
	name: string;
	for?: string;
	from?: string;
}

export interface LineThumb {
	name: string;
	available?: boolean;
	found?: LineFound;
}

export interface LineFound {
	name: string;
	found: string;
	priority: number;
}

export default Line;
