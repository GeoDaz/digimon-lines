module.exports = {
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
	webpack: (config) => {
		config.resolve.fallback = { fs: false };
		return config;
	  },
};
