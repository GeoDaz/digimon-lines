import React from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { Row, Col } from 'react-bootstrap';
import Layout from '@/components/Layout';
import Link from '@/components/Link';
import Icon from '@/components/Icon';
import LinePoint from '@/components/Line/LinePoint';
import LineShowcase from '@/components/Home/LineShowcase';
import transformLine, { lineExcerpt, thumbsToNames } from '@/functions/line';
import { digimonGames } from '@/consts/games';
import { DISCORD_URL, SITE_URL } from '@/consts/env';
import { Line, LineThumb } from '@/types/Line';

const FEATURED = 14;

const websiteJsonLd = {
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	name: 'Digimon Lines',
	url: `${SITE_URL}/`,
	potentialAction: {
		'@type': 'SearchAction',
		target: `${SITE_URL}/lines?search={search_term_string}`,
		'query-input': 'required name=search_term_string',
	},
};

interface Stats {
	lines: number;
	digimons: number;
	vpets: number;
	groups: number;
}

interface Props {
	agumon: Line;
	gekkomon: Line;
	featured: LineThumb[];
	stats: Stats;
}

const formatNumber = (value: number) => value.toLocaleString('en-US');

const PageHome: React.FC<Props> = ({ agumon, gekkomon, featured, stats }) => (
	<Layout
		noTitle
		title="Digimon Lines"
		metatitle="Digimon evolution lines, builder and Virtual Pets"
		metadescription="Every Digimon evolution line grouped by species, from Agumon to Gekkomon: follow each digivolution from Baby to Mega, build and share your own lines, and explore game evolutions, Virtual Pets and Digimon groups."
		className="home"
	>
		<Head>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
			/>
		</Head>

		<section className="home-hero">
			<div className="home-hero-text">
				<h1 className="home-title">
					Every Digimon evolution line,{' '}
					<span className="home-title-accent">grouped by species</span>
				</h1>
				<p className="home-lead">
					Follow how each species digivolves from Baby to Mega, explore game
					evolutions and Virtual Pets, and build your own lines to share with
					the community.
				</p>
				<div className="home-actions mb-3">
					<Link href="/build" className="btn btn-primary btn-lg">
						<Icon name="diagram-2-fill" /> Build a line
					</Link>
					<Link href="/lines" className="btn btn-primary btn-lg">
						<Icon name="grid-3x3-gap-fill" /> Browse the lines
					</Link>
				</div>
				<div className="home-actions">
					{Object.values(digimonGames).map(game => (
						<Link
							key={game.key}
							href={`/games/${game.key}`}
							className="btn btn-outline-light btn-lg"
						>
							<Icon name="controller" /> {game.shortTitle}
						</Link>
					))}
				</div>
			</div>
			<div className="home-hero-visual">
				<LineShowcase line={agumon} label="Agumon line" zoom={40} />
			</div>
		</section>

		<section className="home-featured">
			<div className="home-section-head">
				<h2 className="home-section-title">Start with a species</h2>
				<Link href="/lines" className="home-section-link">
					See all {formatNumber(stats.lines)} lines <Icon name="arrow-right" />
				</Link>
			</div>
			<div className="line-wrapper">
				<Row className="line-row">
					{featured.map(line => (
						<Col key={line.name}>
							<LinePoint name={line.name} grid={line.grid} />
						</Col>
					))}
				</Row>
			</div>
		</section>

		<ul className="home-stats">
			<li>
				<b>{formatNumber(stats.lines)}</b>
				<span>evolution lines</span>
			</li>
			<li>
				<b>{formatNumber(stats.digimons)}</b>
				<span>Digimon</span>
			</li>
			<li>
				<b>{formatNumber(stats.vpets)}</b>
				<span>Virtual Pets</span>
			</li>
			<li>
				<b>{formatNumber(stats.groups)}</b>
				<span>groups</span>
			</li>
		</ul>

		<section className="home-feature reverse">
			<div className="home-feature-text">
				<p className="home-kicker">
					<Icon name="pencil-fill" /> Builder
				</p>
				<h2 className="home-feature-title">Build and share your own lines</h2>
				<p>
					Place Digimon on a grid, link them together, color each evolution path
					and add sub-images. Recent Digimon like Gekkomon are already there.
				</p>
				<ul className="home-checks">
					<li>
						<Icon name="check2" />
						Export your line as an image or as a code file
					</li>
					<li>
						<Icon name="check2" />
						Sign in with Discord to keep your lines on every device
					</li>
					<li>
						<Icon name="check2" />
						Keep a line private, share it with a link or publish it to the
						community
					</li>
				</ul>
				<Link href="/build" className="btn btn-primary mt-4">
					Start building <Icon name="arrow-right" />
				</Link>
			</div>
			<div className="home-feature-visual">
				<LineShowcase line={gekkomon} label="Gekkomon line" zoom={40} />
			</div>
		</section>

		<section className="home-more">
			<h2 className="home-more-title">Explore more</h2>
			<div className="home-more-grid">
				<Link href="/list" className="home-more-card">
					<Icon name="list-ol" className="home-more-icon" />
					<h3>Digimon by level</h3>
					<p>Every Digimon sorted by level, from Baby to Mega and Ultra.</p>
				</Link>
				{Object.values(digimonGames).map(game => (
					<Link
						key={game.key}
						href={`/games/${game.key}`}
						className="home-more-card"
					>
						<Icon name="controller" className="home-more-icon" />
						<h3>{game.shortTitle} evolutions</h3>
						<p>
							Every Digimon of {game.title}: digivolutions, conditions,
							stats, resistances and skills.
						</p>
					</Link>
				))}
				<Link href="/community" className="home-more-card">
					<Icon name="people-fill" className="home-more-icon" />
					<h3>Community lines</h3>
					<p>
						Lines built and published by other fans. Search them by Digimon or
						title, and like your favorites.
					</p>
				</Link>
				<Link href="/vbs" className="home-more-card">
					<Icon name="smartwatch" className="home-more-icon" />
					<h3>Virtual devices</h3>
					<p>The Digimon of every Vital Bracelet DIM and BE card.</p>
				</Link>
				<Link href="/groups" className="home-more-card">
					<Icon name="grid-3x3-gap-fill" className="home-more-icon" />
					<h3>Digimon groups</h3>
					<p>
						Royal Knights, Olympus Twelve, Seven Great Demon Lords and more.
					</p>
				</Link>
			</div>
		</section>

		<section className="home-cta home-cta-pokemon">
			<p className="home-kicker">
				<Icon name="stars" /> Not only Digimon
			</p>
			<h2>Pokémon lines too</h2>
			<p>
				The same builder works with Pokémon: draw any evolution tree and share it.
			</p>
			<div className="home-cta-actions">
				<Link href="/pokemon" className="btn btn-primary btn-lg">
					Discover Pokémon lines <Icon name="arrow-right" />
				</Link>
				<Link
					href={DISCORD_URL}
					target="_blank"
					rel="nofollow noopener noreferrer"
					className="btn btn-outline-light btn-lg"
				>
					<Icon name="discord" /> Join the Discord
				</Link>
			</div>
		</section>
	</Layout>
);

export const getStaticProps: GetStaticProps = async () => {
	const lines: LineThumb[] = require('../../public/json/lines/_index.json').map(
		(line: string | LineThumb) => (typeof line === 'string' ? { name: line } : line)
	);
	const fusions = thumbsToNames(require('../../public/json/lines/_fusion.json'));
	const agumon = transformLine(require('../../public/json/home/agumon.json'));
	const gekkomon = transformLine(require('../../public/json/home/gekkomon.json'));
	return {
		props: {
			agumon,
			gekkomon,
			featured: lines.slice(0, FEATURED),
			stats: {
				lines: lines.length + fusions.length,
				digimons: Object.keys(require('../../public/json/digimons/index.json'))
					.length,
				vpets: require('../../public/json/vb/_index.json').length,
				groups: require('../../public/json/groups/_index.json').length,
			},
		},
	};
};

export default PageHome;
