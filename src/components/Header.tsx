import React from 'react';
import { Container, Navbar } from 'react-bootstrap';
import Link from 'next/link';
import Image from 'next/image';

const Header: React.FC = () => (
	<header className="sticky-top">
		<Navbar bg="dark" variant="dark" /* expand="lg" */>
			<Container fluid className="justify-content-start">
				<Navbar.Brand as={Link} href="/">
					<Image src="/images/icon.png" alt="logo" height="26" width="32" />{' '}
					Digimon Lines
				</Navbar.Brand>
				<div className="navbar-nav">
					<Link className="nav-link" href="/">
						Lines
					</Link>
					<Link className="nav-link" href="/groups">
						Groups
					</Link>
				</div>
			</Container>
		</Navbar>
	</header>
);
export default Header;
