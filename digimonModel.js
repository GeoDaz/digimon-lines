const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let DigimonSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	name: {
		type: String,
		required: true,
		unique: true,
	},
	name2: {
		type: String,
		required: true,
		unique: true,
	},
	evo: {
		type: Array,
		required: false,
	},
	attribute: {
		type: Object,
		required: true,
	},
	legend: null,
});

module.exports = mongoose.model('Digimon', DigimonSchema);
