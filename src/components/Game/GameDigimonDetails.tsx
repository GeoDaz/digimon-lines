import React from 'react';
import { makeClassName } from '@/functions';
import { GameDigimonDetails, GenericTable, Resistance } from '@/types/GameDigimon';

const resistanceLabel = (value: Resistance['value']) =>
	typeof value === 'number' ? `×${value}` : value || '?';

const resistanceClass = (value: Resistance['value']) => {
	if (typeof value !== 'number') return 'neutral';
	if (value === 0) return 'immune';
	if (value < 1) return 'resist';
	if (value > 1) return 'weak';
	return 'neutral';
};

interface Props {
	details: GameDigimonDetails;
	heading?: 'h2' | 'h5';
}
const GameDigimonDetailsGrid: React.FC<Props> = ({ details, heading: Heading = 'h5' }) => (
	<div className="details-grid">
		{!!details.facts.length && (
			<section className="details-block">
				<Heading>Quick facts</Heading>
				<ul className="details-misc">
					{details.facts.map(fact => (
						<li key={fact.label}>
							<span>{fact.label}</span>
							<b className="text-end">
								{fact.values.map(value => (
									<div key={value}>{value}</div>
								))}
							</b>
						</li>
					))}
				</ul>
			</section>
		)}
		{!!details.stats && (
			<section className="details-block">
				<Heading>Stats</Heading>
				<table className="details-table">
					<thead>
						<tr>
							<th />
							{details.stats.levels.map(level => (
								<th key={level}>{level}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{details.stats.rows.map(row => (
							<tr key={row.stat}>
								<th scope="row">{row.stat}</th>
								{row.values.map((value, i) => (
									<td key={i}>{value ?? '-'}</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</section>
		)}
		{!!details.description && (
			<section className="details-block wide">
				<p className="details-description">{details.description}</p>
			</section>
		)}
		{details.resistances.map(table => (
			<section key={table.title} className="details-block wide">
				<Heading>{table.title}</Heading>
				<ul className="details-resistances">
					{table.entries.map(entry => (
						<li key={entry.name} className={resistanceClass(entry.value)}>
							<span>{entry.name}</span>
							<b>{resistanceLabel(entry.value)}</b>
						</li>
					))}
				</ul>
			</section>
		))}
		{!!details.effectiveness?.length && (
			<section className="details-block">
				<Heading>Type effectiveness</Heading>
				<ul className="details-misc">
					{details.effectiveness.map(entry => (
						<li key={entry.label}>
							<span>{entry.label}</span>
							<b>{entry.values.join(', ')}</b>
						</li>
					))}
				</ul>
			</section>
		)}
		{!!details.supportSkills?.length && (
			<section
				className={makeClassName(
					'details-block',
					!details.effectiveness?.length && 'wide'
				)}
			>
				<Heading>Support skill</Heading>
				{details.supportSkills.map(skill => (
					<div key={skill.name} className="details-support">
						<b>{skill.name}</b>
						<p>{skill.effect}</p>
					</div>
				))}
			</section>
		)}
		{!!details.conditions?.rows.length && (
			<section className="details-block wide">
				<Heading>Evolution conditions</Heading>
				<DetailsTable table={details.conditions} />
			</section>
		)}
		{details.skills.map(table => (
			<section key={table.title} className="details-block wide">
				<Heading>{table.title}</Heading>
				<DetailsTable table={table} />
			</section>
		))}
	</div>
);

const DetailsTable = ({ table }: { table: GenericTable }) => (
	<div className="table-responsive">
		<table className="details-table">
			<thead>
				<tr>
					{table.columns.map(column => (
						<th key={column}>{column}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{table.rows.map((row, i) => (
					<tr key={i}>
						{row.map((cell, j) => (
							<td
								key={j}
								className={makeClassName(
									table.columns[j] === 'Description' && 'cell-description'
								)}
							>
								{cell}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	</div>
);

export default GameDigimonDetailsGrid;
