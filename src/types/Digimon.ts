export interface Digimon {
	key: string;
	name: string;
	name2?: string;
	name3?: string;
	level: number;
	attribute: string;
	elements: string[];
	types: string[];
	tags?: string[];
	evos?: Array<string | Digivolution>;
	preEvos?: Array<string | Digivolution>;
	modes?: Array<string | Digivolution>;
	modeFrom?: string | Digivolution;
	skins?: Array<string | DigiRelation>;
	species?: Array<string | DigiRelation>;
	related?: Array<string | DigiRelation>;
	legend?: string[]; // legend is an array to make <br/>
}

export interface Digivolution {
	name: string;
	color?: string;
	level?: number; // default digimonFrom.level + 1
}

export interface DigiRelation {
	name: string;
	skins?: string[];
}

export default Digimon;
