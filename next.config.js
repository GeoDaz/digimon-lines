// Renommages / migrations de lines : { ancienNom: nouveauNom }.
// Chaque entrée génère une redirection 301 /lines/ancien -> /lines/nouveau.
const lineRedirects = require('./redirects.json');
const path = require('path');

module.exports = () => ({
	reactStrictMode: true,
	async redirects() {
		return [
			{
				source: '/lines',
				destination: '/',
				permanent: true,
			},
			...Object.entries(lineRedirects).map(([from, to]) => ({
				source: `/lines/${from}`,
				destination: `/lines/${to}`,
				permanent: true,
			})),
		];
	},
	webpack: config => {
		config.resolve.fallback = { fs: false };
		// Liste des images digimon + noms doublés, calculés au build depuis le
		// disque et embarqués dans le chunk des données communes (voir
		// src/data/sharedDigimonData.ts).
		config.module.rules.push({
			test: path.join(__dirname, 'src', 'data', 'digimonNames.js'),
			enforce: 'pre',
			use: path.join(__dirname, 'src', 'data', 'digimonNames.loader.js'),
		});
		return config;
	},
	// Images servies en statique, sans optimiseur, en dev comme en prod.
	// - Dev : évite que l'optimiseur Node sature sur les pages qui affichent
	//   beaucoup d'images d'un coup (-> AbortError).
	// - Prod : les images Digimon sont déjà petites (~26 KB en moyenne). Les passer
	//   par le Netlify Image CDN (/_next/image) multiplie les transformations
	//   facturées en egress (une par couple w+q, ignorées par le cache des bots) pour
	//   un gain WebP marginal. On les sert donc en direct avec le cache long défini
	//   dans public/_headers. Les images externes (coupcritique.fr) sont alors
	//   chargées directement côté navigateur, ce qui évite le 400 de /_next/image.
	images: { unoptimized: true },
});
