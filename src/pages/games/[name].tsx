import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import Layout from '@/components/Layout';
import Link from '@/components/Link';
import Icon from '@/components/Icon';
import ScrollUp from '@/components/ScrollUp';
import SearchBar from '@/components/SearchBar';
import GameDigimonImg from '@/components/Game/GameDigimonImg';
import GameDigimonModal from '@/components/Game/GameDigimonModal';
import AttributeIcon from '@/components/Game/AttributeIcon';
import { digimonGames } from '@/consts/games';
import { makeClassName, stringToKey } from '@/functions';
import { DigimonGame, GameDigimon, GameDigimonsDetails } from '@/types/GameDigimon';

interface Props {
	game: DigimonGame;
	digimons: GameDigimon[];
}

const getHash = () => decodeURIComponent(window.location.hash.replace('#', ''));

const PageGame: React.FC<Props> = ({ game, digimons }) => {
	const [search, setSearch] = useState('');
	const [generation, setGeneration] = useState<string>();
	const [attribute, setAttribute] = useState<string>();
	const [type, setType] = useState<string>();
	const [resetCount, setResetCount] = useState(0);
	const [target, setTarget] = useState<string>();
	const [selected, setSelected] = useState<GameDigimon>();
	const [details, setDetails] = useState<GameDigimonsDetails>();
	const [loading, setLoading] = useState(false);

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
		const key = stringToKey(search);
		return digimons.filter(
			digimon =>
				(!key || stringToKey(digimon.name).includes(key)) &&
				(!generation || digimon.generation === generation) &&
				(!attribute || digimon.attribute === attribute) &&
				(!type || digimon.type === type)
		);
	}, [digimons, search, generation, attribute, type]);

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

	const navigate = useCallback((slug: string) => {
		window.history.replaceState(null, '', `#${slug}`);
		setTarget(slug);
	}, []);

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

	const hasFilters = !!search || !!generation || !!attribute || !!type;

	return (
		<Layout
			title={`${game.title} evolutions`}
			metatitle={`${game.shortTitle} evolutions`}
			metadescription={`Every Digimon of ${game.title}: digivolutions, conditions, stats, resistances and skills.`}
		>
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
			<div className="evolution-filters">
				<SearchBar
					key={resetCount}
					label="Search a Digimon"
					onSubmit={(value?: string) => setSearch(value || '')}
				/>
				<FilterDropdown
					id="generation-selector"
					label={game.labels.generation}
					value={generation}
					options={game.generations}
					onChange={setGeneration}
				/>
				<FilterDropdown
					id="attribute-selector"
					label={game.labels.attribute}
					value={attribute}
					options={attributes}
					onChange={setAttribute}
				/>
				{!!game.typeFilter && (
					<FilterDropdown
						id="type-selector"
						label={game.labels.type}
						value={type}
						options={types}
						onChange={setType}
					/>
				)}
				{hasFilters && (
					<button type="button" className="filter-reset" onClick={resetFilters}>
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
					loading={loading}
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
	return (
		<tr
			id={digimon.slug}
			className={makeClassName('evolution-row', active && 'active-outline')}
		>
			<td className="cell-digimon">
				<div className="digimon-identity">
					<span className="game-digimon-tile">
						<GameDigimonImg digimon={digimon} />
					</span>
					<span className="digimon-name">
						{digimon.name}
						<span className="digimon-number">#{digimon.number}</span>
					</span>
				</div>
			</td>
			<td className="cell-details">
				<button
					type="button"
					className="btn btn-primary details-button"
					aria-label="Details"
					title="Details"
					onClick={() => onDetails(digimon)}
				>
					Details
				</button>
			</td>
			<td className="cell-attribute">
				<AttributeIcon game={game.key} attribute={digimon.attribute} />
			</td>
			{game.typeIcons ?
				<td className="cell-attribute">
					<AttributeIcon game={game.key} attribute={digimon.type} />
				</td>
			:	<td>{digimon.type}</td>}
			{!!game.extra && <td>{digimon[game.extra.key] as string}</td>}
			<RelationsCell
				slugs={digimon.modes}
				bySlug={bySlug}
				onNavigate={onNavigate}
			/>
			<RelationsCell slugs={digimon.from} bySlug={bySlug} onNavigate={onNavigate} />
			<RelationsCell slugs={digimon.to} bySlug={bySlug} onNavigate={onNavigate} />
		</tr>
	);
});

const RelationsCell = ({
	slugs,
	bySlug,
	onNavigate,
}: {
	slugs: string[];
	bySlug: { [slug: string]: GameDigimon };
	onNavigate: (slug: string) => void;
}) => (
	<td className="cell-relations">
		{slugs.length ?
			<div className="relation-tiles">
				{slugs.map(slug => (
					<a
						key={slug}
						href={`#${slug}`}
						className="game-digimon-tile"
						title={bySlug[slug]?.name || slug}
						onClick={e => {
							e.preventDefault();
							onNavigate(slug);
						}}
					>
						{bySlug[slug] ?
							<GameDigimonImg digimon={bySlug[slug]} />
						:	<span>{slug}</span>}
					</a>
				))}
			</div>
		:	<span className="cell-empty">&mdash;</span>}
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
		`../../../public/json/games/${game.key}/digimons.json`
	);
	return { props: { game, digimons } };
};

export default PageGame;
