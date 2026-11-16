import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import Layout from '@/components/Layout';
import JsonLd from '@/components/JsonLd';
import Link from '@/components/Link';
import Icon from '@/components/Icon';
import ScrollUp from '@/components/ScrollUp';
import SearchBar from '@/components/SearchBar';
import GameDigimonImg from '@/components/Game/GameDigimonImg';
import GameDigimonModal from '@/components/Game/GameDigimonModal';
import AttributeIcon from '@/components/Game/AttributeIcon';
import { getStatScale } from '@/components/Game/GameDigimonDetails';
import { digimonGames } from '@/consts/games';
import { makeClassName, stringToKey } from '@/functions';
import { getDubNamesFor } from '@/functions/search';
import { breadcrumbJsonLd, graphJsonLd, listNames, webPageJsonLd } from '@/functions/seo';
import { StringObject } from '@/types/Ui';
import { DigimonGame, GameDigimon, GameDigimonsDetails } from '@/types/GameDigimon';

type PackedRelations = (number | string)[];

type PackedDigimon = [
	slug: string,
	number: string,
	name: string,
	generation: number,
	attribute: string,
	type: string,
	extra: string,
	image: string | null,
	modes: PackedRelations,
	from: PackedRelations,
	to: PackedRelations,
	icon?: string,
];

interface Props {
	game: DigimonGame;
	generations: string[];
	packed: PackedDigimon[];
	aliases: StringObject;
}

const packDigimons = (
	game: DigimonGame,
	digimons: GameDigimon[],
	generations: string[]
): PackedDigimon[] => {
	const indexes = Object.fromEntries(digimons.map((digimon, index) => [digimon.slug, index]));
	const packRelations = (slugs: string[]) => slugs.map(slug => indexes[slug] ?? slug);
	return digimons.map(digimon => {
		const packed: PackedDigimon = [
			digimon.slug,
			digimon.number,
			digimon.name,
			generations.indexOf(digimon.generation),
			digimon.attribute ?? '',
			digimon.type ?? '',
			game.extra ? ((digimon[game.extra.key] as string | undefined) ?? '') : '',
			digimon.image === digimon.slug ? '' : (digimon.image ?? null),
			packRelations(digimon.modes),
			packRelations(digimon.from),
			packRelations(digimon.to),
		];
		if (digimon.icon) packed.push(digimon.icon);
		return packed;
	});
};

const unpackDigimons = (
	game: DigimonGame,
	packed: PackedDigimon[],
	generations: string[]
): GameDigimon[] => {
	const unpackRelations = (relations: PackedRelations) =>
		relations.map(relation =>
			typeof relation === 'number' ? packed[relation][0] : relation
		);
	return packed.map(
		([slug, number, name, generation, attribute, type, extra, image, modes, from, to, icon]) => {
			const digimon: GameDigimon = {
				slug,
				number,
				name,
				generation: generations[generation],
				attribute: attribute || undefined,
				type: type || undefined,
				image: image === '' ? slug : (image ?? undefined),
				icon,
				modes: unpackRelations(modes),
				from: unpackRelations(from),
				to: unpackRelations(to),
			};
			if (game.extra && extra) Object.assign(digimon, { [game.extra.key]: extra });
			return digimon;
		}
	);
};

const getHash = () => decodeURIComponent(window.location.hash.replace('#', ''));

