export interface Option {
	key: number | string;
	value: number | string;
}

export interface Step {
	key: number | string;
	value: number | string | boolean;
}

export interface Legend {
	key: string;
	color: string;
	text: string;
}
