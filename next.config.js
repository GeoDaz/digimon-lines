const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = phase => ({
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
	// En dev : pas d'optimiseur local (sinon l'optimiseur Node sature sur les
	// pages qui affichent beaucoup d'images d'un coup -> AbortError).
	// En prod : Netlify Image CDN gère le redimensionnement + AVIF/WebP + cache edge,
	// sans modifier les composants.
	images:
		phase === PHASE_DEVELOPMENT_SERVER
			? { unoptimized: true }
			: { formats: ['image/avif', 'image/webp'] },
});
