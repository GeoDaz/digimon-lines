import React from 'react';
import { Container } from 'react-bootstrap';
import GoBack from './GoBack';

interface Props {
	title: string | React.ReactNode;
	children: React.ReactNode | undefined;
}
const Layout: React.FC<Props> = ({ title, children }) => (
	<Container className="page" fluid>
		<h1>
			<GoBack /> {title}
		</h1>
		{children}
	</Container>
);
export default Layout;
