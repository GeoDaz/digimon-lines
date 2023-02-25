import React from 'react';
import { Container, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Header: React.FC = () => (
	<header className="sticky-top">
		<Navbar bg="dark" variant="dark" /* expand="lg" */>
			<Container fluid>
				<Navbar.Brand as={Link} to="/">
					<img src="/images/icon.png" alt="logo" /> Digimon Lines
				</Navbar.Brand>
			</Container>
		</Navbar>
	</header>
);
export default Header;
