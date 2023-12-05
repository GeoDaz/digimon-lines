import { Legend } from '@/types/Ui';

export enum colors {
	default = '#fff', //white // '#bdc3d1', // grey
	x = '#0080ff', // light_blue
	fusion = '#a054b9', // purple '#a333c8'
	mode = '#ef6e33', // orange
	gold = '#e4c05c', // gold '#E9DA1D'
	human = '#F966DE', // pink
	dark = '#6435c9', // violet '#684399' // black #000 ,
	light = '#fffd8d', // light yellow
	ice = '#87C7C6', // light blue
	fire = '#db2828', // red
	grass = '#21ba45', // green
	marine = '#0056a6', // marine blue
	electric = '#c0e617', // yellow
	wind = '#92f5c4', // yellow
	earth = '#a46204', // yellow
	machine = '#909090', // yellow
	// psychic= '#a24795', // fushia
}

export const legend: Legend[] = [
	{ key: 'default', color: colors.default, text: 'Default color' },
	{ key: 'x', color: colors.x, text: 'X antibody' },
	{
		key: 'dark',
		color: colors.dark,
		text: 'Dark, death, black, chaos, demon, ... evolution',
	},
	{ key: 'fusion', color: colors.fusion, text: 'Fusion (DNA, Xros)' },
	{ key: 'mode', color: colors.mode, text: 'Mode change (Burst Mode,\u00A0...)' },
	{ key: 'human', color: colors.human, text: 'Fusion with a human' },
	{ key: 'gold', color: colors.gold, text: 'Gold or warp evolution digimon' },
	{ key: 'light', color: colors.light, text: 'Holy, angel evolution' },
	{ key: 'fire', color: colors.fire, text: 'Fire, lava made digimon' },
	{ key: 'ice', color: colors.ice, text: 'Ice, snow made digimon' },
	{ key: 'marine', color: colors.marine, text: 'Marine digimon' },
	{ key: 'wind', color: colors.wind, text: 'Aerial, wind master digimon' },
	{ key: 'earth', color: colors.earth, text: 'Earth, rock digimon' },
	{ key: 'grass', color: colors.grass, text: 'Grass made digimon' },
	{ key: 'electric', color: colors.electric, text: 'Thunder, electric digimon' },
	{ key: 'machine', color: colors.machine, text: 'Machine, metal made digimon' },
];
export default colors;
