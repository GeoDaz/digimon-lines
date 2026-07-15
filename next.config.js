module.exports = () => ({
	reactStrictMode: true,
	async redirects() {
		return [
			{
				source: '/lines',
				destination: '/',
				permanent: true,
			},
		];
	},
	webpack: config => {
		config.resolve.fallback = { fs: false };
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
