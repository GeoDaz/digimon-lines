const fs = require('fs');
const path = require('path');

const typeOf = value => {
	if (value === null) return 'null';
	if (Array.isArray(value)) return 'array';
	return typeof value;
};

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

function splitColumn(line) {
	// console.log({ keys: Object.keys(line), typeof: typeOf(line.columns) });
	let changed = false;
	line.columns = line.columns.reduce((columns, col, i) => {
		let toSplit = false;
		let nextArray = [];
		columns.push(
			col.map((point, j) => {
				if (Array.isArray(point)) {
					toSplit = true;
					nextArray[j] = point[1];
					return point[0];
				}
				return point;
			})
		);
		if (toSplit) {
			changed = true;
			nextArray = Array.from(nextArray, point => point || null);
			columns.push(nextArray);
		}
		return columns;
	}, []);
	return changed;
}

function printLine(line) {
	console.log({
		...line,
		columns: line.columns.map(col =>
			col.map((point, j) => {
				if (point && typeof point === 'object') {
					return JSON.stringify(point);
				}
				return point;
			})
		),
	});
}

// Chemin du dossier contenant les fichiers JSON
const folderPath = './public/json/lines/';

fs.readdir(folderPath, (err, files) => {
	if (err) {
		console.error(err);
		return;
	}

	files.forEach((file, i) => {
		if (path.extname(file) === '.json' && file.charAt(0) != '_') {
			const filePath = path.join(folderPath, file);
			const data = fs.readFileSync(filePath);
			const line = JSON.parse(data);
			const changed = splitColumn(line);
			if (changed) {
				writeJson(filePath, line);
			}
		}
	});
});
