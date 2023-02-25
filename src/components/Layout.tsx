import React from 'react';
import { Container } from 'react-bootstrap';
import useScrollRestoration from '../hooks/useScrollRestoration';
import GoBack from './GoBack';
import Header from './Header';

interface Props {
	title: string | React.ReactNode;
	children: React.ReactNode;
}
const Layout: React.FC<Props> = ({ title, children }) => {
	useScrollRestoration();
	return (
		<>
			<Header />
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
};
export default Layout;
