export const digicolors: { [key: string]: string } = {
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

export const legend: Array<{ [key: string]: string }> = [
	{ color: digicolors.default, text: 'Default color' },
	{ color: digicolors.x, text: 'X antibody' },
	{ color: digicolors.fusion, text: 'Fusion (DNA, Xros)' },
	{ color: digicolors.mode, text: 'Mode change (Burst Mode,\u00A0...)' },
	{ color: digicolors.human, text: 'Fusion with a human' },
	{ color: digicolors.armor, text: 'Armor, warp evolution or gold digimon' },
	{ color: digicolors.dark, text: 'Dark, death, black, chaos, demon, ... evolution' },
	{ color: digicolors.light, text: 'Holy, angel evolution' },
	{ color: digicolors.fire, text: 'Fire, lava made digimon' },
	{ color: digicolors.ice, text: 'Ice, snow made digimon' },
];
