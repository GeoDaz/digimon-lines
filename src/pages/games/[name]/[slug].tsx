import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '@/components/Layout';
import Link from '@/components/Link';
import Icon from '@/components/Icon';
import GameDigimonImg from '@/components/Game/GameDigimonImg';
import GameDigimonDetailsGrid from '@/components/Game/GameDigimonDetails';
import { digimonGames } from '@/consts/games';
import { SITE_URL } from '@/consts/env';
import { capitalize } from '@/functions';
import { lineToArray, thumbsToNames } from '@/functions/line';
import { DigimonGame, GameDigimon, GameDigimonDetails } from '@/types/GameDigimon';

type RelatedDigimon = Pick<GameDigimon, 'slug' | 'name' | 'generation'> &
	Partial<Pick<GameDigimon, 'image' | 'icon'>>;

interface Props {
	game: DigimonGame;
	digimon: GameDigimon;
	details: GameDigimonDetails | null;
	related: { [slug: string]: RelatedDigimon };
	line: string | null;
	otherGames: { key: string; title: string }[];
	prev: RelatedDigimon | null;
	next: RelatedDigimon | null;
}

const listNames = (names: string[]) =>
	names.length < 2 ?
		names.join('')
	:	`${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

const truncate = (text: string, max: number) =>
	text.length <= max ? text : `${text.slice(0, max - 1).replace(/[\s,]+\S*$/, '')}…`;

const PageGameDigimon: React.FC<Props> = ({
	game,
	digimon,
	details,
	related,
	line,
	otherGames,
	prev,
	next,
}) => {
	const gameUrl = `/games/${game.key}`;
	const href = (slug: string) => `${gameUrl}/${slug}`;
	const names = (slugs: string[]) => slugs.map(slug => related[slug]?.name || slug);
	const profile = [digimon.generation, digimon.attribute, digimon.type]
		.filter(value => value && value !== 'None')
		.join(' ');

	const intro = [
		`${digimon.name} is a${/^[AEIOU]/i.test(profile) ? 'n' : ''} ${profile} Digimon in ${game.title} (#${digimon.number}).`,
		digimon.from.length ?
			`It digivolves from ${listNames(names(digimon.from))}.`
		:	`It has no pre-evolution in ${game.shortTitle}.`,
		digimon.to.length ?
			`It can digivolve into ${listNames(names(digimon.to))}.`
		:	`It has no further digivolution in ${game.shortTitle}.`,
	].join(' ');

	const metadescription = truncate(
		[
			`${digimon.name} (${profile}) in ${game.title}: stats, resistances, skills and evolution conditions.`,
			digimon.from.length && `From ${listNames(names(digimon.from))}.`,
			digimon.to.length && `Into ${listNames(names(digimon.to))}.`,
		]
			.filter(Boolean)
			.join(' '),
		160
	);

	const breadcrumbJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ name: 'Digimon Lines', item: `${SITE_URL}/` },
			{ name: `${game.shortTitle} evolutions`, item: `${SITE_URL}${gameUrl}` },
			{ name: digimon.name, item: `${SITE_URL}${href(digimon.slug)}` },
		].map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, ...crumb })),
	};

	return (
		<Layout
			title={digimon.name}
			metatitle={`${digimon.name} evolutions, stats & skills – ${game.shortTitle}`}
			metadescription={metadescription}
			metaimg={digimon.image ? `digimon/${digimon.image}.jpg` : undefined}
			className="game-digimon-page"
		>
			<Head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
				/>
			</Head>
			<nav aria-label="breadcrumb">
				<ol className="breadcrumb">
					<li className="breadcrumb-item">
						<Link href="/">Home</Link>
					</li>
					<li className="breadcrumb-item">
						<Link href={gameUrl}>{game.title}</Link>
					</li>
					<li className="breadcrumb-item active" aria-current="page">
						{digimon.name}
					</li>
				</ol>
			</nav>
			<div className="game-digimon-header">
				<span className="game-digimon-tile">
					<GameDigimonImg digimon={digimon} />
				</span>
				<p className="game-digimon-intro">{intro}</p>
			</div>
			<div className="details-grid">
				<RelationsBlock
					title="Digivolves from"
					slugs={digimon.from}
					related={related}
					href={href}
				/>
				<RelationsBlock
					title="Digivolves into"
					slugs={digimon.to}
					related={related}
					href={href}
				/>
				{!!digimon.modes.length && (
					<RelationsBlock
						title="Modes"
						slugs={digimon.modes}
						related={related}
						href={href}
					/>
				)}
				{(!!line || !!otherGames.length) && (
					<section className="details-block">
						<h2>See also</h2>
						<ul className="game-see-also">
							{!!line && (
								<li>
									<Link href={`/lines/${line}`}>
										{capitalize(line)} evolution line
									</Link>
								</li>
							)}
							{otherGames.map(other => (
								<li key={other.key}>
									<Link href={`/games/${other.key}/${digimon.slug}`}>
										{digimon.name} in {other.title}
									</Link>
								</li>
							))}
						</ul>
					</section>
				)}
			</div>
			{details ?
				<GameDigimonDetailsGrid details={details} heading="h2" />
			:	<p className="cell-empty">No data for this Digimon.</p>}
			<nav className="game-digimon-pager">
				{!!prev && (
					<Link href={href(prev.slug)} className="btn btn-dark">
						<Icon name="arrow-left" /> {prev.name}
					</Link>
				)}
				<Link href={gameUrl} className="btn btn-dark">
					All {game.shortTitle} Digimon
				</Link>
				{!!next && (
					<Link href={href(next.slug)} className="btn btn-dark">
						{next.name} <Icon name="arrow-right" />
					</Link>
				)}
			</nav>
		</Layout>
	);
};

