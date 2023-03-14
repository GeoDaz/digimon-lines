import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@/styles/index.css';
import type { AppProps } from 'next/app';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ErrorBoundary>
			<Component {...pageProps} />
		</ErrorBoundary>
	);
}
