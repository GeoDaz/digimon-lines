import React from 'react';
import { Container } from 'react-bootstrap';
import GoBack from '@/components/GoBack';
import Head from 'next/head';
import { SITE_URL } from '@/consts/env';

interface Props {
	title: string | React.ReactNode;
	children: React.ReactNode;
	metatitle?: string;
	metadescription?: string;
	metaimg?: string;
	noGoBack?: boolean;
}
const Layout: React.FC<Props> = ({
	title,
	children,
	metatitle,
	metadescription,
	metaimg = 'og_image.png',
	noGoBack = false,
}) => {
	const trueMetaTitle = metatitle ? `${metatitle} | Digimon Lines` : 'Digimon Lines';
	return (
		<>
			<Head>
				<title>{trueMetaTitle}</title>
				<meta name="title" content={trueMetaTitle} />
				<meta name="og:title" content={trueMetaTitle} />
				{/* here because refused from _document.tsx */}
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta
					name="description"
					content={metadescription || 'List lines of Digimon species'}
				/>
				<meta
					name="og:description"
					content={metadescription || 'List lines of Digimon species'}
				/>
				<meta property="og:image" content={`${SITE_URL}/images/${metaimg}`} />
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
