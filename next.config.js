// Renommages / migrations de lines : { ancienNom: nouveauNom }.
// Chaque entrée génère une redirection 301 /lines/ancien -> /lines/nouveau.
const lineRedirects = require('./redirects.json');
const vbNames = require('./public/json/vb/_index.json').map(vb => vb.name);
const archivedVbs = require('./public/json/archive/vb/_index.json').filter(
	name => !vbNames.includes(name)
);

module.exports = () => ({
	reactStrictMode: true,
	async redirects() {
		return [
			{
				source: '/',
				has: [{ type: 'host', value: 'www.digimon-lines.com' }],
				destination: 'https://digimon-lines.com/',
				permanent: true,
			},
			{
				source: '/:path*',
				has: [{ type: 'host', value: 'www.digimon-lines.com' }],
				destination: 'https://digimon-lines.com/:path*',
				permanent: true,
			},
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
			...archivedVbs.map(name => ({
				source: `/vbs/${name}`,
				destination: '/vbs',
				permanent: true,
			})),
		];
	},
	webpack: (config, { dev, isServer, webpack }) => {
		config.resolve.fallback = { fs: false };
		if (isServer && !dev) {
			config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^sharp$/ }));
		}
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
