import React from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import { makeClassName } from '@/functions';
import {
	GameDigimon,
	GameDigimonDetails,
	GenericTable,
	Resistance,
} from '@/types/GameDigimon';
import GameDigimonImg from './GameDigimonImg';

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
	digimon: GameDigimon;
	details?: GameDigimonDetails;
	loading: boolean;
	handleClose: () => void;
}
const GameDigimonModal: React.FC<Props> = ({ digimon, details, loading, handleClose }) => (
	<Modal show onHide={handleClose} className="game-digimon-modal" size="lg" centered>
		<Modal.Header closeButton>
			<Modal.Title className="details-title">
				<span className="game-digimon-tile">
					<GameDigimonImg digimon={digimon} />
				</span>
				<div className="d-flex flex-column gap-1">
					<div className="break-word">{digimon.name}</div>
					<small className="details-subtitle">
						#{digimon.number} &middot; {digimon.generation}
					</small>
				</div>
			</Modal.Title>
		</Modal.Header>
		<Modal.Body>
			{loading ?
				<div className="text-center p-4">
					<Spinner animation="border" />
				</div>
			: !details ?
				<p className="cell-empty">No data for this Digimon.</p>
			:	<div className="details-grid">
					{!!details.facts.length && (
						<section className="details-block">
							<h5>Quick facts</h5>
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
							<h5>Stats</h5>
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
							<h5>{table.title}</h5>
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
							<h5>Type effectiveness</h5>
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
							<h5>Support skill</h5>
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
							<h5>Evolution conditions</h5>
							<DetailsTable table={details.conditions} />
						</section>
					)}
					{details.skills.map(table => (
						<section key={table.title} className="details-block wide">
							<h5>{table.title}</h5>
							<DetailsTable table={table} />
						</section>
					))}
				</div>
			}
		</Modal.Body>
	</Modal>
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

export default GameDigimonModal;
