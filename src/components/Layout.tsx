import React from 'react';
import { Container } from 'react-bootstrap';
import GoBack from '@/components/GoBack';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { SITE_URL } from '@/consts/env';

interface Props {
	title: string | React.ReactNode;
	children: React.ReactNode;
	metatitle?: string;
	metadescription?: string;
	metaimg?: string;
	noGoBack?: boolean;
	noIndex?: boolean;
}
const Layout: React.FC<Props> = ({
	title,
	children,
	metatitle,
	metadescription,
	metaimg = 'image.png',
	noGoBack = false,
	noIndex = false,
}) => {
	const router = useRouter();
	const trueMetaTitle = metatitle ? `${metatitle} | Digimon Lines` : 'Digimon Lines';
	const url = `${SITE_URL}${router.asPath.split(/[?#]/)[0]}`;
	const indexable = !noIndex;
	return (
		<>
			<Head>
				<title>{trueMetaTitle}</title>
				<meta name="title" content={trueMetaTitle} />
				<meta property="og:title" content={trueMetaTitle} />
				<meta name="robots" content={indexable ? 'index, follow' : 'noindex'} />
				{indexable && <link rel="canonical" href={url} />}
				{indexable && <meta property="og:url" content={url} />}
				{/* here because refused from _document.tsx */}
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta
					name="description"
					content={metadescription || 'List lines of Digimon species'}
				/>
				<meta
					property="og:description"
					content={metadescription || 'List lines of Digimon species'}
				/>
				<meta property="og:image" content={`${SITE_URL}/images/${metaimg}`} />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:image" content={`${SITE_URL}/images/${metaimg}`} />
			</Head>
			<main>
				<Container className="page" fluid>
					<h1>
						{!noGoBack && <GoBack />} {title}
					</h1>
					{children}
				</Container>
			</main>
		</>
	);
};
export default Layout;
