export interface Digimon {
	name: string;
	name2?: string;
	evos?: Array<string>;
	preEvos?: Array<string>;
	attribute: string;
	type: string;
	species: Array<string>;
	tags: Array<string>;
	legend: Array<string>;
}
// legend is an array to make <br/>
