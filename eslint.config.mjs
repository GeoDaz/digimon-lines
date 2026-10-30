import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
	...nextCoreWebVitals,
	{
		rules: {
			'react-hooks/exhaustive-deps': 'off',
			'react/no-unescaped-entities': 'off',
			'react-hooks/set-state-in-effect': 'warn',
			'react-hooks/refs': 'warn',
			'react-hooks/immutability': 'warn',
			'react-hooks/preserve-manual-memoization': 'warn',
		},
	},
	{
		ignores: ['.next/**', '.open-next/**', '.wrangler/**', '.netlify/**', 'node_modules/**', 'next-env.d.ts'],
	},
];

export default eslintConfig;
