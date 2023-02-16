export interface Line {
	baby1: Array<LinePoint | null> | undefined;
	baby2: Array<LinePoint | null> | undefined;
	rookie: Array<LinePoint | null>;
	champion: Array<LinePoint | null>;
	ultimate: Array<LinePoint | null>;
	mega: Array<LinePoint | null>;
	ultra: Array<LinePoint | null> | undefined;
	supra: Array<LinePoint | null> | undefined;
	related: Array<string> | undefined;
	notes: Array<string> | undefined;
}

export interface LinePoint {
	ref: string;
	color: string | undefined;
	color2: string | undefined;
	size: number | undefined;
	skins: string[] | undefined;
	from: number[] | undefined;
	from2: number[] | undefined;
}
export default Line;
