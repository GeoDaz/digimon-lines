import React from 'react';
import { Container, Navbar } from 'react-bootstrap';
import Link from 'next/link';
import Image from 'next/image';
import Icon from './Icon';

const Header: React.FC = () => (
	<header className="sticky-top">
		<Navbar bg="dark" variant="dark" /* expand="lg" */>
			<Container fluid className="justify-content-start">
				<Navbar.Brand as={Link} href="/">
					<Image src="/images/icon.png" alt="logo" height="26" width="32" />{' '}
					Digimon Lines
				</Navbar.Brand>
				<div className="navbar-nav flex-grow-1">
					<Link className="nav-link d-max-xs-none" href="/">
						Lines
					</Link>
					<Link className="nav-link" href="/groups">
						Groups
					</Link>
				</div>
				<Link
					href="https://discord.gg/RJrEuN7cQs"
					target="_blank"
					rel="nofollow noopener noreferrer"
					title="discord"
					className="fs-4"
				>
					<Icon name="discord" />
				</Link>
			</Container>
		</Navbar>
	</header>
);
export default Header;