const PageGame: React.FC<Props> = ({ game, generations, packed, aliases }) => {
	const digimons = useMemo(
		() => unpackDigimons(game, packed, generations),
		[game, packed, generations]
	);
	const [search, setSearch] = useState('');
	const [generation, setGeneration] = useState<string>();
	const [attribute, setAttribute] = useState<string>();
	const [type, setType] = useState<string>();
	const [resetCount, setResetCount] = useState(0);
	const [target, setTarget] = useState<string>();
	const [only, setOnly] = useState<string>();
	const [selected, setSelected] = useState<GameDigimon>();
	const [details, setDetails] = useState<GameDigimonsDetails>();
	const [loading, setLoading] = useState(false);
	const statScale = useMemo(() => details && getStatScale(details), [details]);

	const bySlug = useMemo(
		() => Object.fromEntries(digimons.map(digimon => [digimon.slug, digimon])),
		[digimons]
	);

	const attributes = useMemo(
		() =>
			Array.from(
				new Set(digimons.map(digimon => digimon.attribute).filter(Boolean))
			).sort() as string[],
		[digimons]
	);

	const types = useMemo(
		() =>
			Array.from(
				new Set(digimons.map(digimon => digimon.type).filter(Boolean))
			).sort() as string[],
		[digimons]
	);

	const filtered = useMemo(() => {
		if (only) return bySlug[only] ? [bySlug[only]] : [];
		const key = stringToKey(search);
		return digimons.filter(
			digimon =>
				(!key ||
					stringToKey(digimon.name).includes(key) ||
					(!!aliases[digimon.slug] &&
						stringToKey(aliases[digimon.slug]).includes(key))) &&
				(!generation || digimon.generation === generation) &&
				(!attribute || digimon.attribute === attribute) &&
				(!type || digimon.type === type)
		);
	}, [digimons, aliases, bySlug, only, search, generation, attribute, type]);

	const sections = useMemo(() => {
		const groups: { [generation: string]: GameDigimon[] } = {};
		filtered.forEach(digimon => (groups[digimon.generation] ??= []).push(digimon));
		const order = [
			...game.generations,
			...Object.keys(groups).filter(name => !game.generations.includes(name)),
		];
		return order
			.filter(name => groups[name])
			.map(name => ({ generation: name, digimons: groups[name] }));
	}, [filtered, game.generations]);

	const resetFilters = useCallback(() => {
		setOnly(undefined);
		setSearch('');
		setGeneration(undefined);
		setAttribute(undefined);
		setType(undefined);
		setResetCount(count => count + 1);
	}, []);

	useEffect(() => {
		const onHashChange = () => setTarget(getHash() || undefined);
		onHashChange();
		window.addEventListener('hashchange', onHashChange);
		return () => window.removeEventListener('hashchange', onHashChange);
	}, []);

	useEffect(() => {
		if (!target) return;
		if (!filtered.some(digimon => digimon.slug === target)) {
			if (bySlug[target]) resetFilters();
			return;
		}
		document
			.getElementById(target)
			?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}, [target, filtered, bySlug, resetFilters]);

	const navigate = useCallback(
		(slug: string) => {
			if (search && bySlug[slug]) {
				setOnly(slug);
				setSearch(bySlug[slug].name);
				setGeneration(undefined);
				setAttribute(undefined);
				setType(undefined);
				setResetCount(count => count + 1);
			}
			window.history.replaceState(null, '', `#${slug}`);
			setTarget(slug);
		},
		[search, bySlug]
	);

	const openDetails = useCallback(
		(digimon: GameDigimon) => {
			setSelected(digimon);
			if (details || loading) return;
			setLoading(true);
			fetch(`/json/games/${game.key}/details.json`)
				.then(res => res.json())
				.then(setDetails)
				.catch(console.error)
				.finally(() => setLoading(false));
		},
		[details, loading, game.key]
	);

	const clearTarget = useCallback(() => {
		if (window.location.hash) {
			window.history.replaceState(
				null,
				'',
				window.location.pathname + window.location.search
			);
		}
		setTarget(undefined);
	}, []);

	const withoutTarget =
		<T,>(setter: (value: T) => void) =>
		(value: T) => {
			clearTarget();
			setOnly(undefined);
			setter(value);
		};

	const hasFilters = !!search || !!generation || !!attribute || !!type;
	const counts = game.generations
		.map(name => ({ name, count: digimons.filter(d => d.generation === name).length }))
		.filter(item => item.count);
	const columns = [
		game.labels.attribute.toLowerCase(),
		game.labels.type.toLowerCase(),
		game.extra?.label.toLowerCase(),
		'modes',
	].filter(Boolean) as string[];
	const path = `/games/${game.key}`;
	const metatitle = `${game.title} evolution chart (${digimons.length} Digimon)`;
	const metadescription = `Complete ${game.title} digivolution chart: all ${digimons.length} Digimon with what they evolve from and into, evolution conditions, stats, resistances and skills.`;
	const jsonLd = graphJsonLd(
		breadcrumbJsonLd([{ name: `${game.shortTitle} evolution chart`, path }]),
		webPageJsonLd('CollectionPage', path, metatitle, metadescription, {
			about: { '@type': 'VideoGame', name: game.title },
		})
	);

	return (
		<Layout
			title={`${game.title} evolution chart`}
			metatitle={metatitle}
			metadescription={metadescription}
		>
			<JsonLd data={jsonLd} />
			<ScrollUp />
			<nav className="game-tabs mb-3">
				{Object.values(digimonGames).map(item => (
					<Link
						key={item.key}
						href={`/games/${item.key}`}
						className={makeClassName(
							'btn btn-dark',
							item.key === game.key && 'active'
						)}
					>
						{item.shortTitle}
					</Link>
				))}
			</nav>
			<p className="game-intro">
				This {game.title} evolution chart lists all {digimons.length} Digimon of the
				game by {game.labels.generation.toLowerCase()}:{' '}
				{listNames(counts.map(item => `${item.name} (${item.count})`))}. For each
				Digimon, the table shows its {listNames(columns)}, and every Digimon it
				digivolves from and into. Search or filter the list, then open a Digimon for
				its evolution conditions, stats, resistances and skills.
			</p>
			<div className="evolution-filters">
				<SearchBar
					key={resetCount}
					label="Search a Digimon"
					defaultValue={search}
					onSubmit={withoutTarget((value?: string) => setSearch(value || ''))}
				/>
				<FilterDropdown
					id="generation-selector"
					label={game.labels.generation}
					value={generation}
					options={game.generations}
					onChange={withoutTarget(setGeneration)}
				/>
				<FilterDropdown
					id="attribute-selector"
					label={game.labels.attribute}
					value={attribute}
					options={attributes}
					onChange={withoutTarget(setAttribute)}
				/>
				{!!game.typeFilter && (
					<FilterDropdown
						id="type-selector"
						label={game.labels.type}
						value={type}
						options={types}
						onChange={withoutTarget(setType)}
					/>
				)}
				{hasFilters && (
					<button type="button" className="filter-reset" onClick={withoutTarget(resetFilters)}>
						<Icon name="x" /> Clear filters
					</button>
				)}
				<span className="filter-count">{filtered.length}&nbsp;Digimon</span>
			</div>
			{sections.length ?
				<div className="table-responsive">
					<table className="table evolution-table">
						<thead>
							<tr>
								<th className="cell-digimon">Digimon</th>
								<th className="cell-details" />
								<th className="cell-attribute">
									{game.labels.attribute}
								</th>
								<th
									className={makeClassName(
										game.typeIcons && 'cell-attribute'
									)}
								>
									{game.labels.type}
								</th>
								{!!game.extra && <th>{game.extra.label}</th>}
								<th className="cell-relations">Modes</th>
								<th className="cell-relations">Evolves from</th>
								<th className="cell-relations">Evolves into</th>
							</tr>
						</thead>
						{sections.map(section => (
							<tbody key={section.generation}>
								<tr>
									<th
										colSpan={game.extra ? 8 : 7}
										className="group-cell"
									>
										<h2
											className="generation-heading"
											id={stringToKey(section.generation)}
										>
											<span>{section.generation}</span>
											<span className="generation-count">
												({section.digimons.length})
											</span>
											<span className="generation-rule" />
										</h2>
									</th>
								</tr>
								{section.digimons.map(digimon => (
									<EvolutionRow
										key={digimon.slug}
										game={game}
										digimon={digimon}
										bySlug={bySlug}
										active={target === digimon.slug}
										onNavigate={navigate}
										onDetails={openDetails}
									/>
								))}
							</tbody>
						))}
					</table>
				</div>
			:	<p>No Digimon found.</p>}
			{!!selected && (
				<GameDigimonModal
					digimon={selected}
					details={details?.[selected.slug]}
					scale={statScale}
					loading={loading}
					href={`/games/${game.key}/${selected.slug}`}
					handleClose={() => setSelected(undefined)}
				/>
			)}
		</Layout>
	);
};

