import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en" data-bs-theme="dark">
			<Head>
				<meta charSet="utf-8" />
				<meta property="og:locale" content="en_US" />
				<meta name="theme-color" content="#212529" />
				<meta name="MobileOptimized" content="width" />
				<meta property="og:site_name" content="Digimon Lines" />
				<meta property="og:type" content="website" />
				<link rel="icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" href="/images/icons/maskable_icon_x192.png" />
				<link rel="manifest" href="/manifest.json" />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
