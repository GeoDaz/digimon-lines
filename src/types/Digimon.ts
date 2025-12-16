export interface Digimon {
	name: string;
	name2?: string;
	url?:string;
	year?:string;
	evos?: string[];
	preEvos?: string[];
	level: string|string[];
	type: string|string[];
	attribute: string|string[];
	field: string|string[];
	variants: string[];
	tags: string[];
}

export interface DigimonItem{
	name: string;
	variants?: string[];
	modes?: string[];
	from?: string[];
	fusionFrom?: string[];
	to?: string[];
}