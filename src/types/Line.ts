export interface Line {
	columns: Array<Array<LinePoint | LinePoint[] | null>>;
	size: number;
	related: Array<string | LineRelation> | undefined;
	notes: Array<string> | undefined;
}

export interface LinePoint {
	name: string;
	color: string | undefined;
	color2: string | undefined;
	size: number | undefined;
	skins: string[] | undefined;
	from: number[] | null | undefined;
	from2: number[] | undefined;
	fusionFrom: Array<number[]> | undefined;
}

export interface LineRelation {
	name: string;
	for: string;
}

export default Line;
