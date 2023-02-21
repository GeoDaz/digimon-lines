import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import GoBack from './GoBack';
import Header from './Header';

interface Props {
	title: string | React.ReactNode;
	children: React.ReactNode | undefined;
}
const Layout: React.FC<Props> = ({ title, children }) => (
	<>
		<Header/>
		<main>
			<Container className="page" fluid>
				<h1>
					<GoBack /> {title}
				</h1>
				{children}
			</Container>
		</main>
	</>
);
export default Layout;
