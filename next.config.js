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
};
