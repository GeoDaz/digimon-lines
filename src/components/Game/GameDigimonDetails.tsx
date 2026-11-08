import React, { useMemo, useState } from 'react';
import { makeClassName } from '@/functions';
import {
	GameDigimonDetails,
	GameDigimonsDetails,
	GameStats,
	GenericTable,
	LabeledValues,
	Resistance,
	ResistanceTable,
	SkillTable,
	SupportSkill,
} from '@/types/GameDigimon';

export type StatScale = { [stat: string]: number };
type HeadingTag = 'h2' | 'h5';

const emptyValues = ['', '-', '—'];
const isEmpty = (value?: string | null) =>
	value == null || emptyValues.includes(value.trim());

export const elementClass = (value?: string) =>
	value ? `el-${value.toLowerCase().replace(/[^a-z]+/g, '-')}` : '';

export const getStatScale = (all: GameDigimonsDetails): StatScale => {
	const scale: StatScale = {};
	for (const details of Object.values(all)) {
		details.stats?.rows.forEach(row =>
			row.values.forEach(value => {
				if (value != null) scale[row.stat] = Math.max(scale[row.stat] || 0, value);
			}),
		);
	}
	return scale;
};

const resistanceLabel = (value: Resistance['value']) =>
	typeof value === 'number' ? `×${value}` : value || '?';

type ResistanceKind = 'immune' | 'resist' | 'neutral' | 'weak';
const resistanceKind = (value: Resistance['value']): ResistanceKind => {
	if (typeof value !== 'number') return 'neutral';
	if (value === 0) return 'immune';
	if (value < 1) return 'resist';
	if (value > 1) return 'weak';
	return 'neutral';
};

export const DetailsCard: React.FC<{
	title?: string;
	heading?: HeadingTag;
	className?: string;
	aside?: React.ReactNode;
	children: React.ReactNode;
}> = ({ title, heading: Heading = 'h5', className, aside, children }) => (
	<section className={makeClassName('details-block', className)}>
		{(!!title || !!aside) && (
			<header className="details-block-header">
				{!!title && <Heading>{title}</Heading>}
				{aside}
			</header>
		)}
		{children}
	</section>
);

export const DetailsFacts: React.FC<{
	facts: LabeledValues[];
	heading?: HeadingTag;
	title?: string;
	className?: string;
}> = ({ facts, heading, title = 'Quick facts', className }) =>
	!facts.length ? null : (
		<DetailsCard title={title} heading={heading} className={className}>
			<dl className="details-facts">
				{facts.map(fact => (
					<div key={fact.label}>
						<dt>{fact.label}</dt>
						<dd>
							{fact.values.map(value => (
								<span key={value} className="details-chip">
									{value}
								</span>
							))}
						</dd>
					</div>
				))}
			</dl>
		</DetailsCard>
	);

export const DetailsStats: React.FC<{
	stats: GameStats;
	scale?: StatScale;
	heading?: HeadingTag;
	className?: string;
}> = ({ stats, scale, heading, className }) => {
	const [level, setLevel] = useState(stats.levels.length - 1);
	const values = stats.rows.map(row => row.values[level]);
	const total = values.reduce<number>((sum, value) => sum + (value || 0), 0);
	const max = (stat: string, values: (number | null)[]) =>
		scale?.[stat] || Math.max(...values.map(value => value || 0), 1);

	return (
		<DetailsCard
			title="Stats"
			heading={heading}
			className={className}
			aside={
				stats.levels.length > 1 && (
					<div className="details-segmented" role="group" aria-label="Level">
						{stats.levels.map((label, i) => (
							<button
								key={label}
								type="button"
								className={makeClassName(i === level && 'active')}
								aria-pressed={i === level}
								onClick={() => setLevel(i)}
							>
								{label}
							</button>
						))}
					</div>
				)
			}
		>
			<ul className="details-stats">
				{stats.rows.map((row, i) => {
					const value = values[i];
					const ratio =
						value == null ? 0 : Math.min(1, value / max(row.stat, row.values));
					return (
						<li key={row.stat}>
							<span className="details-stat-name">{row.stat}</span>
							<span className="details-stat-bar">
								<span style={{ width: `${ratio * 100}%` }} />
							</span>
							<b className="details-stat-value">{value ?? '-'}</b>
						</li>
					);
				})}
			</ul>
			<div className="details-stats-total">
				<span>Total</span>
				<b>{total}</b>
			</div>
		</DetailsCard>
	);
};

