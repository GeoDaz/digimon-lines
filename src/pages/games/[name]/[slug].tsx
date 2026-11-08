import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '@/components/Layout';
import Link from '@/components/Link';
import Icon from '@/components/Icon';
import GameDigimonImg from '@/components/Game/GameDigimonImg';
import AttributeIcon from '@/components/Game/AttributeIcon';
import {
	DetailsCard,
	DetailsConditions,
	DetailsEffectiveness,
	DetailsFacts,
	DetailsResistances,
	DetailsSkills,
	DetailsStats,
	DetailsSupport,
	StatScale,
	getStatScale,
} from '@/components/Game/GameDigimonDetails';
import { digimonGames } from '@/consts/games';
import { SITE_URL } from '@/consts/env';
import { capitalize, makeClassName } from '@/functions';
import { lineToArray, thumbsToNames } from '@/functions/line';
import {
	DigimonGame,
	GameDigimon,
	GameDigimonDetails,
	GameDigimonsDetails,
} from '@/types/GameDigimon';

type RelatedDigimon = Pick<GameDigimon, 'slug' | 'name' | 'generation'> &
	Partial<Pick<GameDigimon, 'image' | 'icon'>>;

interface Props {
	game: DigimonGame;
	digimon: GameDigimon;
	details: GameDigimonDetails | null;
	scale: StatScale;
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

const hiddenFacts = ['Name'];

const PageGameDigimon: React.FC<Props> = ({
	game,
	digimon,
	details,
	scale,
	related,
	line,
	otherGames,
	prev,
	next,
}) => {
	const gameUrl = `/games/${game.key}`;
	const href = (slug: string) => `${gameUrl}/${slug}`;
	const names = (slugs: string[]) => slugs.map(slug => related[slug]?.name || slug);
	const valid = (value?: string) => !!value && value !== 'None';
	const profile = [digimon.generation, digimon.attribute, digimon.type]
		.filter(valid)
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
		160,
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

	const tags = [
		{ label: game.labels.generation, value: digimon.generation, icon: false },
		{ label: game.labels.attribute, value: digimon.attribute, icon: true },
		{ label: game.labels.type, value: digimon.type, icon: !!game.typeIcons },
	].filter(tag => valid(tag.value));
	const facts = (details?.facts || []).filter(
		fact =>
			!hiddenFacts.includes(fact.label) && !tags.some(tag => tag.label === fact.label),
	);
	const conditions = details?.conditions?.rows.length ? details.conditions : null;
	const hasMatchup = !!details?.effectiveness?.length;
	const hasSupport = !!details?.supportSkills?.length;

	return (
		<Layout
			title={digimon.name}
			metatitle={`${digimon.name} evolutions, stats & skills – ${game.shortTitle}`}
			metadescription={metadescription}
			metaimg={digimon.image ? `digimon/${digimon.image}.jpg` : undefined}
			className="game-digimon-page"
			noTitle
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
			<header className="game-digimon-hero">
				<span className="game-digimon-tile">
					<GameDigimonImg digimon={digimon} />
				</span>
				<div className="game-digimon-hero-body">
					<div className="game-digimon-kicker">
						<span>#{digimon.number}</span>
						<span>{game.shortTitle}</span>
					</div>
					<h1>{digimon.name}</h1>
					{!!tags.length && (
						<ul className="game-digimon-tags">
							{tags.map(tag => (
								<li key={tag.label} title={tag.label}>
									{tag.icon && <AttributeIcon attribute={tag.value} />}
									<span>
										<small>{tag.label}</small>
										{tag.value}
									</span>
								</li>
							))}
						</ul>
					)}
					<p className="game-digimon-intro">{intro}</p>
				</div>
				<GamePager prev={prev} next={next} href={href} compact />
			</header>
			{!!details?.description && (
				<blockquote className="game-digimon-description">
					{details.description}
				</blockquote>
			)}
			<div className="details-grid">
				<DetailsCard title="Evolution" heading="h2" className="wide">
					<div className="game-evolution">
						<RelationsColumn
							title="Digivolves from"
							slugs={digimon.from}
							related={related}
							href={href}
						/>
						<div className="game-evolution-current">
							<Icon name="chevron-right" className="game-evolution-arrow" />
							<span className="game-digimon-tile">
								<GameDigimonImg digimon={digimon} />
							</span>
							<Icon name="chevron-right" className="game-evolution-arrow" />
						</div>
						<RelationsColumn
							title="Digivolves into"
							slugs={digimon.to}
							related={related}
							href={href}
						/>
					</div>
					{!!digimon.modes.length && (
						<RelationsColumn
							title="Modes"
							slugs={digimon.modes}
							related={related}
							href={href}
						/>
					)}
					{!!conditions && (
						<div className="game-evolution-conditions">
							<div className="details-subheading">Requirements</div>
							<DetailsConditions table={conditions} />
						</div>
					)}
				</DetailsCard>
				{!!details?.stats && (
					<DetailsStats
						stats={details.stats}
						scale={scale}
						heading="h2"
						className={makeClassName(!facts.length && 'wide')}
					/>
				)}
				<DetailsFacts
					facts={facts}
					heading="h2"
					title="Profile"
					className={makeClassName(!details?.stats && 'wide')}
				/>
				{!!details?.resistances.length && (
					<DetailsResistances
						tables={details.resistances}
						heading="h2"
						className="wide"
					/>
				)}
				{hasMatchup && (
					<DetailsEffectiveness
						effectiveness={details!.effectiveness!}
						heading="h2"
						className={makeClassName(!hasSupport && 'wide')}
					/>
				)}
				{hasSupport && (
					<DetailsSupport
						skills={details!.supportSkills!}
						heading="h2"
						className={makeClassName(!hasMatchup && 'wide')}
					/>
				)}
				{details?.skills.map(table => (
					<DetailsSkills key={table.title} table={table} heading="h2" className="wide" />
				))}
				{(!!line || !!otherGames.length) && (
					<DetailsCard title="See also" heading="h2" className="wide">
						<ul className="game-see-also">
							{!!line && (
								<li>
									<Link href={`/lines/${line}`}>
										<Icon name="diagram-3" /> {capitalize(line)} evolution line
									</Link>
								</li>
							)}
							{otherGames.map(other => (
								<li key={other.key}>
									<Link href={`/games/${other.key}/${digimon.slug}`}>
										<Icon name="controller" /> {digimon.name} in {other.title}
									</Link>
								</li>
							))}
						</ul>
					</DetailsCard>
				)}
			</div>
			{!details && <p className="details-empty">No data for this Digimon.</p>}
			<GamePager prev={prev} next={next} href={href} />
			<div className="game-digimon-back">
				<Link href={gameUrl} className="btn btn-dark">
					<Icon name="grid-3x3-gap" /> All {game.shortTitle} Digimon
				</Link>
			</div>
		</Layout>
	);
};

const GamePager = ({
	prev,
	next,
	href,
	compact,
}: {
	prev: RelatedDigimon | null;
	next: RelatedDigimon | null;
	href: (slug: string) => string;
	compact?: boolean;
}) => (
	<nav
		className={makeClassName('game-digimon-pager', compact && 'compact')}
		aria-label="Previous and next Digimon"
	>
		{[
			{ item: prev, label: 'Previous', icon: 'arrow-left', rel: 'prev' },
			{ item: next, label: 'Next', icon: 'arrow-right', rel: 'next' },
		].map(({ item, label, icon, rel }) =>
			item ?
				<Link
					key={rel}
					href={href(item.slug)}
					className={makeClassName('game-digimon-pager-link', rel)}
					title={`${label}: ${item.name}`}
				>
					<Icon name={icon} />
					{!compact && (
						<>
							<span className="game-digimon-tile small">
								<GameDigimonImg digimon={item as GameDigimon} />
							</span>
							<span>
								<small>{label}</small>
								{item.name}
							</span>
						</>
					)}
				</Link>
			:	<span
					key={rel}
					className={makeClassName('game-digimon-pager-link', rel, 'void')}
				/>,
		)}
	</nav>
);

const RelationsColumn = ({
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
	<div className="game-relations-column">
		<div className="details-subheading">
			{title}
			<span className="details-count">{slugs.length}</span>
		</div>
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
		:	<p className="details-empty">None</p>}
	</div>
);

let lineByDigimon: { [name: string]: string } | undefined;
const getLineByDigimon = () => {
	if (lineByDigimon) return lineByDigimon;
	lineByDigimon = {};
	const lines = thumbsToNames(require('../../../../public/json/lines/_index.json'));
	for (const line of lines) {
		try {
			lineToArray(require(`../../../../public/json/lines/${line}.json`)).forEach(
				name => (lineByDigimon![name] ??= line),
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

const statScales: { [game: string]: StatScale } = {};

const toRelated = ({
	slug,
	name,
	generation,
	image,
	icon,
}: GameDigimon): RelatedDigimon =>
	JSON.parse(JSON.stringify({ slug, name, generation, image, icon }));

export const getStaticPaths: GetStaticPaths = async () => ({
	paths: Object.keys(digimonGames).flatMap(name =>
		loadDigimons(name).map(digimon => ({ params: { name, slug: digimon.slug } })),
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
	const details: GameDigimonsDetails = require(
		`../../../../public/json/games/${game.key}/details.json`,
	);
	statScales[game.key] ??= getStatScale(details);
	const bySlug = Object.fromEntries(digimons.map(item => [item.slug, item]));
	const related = Object.fromEntries(
		[...digimon.from, ...digimon.to, ...digimon.modes]
			.filter(slug => bySlug[slug])
			.map(slug => [slug, toRelated(bySlug[slug])]),
	);
	const lines = getLineByDigimon();
	const line =
		lines[digimon.image || ''] || lines[digimon.slug.replace(/-/g, '_')] || null;
	const otherGames = Object.values(digimonGames)
		.filter(
			other =>
				other.key !== game.key &&
				loadDigimons(other.key).some(item => item.slug === digimon.slug),
		)
		.map(other => ({ key: other.key, title: other.title }));

	return {
		props: {
			game,
			digimon,
			details: details[digimon.slug] || null,
			scale: statScales[game.key],
			related,
			line,
			otherGames,
			prev: index > 0 ? toRelated(digimons[index - 1]) : null,
			next: index < digimons.length - 1 ? toRelated(digimons[index + 1]) : null,
		},
	};
};

export default PageGameDigimon;
