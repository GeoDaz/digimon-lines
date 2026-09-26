import React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import Link from '@/components/Link';
import Image from 'next/image';
import Icon from './Icon';
import { DISCORD_URL } from '@/consts/env';
import DropdownMenu from './DropdownMenu';
import AuthMenu from './Account/AuthMenu';
import Digivice from '@/svgs/digivice';
import Pokeball from '@/svgs/pokeball';
import Millennium from '@/svgs/millennium';
import Slime from '@/svgs/slime';

const gameMenu = (Svg: React.FC<React.SVGProps<SVGSVGElement>>, label: string) => ({
	className: 'nav-link',
	toggle: {
		content: (
			<>
				<Svg className="svg-icon d-md-none" role="img" aria-label={label} />
				<span className="d-none d-md-inline">{label}</span>
			</>
		),
	},
	header: { content: label, className: 'd-md-none' },
});

const Header: React.FC = () => (
	<header className="sticky-top">
		<Navbar bg="dark" variant="dark" /* expand="lg" */>
			<Container fluid className="justify-content-start">
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
						{...gameMenu(Digivice, 'Digimon')}
						items={[
							{ href: '/build', content: 'Builder' },
							{ href: '/community', content: 'Community' },
							{ href: '/', content: 'Families' },
							{ href: '/list', content: 'List' },
							{ href: '/groups', content: 'Groups' },
							{ href: '/vbs', content: 'DIM' },
						]}
					/>
					<DropdownMenu
						{...gameMenu(Pokeball, 'Pokémon')}
						items={[
							{ href: '/build/pokemon', content: 'Builder' },
							{ href: '/community/pokemon', content: 'Community' },
						]}
					/>
					<DropdownMenu
						{...gameMenu(Millennium, 'Yu-Gi-Oh!')}
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
						{...gameMenu(Slime, 'Dragon Quest')}
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
				<div className="d-flex gap-3 gap-max-xs-2">
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
				</div>
			</Container>
		</Navbar>
	</header>
);
export default Header;
