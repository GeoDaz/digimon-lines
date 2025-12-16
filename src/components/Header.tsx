import React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import Link from 'next/link';
import Image from 'next/image';
import Icon from './Icon';
import { DISCORD_URL } from '@/consts/env';
import DropdownMenu from './DropdownMenu';

const Header: React.FC = () => (
	<header className="sticky-top">
		<Navbar bg="dark" variant="dark" /* expand="lg" */>
			<Container fluid className="justify-content-start">
				<Navbar.Brand as={Link} href="/">
					<Image src="/images/icon.png" alt="logo" height="26" width="32" />{' '}
					<span className="d-none d-sm-inline-block">Digimon Lines</span>
				</Navbar.Brand>
				<Nav className="flex-grow-1">
					<DropdownMenu
						className="nav-link"
						toggle={{ content: 'Digimon' }}
						items={[
							{ href: '/build', content: 'Builder' },
							{ href: '/', content: 'Families' },
							{ href: '/list', content: 'List' },
							{ href: '/groups', content: 'Groups' },
							{ href: '/vbs', content: 'DIM' },
						]}
					/>
					<DropdownMenu
						className="nav-link"
						toggle={{ content: 'Pokémon' }}
						items={[{ href: '/build/pokemon', content: 'Builder' }]}
					/>
					<DropdownMenu
						className="nav-link d-none d-sm-block"
						toggle={{ content: 'Yu-Gi-Oh!' }}
						items={[
							{
								href: 'https://yugioh-lines.vercel.app',
								content: 'Deck Randomizer',
							},
							{
								href: 'https://yugioh-lines.vercel.app/build',
								content: 'Steps Builder',
							},
						]}
					/>
					<DropdownMenu
						className="nav-link d-none d-md-block"
						toggle={{ content: 'Dragon Quest' }}
						items={[
							{
								href: 'https://dragon-quest-synth.vercel.app/build',
								target: '_blank',
								content: 'Builder',
							},
							{
								href: 'https://dragon-quest-synth.vercel.app',
								target: '_blank',
								content: 'Synthesis',
							},
						]}
					/>
				</Nav>
				<Link
					href={DISCORD_URL}
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
