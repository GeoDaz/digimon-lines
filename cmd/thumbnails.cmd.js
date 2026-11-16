const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

sharp.cache(false);

const SRC = path.join(__dirname, '..', 'public', 'images', 'digimon');
const DEST = path.join(__dirname, '..', 'public', 'images', 'digimon-thumbs');
const SIZE = 192;
const QUALITY = 78;
const JPEG = /\.jpe?g$/i;

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const PARTIAL = args.some(arg => !arg.startsWith('--'));
const FILES = args
	.filter(arg => !arg.startsWith('--'))
	.map(arg => path.resolve(arg))
	.filter(file => path.dirname(file) === SRC && JPEG.test(file));

const fmtMB = bytes => (bytes / 1024 / 1024).toFixed(2) + ' Mo';
const thumbPath = file => path.join(DEST, path.basename(file).replace(JPEG, '.webp'));

(async () => {
	fs.mkdirSync(DEST, { recursive: true });

	const sources =
		PARTIAL ?
			FILES.filter(file => fs.existsSync(file))
		:	fs
				.readdirSync(SRC)
				.filter(file => JPEG.test(file))
				.map(file => path.join(SRC, file));
	let generated = 0;
	let upToDate = 0;
	let errored = 0;
	let removed = 0;

	for (const srcPath of sources) {
		const destPath = thumbPath(srcPath);
		const srcStat = fs.statSync(srcPath);

		if (
			!FORCE &&
			!PARTIAL &&
			fs.existsSync(destPath) &&
			fs.statSync(destPath).mtimeMs >= srcStat.mtimeMs
		) {
			upToDate++;
			continue;
		}

		try {
			const buf = await sharp(fs.readFileSync(srcPath))
				.rotate()
				.resize(SIZE, SIZE, { fit: 'inside', withoutEnlargement: true })
				.webp({ quality: QUALITY, effort: 6 })
				.toBuffer();
			fs.writeFileSync(destPath, buf);
			fs.utimesSync(destPath, new Date(), new Date(Math.max(Date.now(), srcStat.mtimeMs)));
			generated++;
			if (PARTIAL) console.log(path.relative(process.cwd(), destPath).split(path.sep).join('/'));
		} catch (e) {
			errored++;
			console.error(`Erreur : ${path.basename(srcPath)} (${e.message})`);
		}
	}

	const removable =
		PARTIAL ?
			FILES.filter(file => !fs.existsSync(file)).map(thumbPath)
		:	fs
				.readdirSync(DEST)
				.filter(
					file => !sources.some(src => path.basename(thumbPath(src)) === file)
				)
				.map(file => path.join(DEST, file));
	for (const file of removable) {
		if (!fs.existsSync(file)) continue;
		fs.unlinkSync(file);
		removed++;
		if (PARTIAL) console.log(path.relative(process.cwd(), file).split(path.sep).join('/'));
	}

	if (PARTIAL) {
		if (errored) process.exitCode = 1;
		return;
	}

	const total = fs
		.readdirSync(DEST)
		.reduce((sum, f) => sum + fs.statSync(path.join(DEST, f)).size, 0);

	console.log(`Miniatures générées : ${generated}`);
	console.log(`Déjà à jour : ${upToDate}`);
	console.log(`Orphelines supprimées : ${removed}`);
	console.log(`Erreurs : ${errored}`);
	console.log(`Poids total des miniatures : ${fmtMB(total)} (${sources.length - errored} fichiers)`);
})();
