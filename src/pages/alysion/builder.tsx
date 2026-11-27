import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Alert, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import Layout from '@/components/Layout';
import Link from '@/components/Link';
import Icon from '@/components/Icon';
import CardImage from '@/components/Cards/CardImage';
import AlysionDecklist from '@/components/Alysion/AlysionDecklist';
import CopyDecklistButton from '@/components/Alysion/CopyDecklistButton';
import { useAuth } from '@/context/auth';
import { useToast } from '@/context/toast';
import { DIGIMON_COLORS } from '@/functions/cardGames';
import {
	cardImageUrl,
	CARD_LEVELS,
	DcgCard,
	loadNamePairs,
	NamePairs,
	searchDcgCards,
} from '@/functions/dcgCards';
import {
	ALYSION_COLORS,
	AlysionCard,
	countCards,
	DeckEntry,
	MAX_COPIES,
	MAX_EGGS,
	parseDecklist,
	suggestColors,
	suggestCover,
	validateDeck,
} from '@/functions/alysionCards';
import {
	deleteCommunityDeck,
	fetchCommunityDeck,
	loadAlysionPool,
	readDeckEntries,
	resolveDeckCards,
	saveCommunityDeck,
} from '@/functions/alysionDecks';

const RESULTS = 60;
const TYPES: Record<string, string> = { D: 'Digimon', E: 'Digi-Egg', T: 'Tamer', O: 'Option' };

