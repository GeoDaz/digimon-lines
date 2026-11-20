import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
import CustomImageInput from '@/components/Cards/CustomImageInput';
import {
	CARD_LEVELS,
	DcgCard,
	NamePairs,
	cardImageUrl,
	loadDcgCards,
	loadNamePairs,
	searchDcgCards,
} from '@/functions/dcgCards';

interface Props {
	show: boolean;
	level: number | null;
	onClose: () => void;
	onSelect: (card: DcgCard) => void;
	onSelectImage: (src: string) => void;
}

const CardPickerModal: React.FC<Props> = ({ show, level, onClose, onSelect, onSelectImage }) => {
	const [cards, setCards] = useState<DcgCard[] | null>(null);
	const [pairs, setPairs] = useState<NamePairs>([]);
	const [failed, setFailed] = useState(false);
	const [query, setQuery] = useState('');
	const [sameLevel, setSameLevel] = useState(true);

	useEffect(() => {
		if (!show || cards) return;
		loadDcgCards()
			.then(setCards)
			.catch(() => setFailed(true));
		loadNamePairs().then(setPairs);
	}, [show, cards]);

	const clear = () => {
		setQuery('');
		setSameLevel(true);
	};

	const results = useMemo(
		() =>
			cards && query.trim().length >= 2 ?
				searchDcgCards(cards, query, sameLevel ? level : null, pairs)
			:	[],
		[cards, query, sameLevel, level, pairs]
	);

	return (
		<Modal show={show} onHide={onClose} onExited={clear} size="lg" scrollable>
			<Modal.Header closeButton>
				<Modal.Title>
					Choose a card{level && CARD_LEVELS[level] ? ` (${CARD_LEVELS[level]})` : ''}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="card-picker-filters">
					<Form.Control
						autoFocus
						type="search"
						placeholder="Digimon name or card number (BT1-010)"
						value={query}
						onChange={e => setQuery(e.target.value)}
					/>
					{!!level && (
						<Form.Check
							type="switch"
							id="card-picker-level"
							label={`Lv.${level}`}
							checked={sameLevel}
							onChange={e => setSameLevel(e.target.checked)}
						/>
					)}
				</div>
				<CustomImageInput
					id="card-picker-image"
					placeholder="Custom card image URL"
					maxWidth={430}
					maxHeight={600}
					onSelect={onSelectImage}
				/>
				{failed ?
					<Alert variant="danger">The card list could not be loaded.</Alert>
				: !cards ?
					<Spinner animation="border" role="status" aria-label="Loading" />
				: query.trim().length < 2 ?
					<p className="text-secondary">Type at least 2 characters.</p>
				: !results.length ?
					<p className="text-secondary">No card found.</p>
				:	<div className="card-picker-grid">
						{results.map(card => (
							<button
								key={card.id}
								type="button"
								className="card-picker-item"
								onClick={() => onSelect(card)}
								title={`${card.name} ${card.id}${card.version ? ` - ${card.version}` : ''}`}
							>
								<img src={cardImageUrl(card.id)} alt={card.name} loading="lazy" />
								<span>
									{card.id}
									{card.version && <small>{card.version}</small>}
								</span>
							</button>
						))}
					</div>
				}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onClose}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default CardPickerModal;
