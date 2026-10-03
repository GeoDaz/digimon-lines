export interface GameDigimon {
	slug: string;
	number: string;
	name: string;
	generation: string;
	attribute?: string;
	type?: string;
	personality?: string;
	memory?: string;
	image?: string;
	icon?: string;
	from: string[];
	to: string[];
	modes: string[];
}

export interface LabeledValues {
	label: string;
	values: string[];
}

export interface GenericTable {
	columns: string[];
	rows: string[][];
}

export interface Resistance {
	name: string;
	value: number | string | null;
}

export interface ResistanceTable {
	title: string;
	entries: Resistance[];
}

export interface SupportSkill {
	name: string;
	effect: string;
}

export interface SkillTable extends GenericTable {
	title: string;
}

export interface GameStats {
	levels: string[];
	rows: { stat: string; values: (number | null)[] }[];
}

export interface GameDigimonDetails {
	facts: LabeledValues[];
	description?: string;
	resistances: ResistanceTable[];
	effectiveness?: LabeledValues[];
	supportSkills?: SupportSkill[];
	stats?: GameStats;
	conditions?: GenericTable;
	skills: SkillTable[];
}

export type GameDigimonsDetails = { [slug: string]: GameDigimonDetails };

export interface DigimonGame {
	key: string;
	title: string;
	shortTitle: string;
	generations: string[];
	labels: { generation: string; attribute: string; type: string };
	typeIcons?: boolean;
	typeFilter?: boolean;
	extra?: { key: keyof GameDigimon; label: string };
}
