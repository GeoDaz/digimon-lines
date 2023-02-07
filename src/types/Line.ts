export interface Line {
	size: number | undefined;
	baby1: Array<LinePoint | null> | undefined;
	baby2: Array<LinePoint | null> | undefined;
	rookie: Array<LinePoint | null>;
	champion: Array<LinePoint | null>;
	ultimate: Array<LinePoint | null>;
	mega: Array<LinePoint | null>;
	ultra: Array<LinePoint | null> | undefined;
	supra: Array<LinePoint | null> | undefined;
}

export interface LinePoint {
	ref: string;
	color: string | undefined;
	size: number | undefined;
	skins: string[] | undefined;
	from: number[] | undefined;
}
export default Line;
