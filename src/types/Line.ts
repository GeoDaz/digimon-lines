export interface Line {
	title?: string;
	columns: Array<Array<LinePoint | LinePoint[] | null>>;
	size: number;
	related?: Array<string | LineRelation>;
	notes?: string[];
}

export interface LinePoint {
	name: string;
	size?: number;
	color?: string | string[];
	from?: Array<number[]> | number[] | null;
	skins?: string[];
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
