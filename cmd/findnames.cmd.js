const fs = require('fs');

const getDirPaths = dir => fs.readdirSync(dir).map(path => path.split('.')[0]);

const names = getDirPaths('./public/images/digimon');
const dub = require('./public/json/dubnames.json');

Object.entries(dub).forEach(([key, value]) => {
	if (names.includes(key)) {
		console.log({ [key]: value });
	}
});
