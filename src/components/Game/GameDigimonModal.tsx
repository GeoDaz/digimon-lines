import React from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import Link from '@/components/Link';
import Icon from '@/components/Icon';
import { GameDigimon, GameDigimonDetails } from '@/types/GameDigimon';
import GameDigimonImg from './GameDigimonImg';
import GameDigimonDetailsGrid from './GameDigimonDetails';

interface Props {
	digimon: GameDigimon;
	details?: GameDigimonDetails;
	loading: boolean;
	href?: string;
	handleClose: () => void;
}
const GameDigimonModal: React.FC<Props> = ({
	digimon,
	details,
	loading,
	href,
	handleClose,
}) => (
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
			:	<GameDigimonDetailsGrid details={details} />}
		</Modal.Body>
		{!!href && (
			<Modal.Footer>
				<Link href={href} className="btn btn-outline-light">
					Open the full page <Icon name="arrow-right" />
				</Link>
			</Modal.Footer>
		)}
	</Modal>
);

export default GameDigimonModal;
