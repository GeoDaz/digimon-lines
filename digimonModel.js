const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let DigimonSchema = new Schema({
	ref: {
		type: String,
		required: true,
		unique: true,
	},
	name: {
		type: String,
		required: true,
		unique: true,
	},
	evo: {
		type: Array,
		required: false,
	},
});

const agumon = {
	ref: 'agumon',
	name: 'Agumon',
	evo: [
		{
			to: 'greymon',
			regular: true,
		},
		{
			to: 'geogreymon',
			regular: true,
		},
		{
			to: 'agumonBoC',
			type: 'biomerge',
			level: 'mega',
		},
		{
			to: 'agumonBM',
			type: 'mode',
			level: 'mega',
		},
		{
			to: 'agumonX',
			type: 'x',
			level: 'rookie',
		},
	],
	type: {
		cat: 'antivirus',
		el: 'fire',
	},
	legend: null,
};

const agumonFamilly = {
    ref: 'agumon',
    displayed: true,
	baby: [
		// fresh + training
		{
			ref: 'koromon',
            size: 10,
            link: 'koromon',
		},
	],
	rookie: [
		{
			ref: 'agumon',
			size: 6,
		},
		{
			ref: 'agumonX',
		},
		{
			ref: 'agumonB',
		},
		{
			ref: 'agumonBX',
		},
		{
			ref: 'agumonSnow',
		},
	],
	champion: [
        {
			ref: 'greymon',
			size: 2,
        },
        {
			ref: 'geogreymon',
			size: 2,
        },
        {
			ref: 'greymonX',
        },
        {
			ref: 'greymonB',
        },
        {
			ref: 'agunimon',
			link: 'agunimon'
		},
    ],
	ultimate: [],
	mega: [],
	megaP: [],
	ultra: [],
	ultraP: [],
};

const digivolution_types = [
	'normal' /* null */, // grey
	'dark', // black
	'x', // light_blue
	'dna' /* fusion */, // purple
	'mode' /* and BM */, // orange
	'armor', // gold
	'biomerge' /* human and spirit */, // pink
	'warp' /* super */, // yellow
];

module.exports = mongoose.model('Digimon', DigimonSchema);
