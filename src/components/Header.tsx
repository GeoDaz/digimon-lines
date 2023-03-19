import React from 'react';
import { Container, Navbar } from 'react-bootstrap';
import Link from 'next/link';
import Image from 'next/image';

const Header: React.FC = () => (
	<header className="sticky-top">
		<Navbar bg="dark" variant="dark" /* expand="lg" */>
			<Container fluid>
				<Navbar.Brand as={Link} href="/">
					<Image src="/images/icon.png" alt="logo" height="22" width="28" />{' '}
					Digimon Lines
				</Navbar.Brand>
			</Container>
		</Navbar>
	</header>
);
export default Header;
