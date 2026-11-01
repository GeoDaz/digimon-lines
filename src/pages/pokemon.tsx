import React from 'react';
import Layout from '@/components/Layout';
import Link from '@/components/Link';
import Icon from '@/components/Icon';
import LineShowcase from '@/components/Home/LineShowcase';
import { Line, LinePoint } from '@/types/Line';

const EEVEE_COLUMN = 3;

const eeveelutions: [string, string][] = [
	['Vaporeon', 'marine'],
	['Jolteon', 'electric'],
	['Flareon', 'fire'],
	['Espeon', 'gold'],
	['Umbreon', 'dark'],
	['Leafeon', 'grass'],
	['Glaceon', 'ice'],
	['Sylveon', 'light'],
];

const eevee: Line = {
	size: 2,
	levels: ['Base', 'Evolution'],
	columns: eeveelutions.map(([name, color], x) => {
		const evolution: LinePoint = {
			name,
			from: [[EEVEE_COLUMN + 0.5 - x, -1]],
			color: [color],
		};
		return x == EEVEE_COLUMN ?
				[{ name: 'Eevee', xSize: 2, from: null }, evolution]
			:	[null, evolution];
	}),
};

const PagePokemon: React.FC = () => (
	<Layout
		noTitle
		title="Pokémon lines"
		metatitle="Pokémon evolution line builder"
		metadescription="Draw any Pokémon evolution line on a grid: link evolutions, color each branch, add your own images, then export it as an image or share it with the community."
		metaimg="pokemon.png"
		className="home"
	>
		<section className="home-hero">
			<div className="home-hero-text">
				<p className="home-eyebrow">
					<Icon name="stars" /> Free · Fan-made · No install
				</p>
				<h1 className="home-title">
					Draw any <span className="home-title-accent">Pokémon evolution line</span>
				</h1>
				<p className="home-lead">
					The Digimon Lines builder works with Pokémon too: place them on a grid,
					link their evolutions, color each branch, then export or share your
					line.
				</p>
				<div className="home-actions">
					<Link href="/build/pokemon" className="btn btn-primary btn-lg">
						Open the Pokémon builder <Icon name="arrow-right" />
					</Link>
					<Link href="/community/pokemon" className="btn btn-outline-light btn-lg">
						<Icon name="people-fill" /> Community lines
					</Link>
				</div>
			</div>
			<div className="home-hero-visual">
				<LineShowcase line={eevee} label="Eevee line" licence="pokemon" zoom={35} />
			</div>
		</section>

		<section className="home-feature">
			<div className="home-feature-text">
				<p className="home-kicker">
					<Icon name="pencil-fill" /> Builder
				</p>
				<h2 className="home-feature-title">Your evolution trees, your way</h2>
				<p>
					Official evolutions, regional variants, fan theories or fakemon: link
					any Pokémon to any other and tell the story you want.
				</p>
				<ul className="home-checks">
					<li>
						<Icon name="check2" />
						Search every Pokémon by name
					</li>
					<li>
						<Icon name="check2" />
						Add sub-images, or your own images from a URL or an upload
					</li>
					<li>
						<Icon name="check2" />
						Export your line as an image or as a code file
					</li>
				</ul>
			</div>
			<div className="home-feature-text">
				<p className="home-kicker">
					<Icon name="people-fill" /> Community
				</p>
				<h2 className="home-feature-title">Share it with other fans</h2>
				<p>
					Sign in with Discord to keep your lines on every device, then keep them
					private, share them with a link or publish them to the community.
				</p>
				<ul className="home-checks">
					<li>
						<Icon name="check2" />
						Browse the Pokémon lines published by other fans
					</li>
					<li>
						<Icon name="check2" />
						Search them by Pokémon or title
					</li>
					<li>
						<Icon name="check2" />
						Like your favorites
					</li>
				</ul>
			</div>
		</section>

		<section className="home-cta">
			<h2>Ready to draw your first line?</h2>
			<p>Start from scratch, or have a look at the Digimon lines for inspiration.</p>
			<div className="home-cta-actions">
				<Link href="/build/pokemon" className="btn btn-primary btn-lg">
					Open the Pokémon builder <Icon name="arrow-right" />
				</Link>
				<Link href="/" className="btn btn-outline-light btn-lg">
					Digimon lines
				</Link>
			</div>
		</section>
	</Layout>
);

export default PagePokemon;
