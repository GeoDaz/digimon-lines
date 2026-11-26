import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Form, InputGroup, Modal, Spinner } from 'react-bootstrap';
import Icon from '@/components/Icon';
import CustomImageInput from '@/components/Cards/CustomImageInput';
import { CardGame, CardSearch, GameCard, cardTitle } from '@/functions/cardGames';

const PAGE_SIZE = 60;

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
	const [levelChoice, setLevelChoice] = useState<string | null>(null);
	const [kind, setKind] = useState('');
	const [color, setColor] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);
	const [shown, setShown] = useState({ key: '', count: PAGE_SIZE });

	useEffect(() => {
		if (!show || search) return;
		game
			.prepareSearch()
			.then(run => setSearch({ run }))
			.catch(() => setFailed(true));
	}, [show, search, game]);

	const clear = () => {
		setQuery('');
		setLevelChoice(null);
		setKind('');
		setColor('');
	};

	const levels = game.levels;
	const selectedLevel = Number(levelChoice ?? (level && levels?.[level] ? level : 0));
	const levelApplies = !kind || !game.leveledTypes || game.leveledTypes.includes(kind);
	const activeLevel = levelApplies ? selectedLevel : 0;
	const levelLabel = activeLevel ? levels?.[activeLevel] : undefined;
	const results = useMemo(
		() =>
			search ?
				search
					.run(query.trim(), activeLevel || null)
					.filter(card => !kind || card.kind === kind)
					.filter(card => !color || card.colors.includes(color))
			:	[],
		[search, query, activeLevel, kind, color]
	);
	const resultsKey = `${query}|${activeLevel}|${kind}|${color}`;
	const visible = shown.key === resultsKey ? shown.count : PAGE_SIZE;

	return (
		<Modal show={show} onHide={onClose} onExited={clear} size="lg" scrollable>
			<Modal.Header closeButton>
				<Modal.Title>
					Choose a card{levelLabel ? ` (${levelLabel})` : ''}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="card-picker-selects">
					<Form.Select
						className="research"
						value={kind}
						onChange={e => setKind(e.target.value)}
						aria-label="Card type"
					>
						<option value="">All card types</option>
						{Object.entries(game.cardTypes).map(([value, label]) => (
							<option key={value} value={value}>
								{label}
							</option>
						))}
					</Form.Select>
					{levels && (
						<Form.Select
							className="research"
							value={selectedLevel}
							onChange={e => setLevelChoice(e.target.value)}
							disabled={!levelApplies}
							aria-label="Level"
						>
							<option value={0}>All levels</option>
							{Object.entries(levels).map(([value, label]) => (
								<option key={value} value={value}>
									Lv.{value} {label}
								</option>
							))}
						</Form.Select>
					)}
					<Form.Select
						className="research"
						value={color}
						onChange={e => setColor(e.target.value)}
						aria-label={game.colorLabel}
					>
						<option value="">All {game.colorLabel.toLowerCase()}s</option>
						{Object.keys(game.palette).map(value => (
							<option key={value} value={value}>
								{value}
							</option>
						))}
					</Form.Select>
				</div>
				<Form
					className="card-picker-filters"
					onSubmit={e => {
						e.preventDefault();
						inputRef.current?.blur();
					}}
				>
					<InputGroup>
						<Form.Control
							ref={inputRef}
							autoFocus
							type="search"
							className="research"
							placeholder={game.searchPlaceholder}
							value={query}
							onChange={e => setQuery(e.target.value)}
							aria-label={game.searchPlaceholder}
						/>
						<Button type="submit" variant="primary" title="Search">
							<Icon name="search" />
						</Button>
					</InputGroup>
				</Form>
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
				: !results.length ?
					<p className="text-secondary">No card found.</p>
				:	<>
						{current && !query.trim() && (
							<figure className="card-picker-current">
								<img src={current.src} alt={current.title} />
								<figcaption>
									<small>Current card</small>
									{current.title}
								</figcaption>
							</figure>
						)}
						<p className="card-picker-count">
							{results.length} card{results.length > 1 ? 's' : ''}
						</p>
						<div className="card-picker-grid">
							{results.slice(0, visible).map(card => (
								<button
									key={card.id}
									type="button"
									className="card-picker-item"
									onClick={() => onSelect(card)}
									title={cardTitle(card)}
								>
									<img src={card.thumbnail} alt={card.name} loading="lazy" />
									<span>
										{card.code || card.name}
										{card.version && <small>{card.version}</small>}
									</span>
								</button>
							))}
						</div>
						{results.length > visible && (
							<div className="card-picker-more">
								<Button
									variant="outline-secondary"
									onClick={() =>
										setShown({ key: resultsKey, count: visible + PAGE_SIZE })
									}
								>
									Show more ({results.length - visible} left)
								</Button>
							</div>
						)}
					</>
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
