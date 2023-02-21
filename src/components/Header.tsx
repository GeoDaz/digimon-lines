import React from 'react';
import { Container, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Header: React.FC = () => (
	<header>
		<Navbar bg="dark" variant="dark" /* expand="lg" */>
			<Container fluid>
				<Navbar.Brand as={Link} to="/">
					Digimon Lines
				</Navbar.Brand>
			</Container>
		</Navbar>
	</header>
);
export default Header;
