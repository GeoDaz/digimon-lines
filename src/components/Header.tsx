import React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import Link from 'next/link';
import Image from 'next/image';
import Icon from './Icon';
import { DISCORD_URL } from '@/consts/env';
import DropdownMenu from './DropdownMenu';
import AuthMenu from './Account/AuthMenu';
import Digivice from '@/svgs/digivice';
import Pokeball from '@/svgs/pokeball';
import Millennium from '@/svgs/millennium';
import Slime from '@/svgs/slime';

// En dessous de md les libellés laissent la place à une icône, sinon les
// quatre menus ne tiennent pas sur la largeur.
const toggleContent = (Svg: React.FC<React.SVGProps<SVGSVGElement>>, label: string) => (
	<>
		<Svg className="svg-icon d-md-none" role="img" aria-label={label} />
		<span className="d-none d-md-inline">{label}</span>
	</>
);

const Header: React.FC = () => (
	<header className="sticky-top">
		<Navbar bg="dark" variant="dark" /* expand="lg" */>
			<Container fluid className="justify-content-start gap-4 gap-max-xs-2">
				<Navbar.Brand as={Link} href="/">
					<Image
						src="/images/icon.png"
						alt="logo"
						height="26"
						width="32"
						className="mr-sm-2"
					/>{' '}
					<span className="d-none d-sm-inline-block">Digimon Lines</span>
				</Navbar.Brand>
				<Nav className="flex-grow-1">
					<DropdownMenu
						className="nav-link"
						toggle={{ content: toggleContent(Digivice, 'Digimon') }}
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
						toggle={{ content: toggleContent(Pokeball, 'Pokémon') }}
						items={[{ href: '/build/pokemon', content: 'Builder' }]}
					/>
					<DropdownMenu
						className="nav-link"
						toggle={{ content: toggleContent(Millennium, 'Yu-Gi-Oh!') }}
						items={[
							{
								href: 'https://yugioh-lines.netlify.app',
								content: 'Deck Randomizer',
							},
							{
								href: 'https://yugioh-lines.netlify.app/build',
								content: 'Steps Builder',
							},
						]}
					/>
					<DropdownMenu
						className="nav-link"
						toggle={{ content: toggleContent(Slime, 'Dragon Quest') }}
						items={[
							{
								href: 'https://dragon-quest-synth.netlify.app/build',
								target: '_blank',
								content: 'Builder',
							},
							{
								href: 'https://dragon-quest-synth.netlify.app',
								target: '_blank',
								content: 'Synthesis',
							},
						]}
					/>
				</Nav>
				<AuthMenu />
				<Link
					className="btn btn-outline-primary"
					href={DISCORD_URL}
					target="_blank"
					rel="nofollow noopener noreferrer"
					title="discord"
				>
					<span className="d-none d-lg-inline-block align-middle">
						Join us&nbsp;!
					</span>{' '}
					<Icon className="fs-6 align-middle" name="discord" />
				</Link>
			</Container>
		</Navbar>
	</header>
);
export default Header;
