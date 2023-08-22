import { Legend } from '@/types/Ui';

export const colors: { [key: string]: string } = {
	default: '#fff', //white // '#bdc3d1', // grey
	dark: '#6435c9', // violet '#684399' // black #000 ,
	x: '#3082E6', // light_blue
	fusion: '#a054b9', // purple '#a333c8'
	mode: '#ef6e33', // orange
	armor: '#e4c05c', // gold '#E9DA1D'
	human: '#F966DE', // pink
	// warp: '#000', // yellow
	ice: '#87C7C6', // light blue
	fire: '#db2828', // red
	light: '#fffd8d', // light yellow
	// psychic: '#a24795', // fushia
};

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
	{ key: 'armor', color: colors.armor, text: 'Armor, warp evolution or gold digimon' },
	{ key: 'light', color: colors.light, text: 'Holy, angel evolution' },
	{ key: 'fire', color: colors.fire, text: 'Fire, lava made digimon' },
	{ key: 'ice', color: colors.ice, text: 'Ice, snow made digimon' },
];
export default colors;