const PageAlysionBuilder: React.FC = () => {
	const router = useRouter();
	const { user, loading: authLoading } = useAuth();
	const { addToast } = useToast();
	const deckId = typeof router.query.id === 'string' ? router.query.id : undefined;

	const [pool, setPool] = useState<Map<string, DcgCard> | null>(null);
	const [pairs, setPairs] = useState<NamePairs>([]);
	const [poolFailed, setPoolFailed] = useState(false);
	const [loadingDeck, setLoadingDeck] = useState(false);
	const [notFound, setNotFound] = useState(false);

	const [entries, setEntries] = useState<DeckEntry[]>([]);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [colors, setColors] = useState<string[] | null>(null);
	const [cover, setCover] = useState<string | null>(null);
	const [wins, setWins] = useState(0);
	const [losses, setLosses] = useState(0);
	const [bestRank, setBestRank] = useState('');
	const [isPublic, setIsPublic] = useState(true);

	const [query, setQuery] = useState('');
	const [type, setType] = useState('');
	const [color, setColor] = useState('');
	const [paste, setPaste] = useState('');
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		loadAlysionPool()
			.then(setPool)
			.catch(() => setPoolFailed(true));
		loadNamePairs().then(setPairs);
	}, []);

	useEffect(() => {
		if (!router.isReady || !deckId || authLoading) return;
		let active = true;
		setLoadingDeck(true);
		fetchCommunityDeck(deckId)
			.then(deck => {
				if (!active) return;
				if (!deck || deck.user_id !== user?.id) {
					setNotFound(true);
					return;
				}
				setEntries(readDeckEntries(deck.cards));
				setTitle(deck.title);
				setDescription(deck.description || '');
				setColors(deck.colors);
				setCover(deck.cover);
				setWins(deck.wins);
				setLosses(deck.losses);
				setBestRank(deck.best_rank || '');
				setIsPublic(deck.is_public);
			})
			.catch(() => active && setNotFound(true))
			.finally(() => active && setLoadingDeck(false));
		return () => {
			active = false;
		};
	}, [router.isReady, deckId, authLoading, user]);

	const cards = useMemo(
		() => (pool ? resolveDeckCards(entries, pool) : []),
		[entries, pool]
	);
	const errors = useMemo(() => validateDeck(cards), [cards]);
	const unknown = useMemo(
		() => (pool ? entries.filter(([id]) => !pool.has(id)).map(([id]) => id) : []),
		[entries, pool]
	);
	const shownColors = colors ?? suggestColors(cards);
	const shownCover = cover && entries.some(([id]) => id === cover) ? cover : suggestCover(cards);

	const poolList = useMemo(() => (pool ? Array.from(pool.values()) : []), [pool]);
	const results = useMemo(
		() =>
			searchDcgCards(poolList, query.trim(), null, pairs, Infinity)
				.filter(card => !type || card.type === type)
				.filter(card => !color || card.colors.includes(color))
				.slice(0, RESULTS),
		[poolList, query, type, color, pairs]
	);

	const countOf = (id: string) => entries.find(([entryId]) => entryId === id)?.[1] || 0;

	const changeCount = (id: string, delta: number) => {
		setEntries(prev => {
			const current = prev.find(([entryId]) => entryId === id)?.[1] || 0;
			const card = pool?.get(id);
			const max = card?.type === 'E' ? Math.min(MAX_COPIES, MAX_EGGS) : MAX_COPIES;
			const next = Math.max(0, Math.min(max, current + delta));
			if (next === current) return prev;
			if (!next) return prev.filter(([entryId]) => entryId !== id);
			if (!current) return [...prev, [id, next]];
			return prev.map(entry => (entry[0] === id ? [id, next] : entry));
		});
	};

	const handleImport = () => {
		const { entries: parsed, invalid } = parseDecklist(paste);
		if (!parsed.length) {
			addToast('No card found in the pasted list', 'warning');
			return;
		}
		setEntries(parsed);
		setPaste('');
		if (invalid.length) {
			addToast(`${invalid.length} line(s) could not be read`, 'warning');
		}
	};

	const toggleColor = (value: string) => {
		const current = shownColors;
		setColors(
			current.includes(value) ? current.filter(item => item !== value)
			: current.length < 3 ? [...current, value]
			: current
		);
	};

	const handleSave = async () => {
		if (!user) return;
		if (!title.trim()) {
			addToast('Give your deck a name', 'warning');
			return;
		}
		if (isPublic && (errors.length || unknown.length)) {
			addToast('Fix the deck before publishing it, or keep it private', 'warning');
			return;
		}
		setSaving(true);
		try {
			const id = await saveCommunityDeck(
				user.id,
				{
					title: title.trim(),
					description: description.trim() || null,
					colors: shownColors,
					cover: shownCover,
					cards: entries,
					wins,
					losses,
					best_rank: bestRank.trim() || null,
					is_public: isPublic,
				},
				deckId
			);
			addToast('Deck saved', 'success');
			router.push(`/alysion/community/${id}`);
		} catch (error) {
			console.error('Failed to save the deck:', error);
			addToast(
				error instanceof Error && error.message ? error.message : 'Failed to save the deck',
				'danger'
			);
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!deckId || !window.confirm('Delete this deck? This cannot be undone.')) return;
		try {
			await deleteCommunityDeck(deckId);
			addToast('Deck deleted', 'success');
			router.push('/alysion/community?mine=1');
		} catch (error) {
			console.error('Failed to delete the deck:', error);
			addToast('Failed to delete the deck', 'danger');
		}
	};

	const renderActions = (card: AlysionCard) => (
		<div className="alysion-card-actions">
			<Button
				size="sm"
				variant="outline-secondary"
				onClick={() => changeCount(card.id, -1)}
				title="Remove one copy"
			>
				<Icon name="dash-lg" />
			</Button>
			<Button
				size="sm"
				variant="outline-secondary"
				onClick={() => changeCount(card.id, 1)}
				title="Add one copy"
			>
				<Icon name="plus-lg" />
			</Button>
			<Button
				size="sm"
				variant={shownCover === card.id ? 'warning' : 'outline-secondary'}
				onClick={() => setCover(card.id)}
				title="Use as the deck cover"
			>
				<Icon name={shownCover === card.id ? 'star-fill' : 'star'} />
			</Button>
		</div>
	);

	const main = countCards(cards.filter(card => card.type !== 'E'));
	const eggs = countCards(cards.filter(card => card.type === 'E'));

	if (notFound) {
		return (
			<Layout title="Deck builder" metatitle="Digimon Alysion deck builder" noIndex>
				<Alert variant="warning">
					This deck does not exist or does not belong to you.{' '}
					<Link href="/alysion/builder">Create a new deck</Link>.
				</Alert>
			</Layout>
		);
	}

	return (
		<Layout
			title={deckId ? 'Edit your deck' : 'Deck builder'}
			metatitle="Digimon Alysion deck builder"
			metadescription="Build a Digimon Alysion deck, check the deck rules and share it with the community."
			metaimg="alysion.jpg"
		>
			{(poolFailed || loadingDeck) && (
				<div className="mb-3">
					{poolFailed ?
						<Alert variant="danger">The card list could not be loaded.</Alert>
					:	<Spinner animation="border" role="status" aria-label="Loading" />}
				</div>
			)}

			<section className="alysion-panel">
				<h2 className="alysion-section-title">Deck</h2>
				<div className="alysion-builder-fields">
					<Form.Group controlId="deck-title">
						<Form.Label>Name</Form.Label>
						<Form.Control
							value={title}
							maxLength={80}
							placeholder="Blue Yukinamon control"
							onChange={e => setTitle(e.target.value)}
						/>
					</Form.Group>
					<Form.Group>
						<Form.Label>Colors</Form.Label>
						<div className="alysion-color-toggles">
							{ALYSION_COLORS.map(value => (
								<button
									key={value}
									type="button"
									className={`alysion-color-toggle${shownColors.includes(value) ? ' active' : ''}`}
									style={{ background: DIGIMON_COLORS[value] }}
									onClick={() => toggleColor(value)}
									title={value}
									aria-pressed={shownColors.includes(value)}
								/>
							))}
						</div>
					</Form.Group>
				</div>
				<Form.Group controlId="deck-description" className="mt-3">
					<Form.Label>Strategy</Form.Label>
					<Form.Control
						as="textarea"
						rows={3}
						maxLength={2000}
						value={description}
						placeholder="How the deck wins, key combos, tips against the meta..."
						onChange={e => setDescription(e.target.value)}
					/>
				</Form.Group>
				<div className="alysion-builder-fields mt-3">
					<Form.Group controlId="deck-wins">
						<Form.Label>Ranked wins</Form.Label>
						<Form.Control
							type="number"
							min={0}
							max={9999}
							value={wins}
							onChange={e => setWins(Math.max(0, Math.min(9999, Number(e.target.value) || 0)))}
						/>
					</Form.Group>
					<Form.Group controlId="deck-losses">
						<Form.Label>Ranked losses</Form.Label>
						<Form.Control
							type="number"
							min={0}
							max={9999}
							value={losses}
							onChange={e =>
								setLosses(Math.max(0, Math.min(9999, Number(e.target.value) || 0)))
							}
						/>
					</Form.Group>
					<Form.Group controlId="deck-rank">
						<Form.Label>Best rank this season</Form.Label>
						<Form.Control
							value={bestRank}
							maxLength={32}
							placeholder="Beginner I"
							onChange={e => setBestRank(e.target.value)}
						/>
					</Form.Group>
				</div>
				<Form.Text className="d-block mt-2">
					Your record is shown as declared: the site cannot check it. You can find
					it in the game, under Player Info then Log.
				</Form.Text>
				<div className="alysion-builder-save">
					<Form.Check
						type="switch"
						id="deck-public"
						label="Share with the community"
						checked={isPublic}
						onChange={e => setIsPublic(e.target.checked)}
					/>
					{deckId && (
						<Button variant="outline-danger" onClick={handleDelete}>
							<Icon name="trash" /> Delete
						</Button>
					)}
					{user ?
						<Button onClick={handleSave} disabled={saving || !pool}>
							<Icon name="floppy" /> {saving ? 'Saving...' : 'Save the deck'}
						</Button>
					:	<span className="text-secondary">Sign in to save and share your deck.</span>}
				</div>
			</section>

			<section className="alysion-panel">
				<div className="alysion-decklist-head">
					<h2 className="alysion-section-title">
						Decklist{' '}
						<small>
							{main}/50 cards · {eggs}/5 Digi-Eggs
						</small>
					</h2>
					{cards.length > 0 && <CopyDecklistButton cards={cards} />}
				</div>
				{errors.length > 0 && cards.length > 0 && (
					<Alert variant="warning" className="alysion-builder-errors">
						{errors.map(error => (
							<div key={error}>{error}</div>
						))}
					</Alert>
				)}
				{unknown.length > 0 && (
					<Alert variant="danger">
						Not available in Alysion: {unknown.join(', ')}.{' '}
						<Button
							size="sm"
							variant="outline-danger"
							onClick={() => setEntries(prev => prev.filter(([id]) => pool?.has(id)))}
						>
							Remove them
						</Button>
					</Alert>
				)}
				{cards.length ?
					<AlysionDecklist cards={cards} renderActions={renderActions} />
				:	<p className="text-secondary mb-0">
						Add cards from the search below, or paste a list.
					</p>
				}
			</section>

			<section className="alysion-panel">
				<h2 className="alysion-section-title">Add cards</h2>
				<div className="alysion-builder-search">
					<InputGroup>
						<Form.Control
							type="search"
							value={query}
							placeholder="Search a card name or number (BT1-084)"
							onChange={e => setQuery(e.target.value)}
						/>
						<InputGroup.Text>
							<Icon name="search" />
						</InputGroup.Text>
					</InputGroup>
					<Form.Select value={type} onChange={e => setType(e.target.value)}>
						<option value="">All card types</option>
						{Object.entries(TYPES).map(([value, label]) => (
							<option key={value} value={value}>
								{label}
							</option>
						))}
					</Form.Select>
					<Form.Select value={color} onChange={e => setColor(e.target.value)}>
						<option value="">All colors</option>
						{ALYSION_COLORS.map(value => (
							<option key={value} value={value}>
								{value}
							</option>
						))}
					</Form.Select>
				</div>
				<div className="alysion-card-grid mt-3">
					{results.map(card => (
						<button
							key={card.id}
							type="button"
							className="alysion-builder-result"
							onClick={() => changeCount(card.id, 1)}
							title={`Add ${card.name} (${card.id})`}
						>
							<span className="alysion-card-media">
								<CardImage src={cardImageUrl(card.id)} name={card.name} code={card.id} />
								{countOf(card.id) > 0 && (
									<span className="alysion-card-count">×{countOf(card.id)}</span>
								)}
							</span>
							<span>
								{card.name}
								<small>
									{card.id}
									{card.level > 0 && CARD_LEVELS[card.level] && ` · ${CARD_LEVELS[card.level]}`}
								</small>
							</span>
						</button>
					))}
				</div>
				<details className="alysion-builder-paste">
					<summary>Paste a decklist</summary>
					<Form.Control
						as="textarea"
						rows={6}
						value={paste}
						placeholder={'4 BT1-010 Agumon\n4 ST1-03\n...'}
						onChange={e => setPaste(e.target.value)}
					/>
					<Button className="mt-2" variant="outline-primary" onClick={handleImport}>
						<Icon name="box-arrow-in-down" /> Replace the deck with this list
					</Button>
				</details>
			</section>
		</Layout>
	);
};

export default PageAlysionBuilder;
