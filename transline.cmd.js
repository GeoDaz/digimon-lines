const fs = require('fs');

function writeJson(filePath, body) {
	fs.writeFile(filePath, JSON.stringify(body, null, 4), 'utf8', function (err) {
		if (err) {
			console.error('An error occured while writing in ' + filePath);
			console.error(err);
		} else {
			console.log('Succesfully write in ' + filePath);
		}
	});
}

const filePath = `./public/json/lines/${process.argv[2]}.json`;
const line = require(filePath);
const levels = [
	'baby1',
	'baby2',
	'rookie',
	'champion',
	'ultimate',
	'mega',
	'ultra',
	'supra',
];
line.columns = [];
levels.forEach((level, l) => {
	if (!line[level]) return;
	line[level].forEach((el, i) => {
		if (line.columns[i] === undefined) {
			line.columns[i] = [];
			for (let k = 0; k < l; k++) {
				line.columns[i].push(null);
			}
		}
		line.columns[i].push(el);
	});
	delete line[level];
});
// console.log(JSON.stringify(line));
writeJson(filePath, line);