type ResistanceFilter = 'all' | 'weak' | 'resist';
const resistanceFilters: { key: ResistanceFilter; label: string }[] = [
	{ key: 'all', label: 'All' },
	{ key: 'weak', label: 'Weak' },
	{ key: 'resist', label: 'Resist' },
];

export const DetailsResistances: React.FC<{
	tables: ResistanceTable[];
	heading?: HeadingTag;
	className?: string;
}> = ({ tables, heading, className }) => {
	const [filter, setFilter] = useState<ResistanceFilter>('all');
	const entries = useMemo(() => tables.flatMap(table => table.entries), [tables]);
	const weaknesses = entries
		.filter(entry => resistanceKind(entry.value) === 'weak')
		.sort((a, b) => (b.value as number) - (a.value as number));
	const hasResists = entries.some(entry =>
		['resist', 'immune'].includes(resistanceKind(entry.value)),
	);
	const visible = (entry: Resistance) => {
		const kind = resistanceKind(entry.value);
		if (filter === 'weak') return kind === 'weak';
		if (filter === 'resist') return kind === 'resist' || kind === 'immune';
		return true;
	};

	if (!entries.length) return null;
	return (
		<DetailsCard
			title="Resistances"
			heading={heading}
			className={className}
			aside={
				(!!weaknesses.length || hasResists) && (
					<div className="details-segmented" role="group" aria-label="Filter">
						{resistanceFilters.map(item => (
							<button
								key={item.key}
								type="button"
								className={makeClassName(item.key === filter && 'active')}
								aria-pressed={item.key === filter}
								onClick={() => setFilter(item.key)}
							>
								{item.label}
							</button>
						))}
					</div>
				)
			}
		>
			<div className="details-weakness">
				<span>Weak to</span>
				{weaknesses.length ?
					weaknesses.map(entry => (
						<span key={entry.name} className="details-chip weak">
							{entry.name} <b>{resistanceLabel(entry.value)}</b>
						</span>
					))
				:	<span className="details-chip">Nothing</span>}
			</div>
			{tables.map(table => {
				const shown = table.entries.filter(visible);
				return (
					<div key={table.title} className="details-resistance-group">
						{tables.length > 1 && <div className="details-subheading">{table.title}</div>}
						{shown.length ?
							<ul className="details-resistances">
								{shown.map(entry => (
									<li key={entry.name} className={resistanceKind(entry.value)}>
										<span>{entry.name}</span>
										<b>{resistanceLabel(entry.value)}</b>
									</li>
								))}
							</ul>
						:	<p className="details-empty">None</p>}
					</div>
				);
			})}
		</DetailsCard>
	);
};

export const DetailsEffectiveness: React.FC<{
	effectiveness: LabeledValues[];
	heading?: HeadingTag;
	className?: string;
}> = ({ effectiveness, heading, className }) => (
	<DetailsCard title="Attribute matchup" heading={heading} className={className}>
		<ul className="details-matchup">
			{effectiveness.map(entry => (
				<li key={entry.label}>
					<span>{entry.label}</span>
					<div>
						{entry.values.map(value => (
							<span
								key={value}
								className={makeClassName(
									'details-chip',
									/weak/i.test(entry.label) ? 'weak'
									: /strong/i.test(entry.label) ? 'strong'
									: undefined,
								)}
							>
								{value}
							</span>
						))}
					</div>
				</li>
			))}
		</ul>
	</DetailsCard>
);

export const DetailsSupport: React.FC<{
	skills: SupportSkill[];
	heading?: HeadingTag;
	className?: string;
}> = ({ skills, heading, className }) => (
	<DetailsCard title="Support skill" heading={heading} className={className}>
		{skills.map(skill => (
			<div key={skill.name} className="details-support">
				<b>{skill.name}</b>
				<p>{skill.effect}</p>
			</div>
		))}
	</DetailsCard>
);

