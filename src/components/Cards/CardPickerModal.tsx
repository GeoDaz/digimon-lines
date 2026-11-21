import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
import CustomImageInput from '@/components/Cards/CustomImageInput';
import type { CardGame, CardSearch, GameCard } from '@/functions/cardGames';

interface Props {
	game: CardGame;
	show: boolean;
	level: number | null;
	onClose: () => void;
	onSelect: (card: GameCard) => void;
	onSelectImage: (src: string) => void;
	current?: { src: string; title: string } | null;
}

const CardPickerModal: React.FC<Props> = ({
	game,
	show,
	level,
	onClose,
	onSelect,
	onSelectImage,
	current,
}) => {
	const [search, setSearch] = useState<{ run: CardSearch } | null>(null);
	const [failed, setFailed] = useState(false);
	const [query, setQuery] = useState('');
	const [sameLevel, setSameLevel] = useState(true);

	useEffect(() => {
		if (!show || search) return;
		game
			.prepareSearch()
			.then(run => setSearch({ run }))
			.catch(() => setFailed(true));
	}, [show, search, game]);

	const clear = () => {
		setQuery('');
		setSameLevel(true);
	};

	const levelLabel = level && game.levels?.[level];

	const results = useMemo(
		() =>
			search && query.trim().length >= 2 ?
				search.run(query, sameLevel && levelLabel ? level : null)
			:	[],
		[search, query, sameLevel, level, levelLabel]
	);

	return (
		<Modal show={show} onHide={onClose} onExited={clear} size="lg" scrollable>
			<Modal.Header closeButton>
				<Modal.Title>
					Choose a card{levelLabel ? ` (${levelLabel})` : ''}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="card-picker-filters">
					<Form.Control
						autoFocus
						type="search"
						placeholder={game.searchPlaceholder}
						value={query}
						onChange={e => setQuery(e.target.value)}
					/>
					{!!levelLabel && (
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
				: !search ?
					<Spinner animation="border" role="status" aria-label="Loading" />
				: query.trim().length < 2 ?
					current ?
						<figure className="card-picker-current">
							<img src={current.src} alt={current.title} />
							<figcaption>{current.title}</figcaption>
						</figure>
					:	<p className="text-secondary">Type at least 2 characters.</p>
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
								<img src={card.thumbnail} alt={card.name} loading="lazy" />
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
