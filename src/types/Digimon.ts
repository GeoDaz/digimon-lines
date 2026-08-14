export interface Digimon {
	name: string;
	name2?: string;
	url?: string;
	/** Where the Digimon comes from when Wikimon has no page for it, ex "DW3". */
	source?: string;
	year?: string;
	evos?: string[];
	preEvos?: string[];
	level: string | string[];
	type: string | string[];
	attribute: string | string[];
	field: string | string[];
	tags: string[];
}

export interface DigimonItem {
	name: string;
	variants?: string[];
	modes?: string[];
	x?: string[];
	armors?: string[];
	from?: string[];
	fusionFrom?: string[];
	to?: string[];
}
