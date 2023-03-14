import { Html, Head, Main, NextScript } from 'next/document';
import Header from '@/components/Header';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta charSet="utf-8" />
				<meta name="theme-color" content="#000000" />
				<link rel="icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" href="/logo192.png" />
				<link rel="manifest" href="/manifest.json" />
			</Head>
			<body>
				<Header />
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
