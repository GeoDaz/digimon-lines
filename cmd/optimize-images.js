/*
 * Optimisation des images sources (one-shot).
 *
 * - Ne traite QUE les fichiers réellement encodés en JPEG (détection via sharp,
 *   pas via l'extension : certains .png contiennent en fait du JPEG).
 * - Redimensionne à MAX px sur le plus grand côté (sans agrandir) + recompresse
 *   en JPEG qualité Q (mozjpeg), métadonnées strippées.
 * - Réécrit sur le même chemin/nom de fichier (aucune modif de code nécessaire).
 * - N'écrase QUE si le résultat est plus léger que l'original.
 * - Les vrais PNG / GIF sont laissés intacts.
 *
 * Les originaux ont été sauvegardés dans .image-backup/ avant exécution.
 *
 * Lancement : node cmd/optimize-images.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Évite que libvips garde un handle/mmap sur les fichiers d'entrée (sinon
// impossible de réécrire par-dessus sous Windows).
sharp.cache(false);

const ROOT = path.join(__dirname, '..', 'public', 'images');
const MAX = 800; // px, plus grand côté (affichage max ~375px, couvre le retina 2x)
const QUALITY = 80;
const MIN_BYTES = 20 * 1024; // on saute les fichiers déjà < 20 Ko

function walk(dir, out = []) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) walk(full, out);
		else out.push(full);
	}
	return out;
}

function fmtKB(bytes) {
	return (bytes / 1024).toFixed(0) + ' Ko';
}
function fmtMB(bytes) {
	return (bytes / 1024 / 1024).toFixed(1) + ' Mo';
}

(async () => {
	const files = walk(ROOT);
	let before = 0;
	let after = 0;
	let changed = 0;
	let skipped = 0;
	let errored = 0;
	const top = [];

	for (const file of files) {
		// On lit le fichier en mémoire : sharp ne garde alors aucun handle sur
		// le fichier disque, ce qui permet de réécrire par-dessus (Windows).
		const input = fs.readFileSync(file);
		const orig = input.length;
		before += orig;

		let meta;
		try {
			meta = await sharp(input).metadata();
		} catch (e) {
			after += orig;
			errored++;
			continue;
		}

		// On ne touche qu'aux JPEG, et on saute les petits fichiers.
		if (meta.format !== 'jpeg' || orig < MIN_BYTES) {
			after += orig;
			skipped++;
			continue;
		}

		let pipeline = sharp(input).rotate(); // auto-orientation EXIF puis strip
		if (Math.max(meta.width, meta.height) > MAX) {
			pipeline = pipeline.resize(MAX, MAX, {
				fit: 'inside',
				withoutEnlargement: true,
			});
		}

		let buf;
		try {
			buf = await pipeline.jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
		} catch (e) {
			after += orig;
			errored++;
			continue;
		}

		if (buf.length < orig) {
			fs.writeFileSync(file, buf);
			after += buf.length;
			changed++;
			top.push({
				f: path.relative(ROOT, file),
				from: orig,
				to: buf.length,
			});
		} else {
			after += orig; // résultat pas plus léger : on garde l'original
			skipped++;
		}
	}

	top.sort((a, b) => b.from - b.to - (a.from - a.to));
	console.log('\n=== Top 15 réductions ===');
	for (const t of top.slice(0, 15)) {
		console.log(
			`${t.f}\n   ${fmtKB(t.from)} -> ${fmtKB(t.to)}  (-${(
				(1 - t.to / t.from) *
				100
			).toFixed(0)}%)`
		);
	}

	console.log('\n=== Bilan ===');
	console.log(`Fichiers traités (réécrits) : ${changed}`);
	console.log(`Ignorés (PNG/GIF/petits/non réduits) : ${skipped}`);
	console.log(`Erreurs : ${errored}`);
	console.log(`Poids total images : ${fmtMB(before)} -> ${fmtMB(after)}`);
	console.log(
		`Économie : ${fmtMB(before - after)} (-${(
			(1 - after / before) *
			100
		).toFixed(0)}%)`
	);
})();
