import React from 'react';
import { Container } from 'react-bootstrap';
import GoBack from '@/components/GoBack';
import Head from 'next/head';

interface Props {
	title: string | React.ReactNode;
	children: React.ReactNode;
	metatitle?: string;
	metadescription?: string;
	noGoBack?: boolean;
}
const Layout: React.FC<Props> = ({
	title,
	children,
	metatitle,
	metadescription,
	noGoBack = false,
}) => (
	<>
		<Head>
			<title>{metatitle ? `${metatitle} | Digimon Lines` : 'Digimon Lines'}</title>
			<meta
				name="description"
				content={metadescription || 'List lines of Digimon species'}
			/>
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
export default Layout;
