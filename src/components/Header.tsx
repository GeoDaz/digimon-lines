import React from 'react';
import { Container, Navbar } from 'react-bootstrap';
import Link from 'next/link';

const Header: React.FC = () => (
	<header className="sticky-top">
		<Navbar bg="dark" variant="dark" /* expand="lg" */>
			<Container fluid>
				<Navbar.Brand as={Link} href="/">
					<img src="/images/icon.png" alt="logo" /> Digimon Lines
				</Navbar.Brand>
			</Container>
		</Navbar>
	</header>
);
export default Header;