export const DetailsConditions: React.FC<{ table: GenericTable }> = ({ table }) => (
	<>
		{table.rows.map((row, i) => (
			<ul key={i} className="details-conditions">
				{row.map((cell, j) =>
					isEmpty(cell) ? null : (
						<li key={j}>
							<span>{table.columns[j]}</span>
							<b>{cell}</b>
						</li>
					),
				)}
			</ul>
		))}
	</>
);

export const DetailsSkills: React.FC<{
	table: SkillTable;
	heading?: HeadingTag;
	className?: string;
}> = ({ table, heading, className }) => {
	const column = (name: string) => table.columns.indexOf(name);
	const nameIndex = column('Name');
	const descriptionIndex = column('Description');
	const levelIndex = column('Level');
	const elementIndex = column('Element') >= 0 ? column('Element') : column('Attribute');
	const kindIndex = column('Type');
	const special = [nameIndex, descriptionIndex, levelIndex, elementIndex, kindIndex];
	const metaIndexes = table.columns.map((_, i) => i).filter(i => !special.includes(i));

	return (
		<DetailsCard
			title={table.title}
			heading={heading}
			className={className}
			aside={<span className="details-count">{table.rows.length}</span>}
		>
			<ul className="details-skills">
				{table.rows.map((row, i) => (
					<li key={i}>
						{levelIndex >= 0 && (
							<span className="details-skill-level" title="Level">
								<small>Lv</small>
								{isEmpty(row[levelIndex]) ? '-' : row[levelIndex]}
							</span>
						)}
						<div className="details-skill-body">
							<div className="details-skill-head">
								<b>{nameIndex >= 0 ? row[nameIndex] : row[0]}</b>
								{elementIndex >= 0 && !isEmpty(row[elementIndex]) && (
									<span
										className={makeClassName(
											'details-element',
											elementClass(row[elementIndex]),
										)}
									>
										{row[elementIndex]}
									</span>
								)}
								{kindIndex >= 0 && !isEmpty(row[kindIndex]) && (
									<span className="details-chip">{row[kindIndex]}</span>
								)}
							</div>
							{descriptionIndex >= 0 && !isEmpty(row[descriptionIndex]) && (
								<p>{row[descriptionIndex]}</p>
							)}
							<ul className="details-skill-meta">
								{metaIndexes
									.filter(j => !isEmpty(row[j]))
									.map(j => (
										<li key={j}>
											<span>{table.columns[j]}</span>
											<b>{row[j]}</b>
										</li>
									))}
							</ul>
						</div>
					</li>
				))}
			</ul>
		</DetailsCard>
	);
};

interface Props {
	details: GameDigimonDetails;
	scale?: StatScale;
	heading?: HeadingTag;
}
const GameDigimonDetailsGrid: React.FC<Props> = ({ details, scale, heading = 'h5' }) => (
	<div className="details-grid">
		{!!details.description && (
			<section className="details-block wide">
				<p className="details-description">{details.description}</p>
			</section>
		)}
		<DetailsFacts facts={details.facts} heading={heading} />
		{!!details.stats && (
			<DetailsStats stats={details.stats} scale={scale} heading={heading} />
		)}
		{!!details.resistances.length && (
			<DetailsResistances
				tables={details.resistances}
				heading={heading}
				className="wide"
			/>
		)}
		{!!details.effectiveness?.length && (
			<DetailsEffectiveness effectiveness={details.effectiveness} heading={heading} />
		)}
		{!!details.supportSkills?.length && (
			<DetailsSupport
				skills={details.supportSkills}
				heading={heading}
				className={makeClassName(!details.effectiveness?.length && 'wide')}
			/>
		)}
		{!!details.conditions?.rows.length && (
			<DetailsCard title="Evolution conditions" heading={heading} className="wide">
				<DetailsConditions table={details.conditions} />
			</DetailsCard>
		)}
		{details.skills.map(table => (
			<DetailsSkills key={table.title} table={table} heading={heading} className="wide" />
		))}
	</div>
);

export default GameDigimonDetailsGrid;
