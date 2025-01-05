const fs = require('fs');
const { JSDOM } = require('jsdom');

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

function writeHtml(filePath, html) {
	fs.writeFile(filePath, html, 'utf8', function (err) {
		if (err) {
			console.error('An error occured while writing in ' + filePath);
			console.error(err);
		} else {
			console.log('Succesfully write in ' + filePath);
		}
	});
}

function readHtml(filePath) {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, 'utf8', (err, htmlString) => {
			if (!err && htmlString) {
				resolve(htmlString);
			} else {
				reject(err);
			}
		});
	});
}

function getText(element) {
	if (element.children[0]) {
		return getText(element.children[0]);
	}
	return element.innerHTML
		.trim()
		.replace('(X-Antibody)', 'x')
		.replace(/\s/g, '')
		.replace(/-/g, '')
		.replace(/[()]/g, '')
		.toLowerCase();
}

const srcPath = `./cmd/dubnames.html`;
const distPath = `./public/json/dubnames.json`;

let json = {};
readHtml(srcPath)
	.then(html => {
		const dom = new JSDOM(html);
		const doc = dom.window.document;
		let body = doc.getElementById('body');
		const rows = body.rows;
		for (const row of rows) {
			const firstChild = row.firstElementChild;
			if (firstChild.colSpan > 1) continue;
			const value = getText(row.children[0]);
			const key = getText(row.children[2]);
			if (!key || !value) continue;
			if (/[+:_'!/]/.test(key)) continue;
			if (key.includes('20')) continue;
			if (key == value) continue;
			// console.log(key, value);
			json[key] = value;
		}
		// writeHtml(srcPath, dom.serialize());
		writeJson(distPath, json);
	})
	.catch(error => console.error(error));
