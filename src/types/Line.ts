export interface Line {
	title?: string;
	columns: LineColumn[];
	size: number;
	related?: Array<string | LineRelation>;
	notes?: string[];
}

export type LineColumn = Array<LinePoint | null>;

export interface LinePoint {
	name: string;
	size?: number;
	color?: LineColor;
	from?: LineFrom;
	skins?: string[];
	image?: string;
	collapsable?: boolean;
}

export type LineFrom = Array<number[]> | number[] | null;

export type LineColor = string | string[];

export interface LineRelation {
	name: string;
	for?: string;
	from?: string;
}

export interface LineThumb {
	name: string;
	available?: boolean;
	found?: LineFound;
	thumbs?: string[];
}

export interface LineFound {
	name: string;
	found: string;
	priority: number;
}

export default Line;
