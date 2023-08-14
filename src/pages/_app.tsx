import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@/styles/index.css';
import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ErrorBoundary>
			<Component {...pageProps} />
			<Analytics />
		</ErrorBoundary>
	);
}