const RelationsBlock = ({
	title,
	slugs,
	related,
	href,
}: {
	title: string;
	slugs: string[];
	related: { [slug: string]: RelatedDigimon };
	href: (slug: string) => string;
}) => (
	<section className="details-block">
		<h2>{title}</h2>
		{slugs.length ?
			<ul className="game-relations">
				{slugs.map(slug => (
					<li key={slug}>
						<Link href={href(slug)}>
							<span className="game-digimon-tile small">
								<GameDigimonImg digimon={related[slug] as GameDigimon} />
							</span>
							<span>
								{related[slug]?.name || slug}
								<small>{related[slug]?.generation}</small>
							</span>
						</Link>
					</li>
				))}
			</ul>
		:	<p className="cell-empty">None</p>}
	</section>
);

let lineByDigimon: { [name: string]: string } | undefined;
const getLineByDigimon = () => {
	if (lineByDigimon) return lineByDigimon;
	lineByDigimon = {};
	const lines = thumbsToNames(require('../../../../public/json/lines/_index.json'));
	for (const line of lines) {
		try {
			lineToArray(require(`../../../../public/json/lines/${line}.json`)).forEach(
				name => (lineByDigimon![name] ??= line)
			);
		} catch (e) {
			console.error(e);
		}
	}
	lines.forEach(line => (lineByDigimon![line] = line));
	return lineByDigimon;
};

const loadDigimons = (key: string): GameDigimon[] =>
	require(`../../../../public/json/games/${key}/digimons.json`);

const toRelated = ({ slug, name, generation, image, icon }: GameDigimon): RelatedDigimon =>
	JSON.parse(JSON.stringify({ slug, name, generation, image, icon }));

export const getStaticPaths: GetStaticPaths = async () => ({
	paths: Object.keys(digimonGames).flatMap(name =>
		loadDigimons(name).map(digimon => ({ params: { name, slug: digimon.slug } }))
	),
	fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const game = digimonGames[params?.name as string];
	if (!game) return { notFound: true };
	const digimons = loadDigimons(game.key);
	const index = digimons.findIndex(digimon => digimon.slug === params?.slug);
	if (index < 0) return { notFound: true };
	const digimon = digimons[index];
	const details: { [slug: string]: GameDigimonDetails } = require(
		`../../../../public/json/games/${game.key}/details.json`
	);
	const bySlug = Object.fromEntries(digimons.map(item => [item.slug, item]));
	const related = Object.fromEntries(
		[...digimon.from, ...digimon.to, ...digimon.modes]
			.filter(slug => bySlug[slug])
			.map(slug => [slug, toRelated(bySlug[slug])])
	);
	const lines = getLineByDigimon();
	const line =
		lines[digimon.image || ''] || lines[digimon.slug.replace(/-/g, '_')] || null;
	const otherGames = Object.values(digimonGames)
		.filter(
			other =>
				other.key !== game.key &&
				loadDigimons(other.key).some(item => item.slug === digimon.slug)
		)
		.map(other => ({ key: other.key, title: other.title }));

	return {
		props: {
			game,
			digimon,
			details: details[digimon.slug] || null,
			related,
			line,
			otherGames,
			prev: index > 0 ? toRelated(digimons[index - 1]) : null,
			next: index < digimons.length - 1 ? toRelated(digimons[index + 1]) : null,
		},
	};
};

export default PageGameDigimon;
