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
				<Navbar.Brand as={Link} href="/lines">
					<Image
						src="/images/icon.png"
						alt="Digimon Lines"
						height="26"
						width="32"
						priority
						className="mr-sm-2"
					/>{' '}
					<span className="d-none d-sm-inline-block ms-2">Digimon Lines</span>
				</Navbar.Brand>
				<Nav className="flex-grow-1">
					<DropdownMenu
						{...gameMenu(Digivice, 'Digimon')}
						items={[
							{ href: '/build', content: 'Builder' },
							{ href: '/cards', content: 'Card lines' },
							{ href: '/community', content: 'Community Lines' },
							{ href: '/games/dsts', content: 'Games' },
							{ href: '/lines', content: 'Families Lines' },
							{ href: '/groups', content: 'Groups' },
							{ href: '/list', content: 'Digimon List' },
							{ href: '/vbs', content: 'Virtual Pets' },
						]}
					/>
					<DropdownMenu
						{...gameMenu(Pokeball, 'Pokémon')}
						items={[
							{ href: '/build/pokemon', content: 'Builder' },
							{ href: '/pokemon/cards', content: 'Card lines' },
							{ href: '/community/pokemon', content: 'Community' },
						]}
					/>
					<DropdownMenu
						{...gameMenu(Millennium, 'Yu-Gi-Oh!')}
						items={[
							{ href: '/yugioh/cards', content: 'Card lines' },
							{ href: '/yugioh/randomizer', content: 'Deck Randomizer' },
							{ href: '/build/yugioh', content: 'Steps Builder' },
							{ href: '/community/yugioh', content: 'Community' },
						]}
					/>
					<DropdownMenu
						{...gameMenu(Slime, 'Dragon Quest')}
						items={[
							{
								href: 'https://dragon-quest-synth.com/build',
								target: '_blank',
								content: 'Builder',
							},
							{
								href: 'https://dragon-quest-synth.com',
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
