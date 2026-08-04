// Mirror the relations of public/json/digimons/ranked.json: every `to` gets its
// `from` (or `fusionFrom`) on the other side and the other way around, and every
// `variants` gets the digimon back in the variants of the digimons it lists.
// The API routes keep the file mirrored on each edit, this script is there to
// fix the entries edited by hand.
//
// Usage:
//   node cmd/mirrorRelations.cmd.js          fix the file
//   node cmd/mirrorRelations.cmd.js --check  only report what is missing

const fs = require('fs');
const path = require('path');
const { mirrorAllRelations } = require('../src/functions/relations');

const dryRun = process.argv.includes('--check');
const filePath = path.join(__dirname, '..', 'public', 'json', 'digimons', 'ranked.json');
const ranked = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const { added, dangling, spurious, changed } = mirrorAllRelations(ranked, { dryRun });

added.forEach(({ name, key, target }) => {
	console.log(`${dryRun ? 'missing' : 'added  '} ${name}.${key} += ${target}`);
});

spurious.forEach(({ name, key, target }) => {
	console.log(`${dryRun ? 'doubled' : 'cleaned'} ${name}.${key} -= ${target}`);
});

if (dangling.length) {
	console.log('');
	console.log(`${dangling.length} relations pointing at an unranked digimon:`);
	dangling.forEach(({ name, key, target }) => {
		console.log(`  ${name}.${key} -> ${target} (no entry in ranked.json)`);
	});
}

console.log('');
if (dryRun) {
	console.log(
		`${added.length} missing relations on ${new Set(added.map(a => a.name)).size} digimons` +
			(spurious.length ? `, ${spurious.length} doubled ones` : '')
	);
	process.exit(added.length || spurious.length ? 1 : 0);
}

if (!added.length && !spurious.length) {
	console.log('Nothing to mirror, ranked.json is already symmetric');
	process.exit(0);
}

fs.writeFileSync(filePath, JSON.stringify(ranked, null, 4), 'utf-8');
console.log(
	`${added.length} relations added and ${spurious.length} doubled ones cleaned ` +
		`on ${changed.length} digimons`
);

// The file has to come out symmetric: a second pass must find nothing left.
const left = mirrorAllRelations(ranked, { dryRun: true });
if (left.added.length || left.spurious.length) {
	console.error(
		`${left.added.length + left.spurious.length} relations are still wrong, please report a bug`
	);
	process.exit(1);
}
console.log('ranked.json is symmetric');
