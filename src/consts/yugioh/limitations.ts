export enum Regulations {
	dl = 'dl',
	md = 'md',
	tcg = 'tcg',
	ocg = 'ocg',
}

export enum RegulationLabels {
	md = 'Master Duel',
	tcg = 'TCG',
	ocg = 'OCG',
}

export enum Limitations {
	'Limited 1' = 1,
	'Limited 2' = 2,
	'Limited 3' = 3,
	Forbidden = 0,
}

export const attributesByReg: Record<
	Regulations,
	{
		release: 'release' | 'tcgRelease' | 'ocgRelease';
		banStatus: 'banStatus' | 'tcgBanStatus' | 'ocgBanStatus';
	}
> = {
	[Regulations.md]: {
		release: 'release',
		banStatus: 'banStatus',
	},
	[Regulations.tcg]: {
		release: 'tcgRelease',
		banStatus: 'tcgBanStatus',
	},
	[Regulations.ocg]: {
		release: 'ocgRelease',
		banStatus: 'ocgBanStatus',
	},
	[Regulations.dl]: {
		release: 'release',
		banStatus: 'banStatus',
	},
};