const FilterDropdown = ({
	id,
	label,
	value,
	options,
	onChange,
}: {
	id: string;
	label: string;
	value?: string;
	options: string[];
	onChange: (value?: string) => void;
}) => (
	<DropdownButton
		id={id}
		variant="dark"
		className={makeClassName('filter-dropdown', !!value && 'filter-active')}
		title={value || label}
	>
		{!!value && (
			<Dropdown.Item onClick={() => onChange(undefined)}>
				<Icon name="x" /> Void
			</Dropdown.Item>
		)}
		{options.map(option => (
			<Dropdown.Item
				key={option}
				active={value === option}
				onClick={() => onChange(option)}
			>
				{option}
			</Dropdown.Item>
		))}
	</DropdownButton>
);

const revealCallbacks = new Map<Element, () => void>();
let revealObserver: IntersectionObserver | undefined;

const observeReveal = (element: Element, callback: () => void) => {
	if (typeof IntersectionObserver === 'undefined') {
		callback();
		return undefined;
	}
	revealObserver ??= new IntersectionObserver(
		entries =>
			entries.forEach(entry => {
				if (!entry.isIntersecting) return;
				revealObserver?.unobserve(entry.target);
				const reveal = revealCallbacks.get(entry.target);
				revealCallbacks.delete(entry.target);
				reveal?.();
			}),
		{ rootMargin: '800px 0px' }
	);
	revealCallbacks.set(element, callback);
	revealObserver.observe(element);
	return () => {
		revealObserver?.unobserve(element);
		revealCallbacks.delete(element);
	};
};

