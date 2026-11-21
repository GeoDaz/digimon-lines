import React from 'react';
import Layout from '@/components/Layout';
import Link from '@/components/Link';
import Icon from '@/components/Icon';
import LineShowcase from '@/components/Home/LineShowcase';
import { Line } from '@/types/Line';

const BLUE_EYES = 'Blue-Eyes White Dragon';

const ultimateDragon: Line = {
	size: 2,
	levels: ['Hand', 'Field'],
	columns: [
		[{ name: BLUE_EYES, from: null }, null],
		[
			{ name: BLUE_EYES, from: null },
			{
				name: 'Blue-Eyes Ultimate Dragon',
				from: [
					[-1, -1],
					[0, -1],
					[1, -1],
				],
				color: ['marine'],
			},
		],
		[{ name: BLUE_EYES, from: null }, null],
	],
};

const PageYugioh: React.FC = () => (
	<Layout
		noTitle
		title="Yu-Gi-Oh! lines"
		metatitle="Yu-Gi-Oh! combo builder and card tools"
		metadescription="Draw your Yu-Gi-Oh! combos step by step, line up your favorite cards on a colorful picture, or get a randomized deck."
		metaimg="yugioh.png"
		className="home"
	>
		<section className="home-hero">
			<div className="home-hero-text">
				<h1 className="home-title">
					Draw your <span className="home-title-accent">Yu-Gi-Oh! combos</span>
				</h1>
				<p className="home-lead">
					The Digimon Lines builder works with Yu-Gi-Oh! too: place your cards
					from the deck to the hand, the field and the graveyard, link each step,
					then export or share your combo.
				</p>
				<div className="home-actions">
					<Link href="/build/yugioh" className="btn btn-primary btn-lg">
						Open the Yu-Gi-Oh! builder <Icon name="arrow-right" />
					</Link>
					<Link href="/community/yugioh" className="btn btn-outline-light btn-lg">
						<Icon name="people-fill" /> Community lines
					</Link>
				</div>
			</div>
			<div className="home-hero-visual">
				<LineShowcase
					line={ultimateDragon}
					label="Blue-Eyes Ultimate Dragon"
					licence="yugioh"
					zoom={35}
				/>
			</div>
		</section>

		<section className="home-feature">
			<div className="home-feature-text">
				<p className="home-kicker">
					<Icon name="images" /> Card lines
				</p>
				<h2 className="home-feature-title">Show off your cards</h2>
				<p>
					Line up your favorite cards, from a single combo to a whole deck, on a
					colorful background, then download the picture.
				</p>
				<ul className="home-checks">
					<li>
						<Icon name="check2" />
						Search every card by name, alternative arts included
					</li>
					<li>
						<Icon name="check2" />
						Background colors from the card frames, a custom gradient or your
						own image
					</li>
					<li>
						<Icon name="check2" />
						Add your custom cards from a URL or an upload
					</li>
				</ul>
				<Link href="/yugioh/cards" className="btn btn-outline-light">
					Open the card line maker <Icon name="arrow-right" />
				</Link>
			</div>
			<div className="home-feature-text">
				<p className="home-kicker">
					<Icon name="shuffle" /> Deck Randomizer
				</p>
				<h2 className="home-feature-title">Need a new deck idea?</h2>
				<p>
					Get a random deck built from the most played cards, pick the format and
					how consistent it should be, then export it.
				</p>
				<ul className="home-checks">
					<li>
						<Icon name="check2" />
						Master Duel, TCG and OCG formats
					</li>
					<li>
						<Icon name="check2" />
						From full randomness to a consistent deck
					</li>
					<li>
						<Icon name="check2" />
						Export your deck as a .ydk file
					</li>
				</ul>
				<Link href="/yugioh/randomizer" className="btn btn-outline-light">
					Randomize a deck <Icon name="arrow-right" />
				</Link>
			</div>
		</section>

		<section className="home-cta">
			<h2>Ready to draw your first combo?</h2>
			<p>
				Start from scratch, or have a look at the Digimon lines for inspiration.
			</p>
			<div className="home-cta-actions">
				<Link href="/build/yugioh" className="btn btn-primary btn-lg">
					Open the Yu-Gi-Oh! builder <Icon name="arrow-right" />
				</Link>
				<Link href="/" className="btn btn-outline-light btn-lg">
					Digimon lines
				</Link>
			</div>
		</section>
	</Layout>
);

export default PageYugioh;
