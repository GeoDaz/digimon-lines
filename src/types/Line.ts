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
	size?: number /** @deprected */;
	xSize?: number;
	ySize?: number;
	color?: LineColor;
	mirror?: boolean;
	from?: LineFrom;
	skins?: string[];
	image?: string;
	collapsable?: boolean /** @deprected */;
	xCollapsable?: boolean;
	yCollapsable?: boolean;
}

export type Axis = 'x' | 'y';
export type SizeAttr = 'xSize' | 'ySize';
export type CollapseAttr = 'xCollapsable' | 'yCollapsable';

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
	for?: string;
}

export interface LineFound {
	name: string;
	found: string;
	priority: number;
}

export default Line;
