import { DIGIMON, APPMON, GROUP, VB, DIGIEGG } from '@/consts/ui';

export interface Line {
	title?: string;
	columns: LineColumn[];
	size: number;
	related?: Array<string | LineRelation>;
	notes?: string[];
	anchor?: LineAnchor;
	levels?: string[];
}

/**
 * Where a diagonal line touches the images it links (whole grid setting).
 * 'corner' (default) : the corner of the image, current behaviour.
 * 'x-center' : the middle of the top/bottom side.
 * 'y-center' : the middle of the left/right side.
 * Straight lines are always centered on their side, whatever the value.
 */
export type LineAnchor = 'corner' | 'x-center' | 'y-center';

export type LineColumn = Array<LinePoint | null>;

export interface LinePoint {
	name: string;
	size?: number /** @deprected */;
	xSize?: number;
	ySize?: number;
	color?: LineColor;
	mirror?: boolean;
	from?: LineFrom;
	skins?: LineSkin[];
	image?: string;
	collapsable?: boolean /** @deprected */;
	xCollapsable?: boolean;
	yCollapsable?: boolean;
}

export type Axis = 'x' | 'y';
export type SizeAttr = 'xSize' | 'ySize';
export type CollapseAttr = 'xCollapsable' | 'yCollapsable';

/**
 * A skin is either the name of a {licence} image, or an image of its own coming
 * from an url or an upload, exactly like the main image of a point.
 */
export type LineSkin = string | LineSkinImage;

export interface LineSkinImage {
	name: string;
	image?: string;
}

export type LineFrom = Array<number[]> | number[] | null;

export type LineColor = string | string[];

export interface LineRelation {
	name: string;
	for?: string;
	from?: string;
	type?: typeof DIGIMON | typeof APPMON | typeof GROUP | typeof VB | typeof DIGIEGG;
}

export interface LineThumb {
	name: string;
	available?: boolean;
	found?: LineFound;
	for?: string;
	grid?: string[];
}

export interface LineFound {
	name: string;
	found: string;
	priority: number;
}

export default Line;
