import { Limitations } from '@/consts/yugioh/limitations';

export interface Card {
	_id: string;
	monsterType: string[];
	popRank: number;
	name: string;
	konamiID?: string;
	type: string;
	level?: number;
	race?: string;
	attribute?: string;
	atk?: number;
	def?: number;
	description: string;
	__v: number;
	linkArrows: string[];
	handtrap: boolean;
	archetype?: string | null; // Calculated
	deckTypes: string[];
	obtain: {
		source: {
			_id: string;
			type: string;
			name: string;
		};
		amount: number;
		type: string;
	}[];
	rarity?: string;
	release?: string;
	tcgRelease?: string;
	ocgRelease?: string;
	banStatus?: keyof typeof Limitations;
	tcgBanStatus?: keyof typeof Limitations;
	ocgBanStatus?: keyof typeof Limitations;
	gameId?: string;
	alternateArt: boolean;
	mostUsedDeckTypes: string[];
	required?: boolean;
}
