import { Legend, StringObject } from '@/types/Ui';

export const colors: StringObject = {
	default: '#fff', //white // '#bdc3d1', // grey
	x: '#0080ff', // light_blue
	fusion: '#a054b9', // purple '#a333c8'
	mode: '#ef6e33', // orange
	gold: '#e4c05c', // gold '#E9DA1D'
	human: '#F966DE', // pink
	slide: '#00b5ad', // teal
	dark: '#6435c9', // violet '#684399' // black #000 ,
	light: '#fffd8d', // light yellow
	ice: '#87C7C6', // light blue
	fire: '#db2828', // red
	grass: '#21ba45', // green
	marine: '#0056a6', // marine blue
	electric: '#c0e617', // yellow
	wind: '#92f5c4', // light green
	earth: '#a46204', // brown
	machine: '#909090', // light grey
	failure: '#72330f', // brown
	// psychic: '#a24795', // fushia
};

export const legend: Legend[] = [
	{ key: 'default', color: colors.default, text: 'Default color' },
	{ key: 'x', color: colors.x, text: 'X antibody' },
	{ key: 'mode', color: colors.mode, text: 'Mode change (Burst Mode,\u00A0...)' },
	{ key: 'fusion', color: colors.fusion, text: 'Fusion (DNA, Xros)' },
	{ key: 'human', color: colors.human, text: 'Fusion with a human' },
	{ key: 'slide', color: colors.slide, text: 'Slide evolution' },
	{
		key: 'dark',
		color: colors.dark,
		text: 'Dark, death, black, chaos, demon, ... evolution',
	},
	{ key: 'failure', color: colors.failure, text: 'Failure evolution' },
	{ key: 'gold', color: colors.gold, text: 'Gold or warp evolution' },
	{ key: 'light', color: colors.light, text: 'Holy, angel evolution' },
	{ key: 'fire', color: colors.fire, text: 'Fire, lava made' },
	{ key: 'ice', color: colors.ice, text: 'Ice, snow made' },
	{ key: 'marine', color: colors.marine, text: 'Marine' },
	{ key: 'wind', color: colors.wind, text: 'Aerial, wind master' },
	{ key: 'earth', color: colors.earth, text: 'Earth, rock' },
	{ key: 'grass', color: colors.grass, text: 'Grass made' },
	{ key: 'electric', color: colors.electric, text: 'Thunder, electric' },
	{ key: 'machine', color: colors.machine, text: 'Machine, metal made' },
];
export default colors;