const useReveal = <T extends Element>(force: boolean) => {
	const ref = useRef<T>(null);
	const [revealed, setRevealed] = useState(false);
	useEffect(() => {
		if (revealed || !ref.current) return;
		return observeReveal(ref.current, () => setRevealed(true));
	}, [revealed]);
	return [ref, revealed || force] as const;
};

const EvolutionRow = React.memo(function EvolutionRow({
	game,
	digimon,
	bySlug,
	active,
	onNavigate,
	onDetails,
}: {
	game: DigimonGame;
	digimon: GameDigimon;
	bySlug: { [slug: string]: GameDigimon };
	active: boolean;
	onNavigate: (slug: string) => void;
	onDetails: (digimon: GameDigimon) => void;
}) {
	const [ref, revealed] = useReveal<HTMLTableRowElement>(active);
	return (
		<tr
			ref={ref}
			id={digimon.slug}
			className={makeClassName('evolution-row', active && 'active-outline')}
		>
			<td>
				<div className="digimon-identity">
					<span className="game-digimon-tile">
						{revealed && <GameDigimonImg digimon={digimon} />}
					</span>
					<Link
						href={`/games/${game.key}/${digimon.slug}`}
						className="digimon-name"
					>
						{digimon.name}
						<span className="digimon-number">{`#${digimon.number}`}</span>
					</Link>
				</div>
			</td>
			<td>
				<button
					type="button"
					className="btn btn-primary"
					onClick={() => onDetails(digimon)}
				>
					Details
				</button>
			</td>
			<td className="cell-attribute">
				{revealed ?
					<AttributeIcon attribute={digimon.attribute} />
				:	digimon.attribute}
			</td>
			{game.typeIcons ?
				<td className="cell-attribute">
					{revealed ?
						<AttributeIcon attribute={digimon.type} />
					:	digimon.type}
				</td>
			:	<td>{digimon.type}</td>}
			{!!game.extra && <td>{digimon[game.extra.key] as string}</td>}
			<RelationsCell
				slugs={digimon.modes}
				bySlug={bySlug}
				revealed={revealed}
				onNavigate={onNavigate}
			/>
			<RelationsCell
				slugs={digimon.from}
				bySlug={bySlug}
				revealed={revealed}
				onNavigate={onNavigate}
			/>
			<RelationsCell
				slugs={digimon.to}
				bySlug={bySlug}
				revealed={revealed}
				onNavigate={onNavigate}
			/>
		</tr>
	);
});

const RelationsCell = ({
	slugs,
	bySlug,
	revealed,
	onNavigate,
}: {
	slugs: string[];
	bySlug: { [slug: string]: GameDigimon };
	revealed: boolean;
	onNavigate: (slug: string) => void;
}) => (
	<td>
		{slugs.length ?
			<div className="relation-tiles">
				{slugs.map(slug => (
					<a
						key={slug}
						href={`#${slug}`}
						onClick={e => {
							e.preventDefault();
							onNavigate(slug);
						}}
					>
						{revealed && bySlug[slug] ?
							<GameDigimonImg digimon={bySlug[slug]} />
						:	bySlug[slug]?.name || slug}
					</a>
				))}
			</div>
		:	null}
	</td>
);

export const getStaticPaths: GetStaticPaths = async () => ({
	paths: Object.keys(digimonGames).map(name => ({ params: { name } })),
	fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const game = digimonGames[params?.name as string];
	if (!game) return { notFound: true };
	const digimons: GameDigimon[] = require(
		`../../../../public/json/games/${game.key}/digimons.json`
	);
	const dubNames = getDubNamesFor(digimons.map(digimon => digimon.slug));
	const aliases: StringObject = Object.fromEntries(
		digimons
			.filter(digimon => dubNames[digimon.slug])
			.map(digimon => [digimon.slug, dubNames[digimon.slug]])
	);
	const generations = Array.from(new Set(digimons.map(digimon => digimon.generation)));
	const packed = packDigimons(game, digimons, generations);
	return { props: { game, generations, packed, aliases } };
};

export default PageGame;
