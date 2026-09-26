// Loader webpack de src/data/digimonNames.js (branché dans next.config.js).
//
// Remplace le contenu du module par la liste des images de public/images/digimon
// et les noms doublés précalculés. Ça ne peut se faire qu'au build, côté Node
// (lecture du disque), mais le résultat part dans le chunk client des données
// communes (voir src/data/sharedDigimonData.ts).
//
// Le dossier d'images et dubnames.json sont déclarés comme dépendances : en dev,
// ajouter une image ou modifier dubnames.json recompile le module.

const fs = require('fs');
const path = require('path');
const { computeDubNames, addReverseDubNames } = require('../functions/dubNames');

const ROOT = path.join(__dirname, '..', '..');
const IMAGES_DIR = path.join(ROOT, 'public', 'images', 'digimon');
const DUBNAMES_PATH = path.join(ROOT, 'public', 'json', 'dubnames.json');

module.exports = function digimonNamesLoader() {
	this.cacheable(true);
	this.addContextDependency(IMAGES_DIR);
	this.addDependency(DUBNAMES_PATH);

	// Même règle que getDirPaths('images/digimon').
	const names = fs.readdirSync(IMAGES_DIR).map(file => file.split('.')[0]);
	const dubNames = computeDubNames(
		JSON.parse(fs.readFileSync(DUBNAMES_PATH, 'utf-8')),
		names
	);
	// Comme getDubbedSearchList au build : les noms doublés reçoivent aussi le
	// sens inverse, la liste de recherche est ensuite reconstruite côté client.
	addReverseDubNames(dubNames);

	// JSON.parse d'une chaîne : plus rapide à évaluer qu'un littéral objet.
	return `module.exports = JSON.parse(${JSON.stringify(
		JSON.stringify({ names, dubNames })
	)});\n`;
};
