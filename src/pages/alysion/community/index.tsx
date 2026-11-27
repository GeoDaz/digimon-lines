import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Form, InputGroup, Nav, Spinner } from 'react-bootstrap';
import Layout from '@/components/Layout';
import Link from '@/components/Link';
import Icon from '@/components/Icon';
import CardImage from '@/components/Cards/CardImage';
import LikeHeart from '@/components/Account/LikeHeart';
import AlysionColors from '@/components/Alysion/AlysionColors';
import DeckRecord from '@/components/Alysion/DeckRecord';
import { useAuth } from '@/context/auth';
import { cardImageUrl } from '@/functions/dcgCards';
import { ALYSION_COLORS } from '@/functions/alysionCards';
import {
	CommunityDeck,
	DECK_PAGE_SIZE,
	DECK_SORTS,
	DeckSortKey,
	isDeckSort,
	listCommunityDecks,
	listLikedDeckIds,
} from '@/functions/alysionDecks';
import useDeckLike from '@/hooks/useDeckLike';

const DeckTile: React.FC<{ deck: CommunityDeck; mine: boolean }> = ({ deck, mine }) => {
	const like = useDeckLike(deck.id, deck.like_count, deck.liked);
	return (
		<Link href={`/alysion/community/${deck.id}`} className="alysion-deck-tile">
			{deck.cover ?
				<CardImage src={cardImageUrl(deck.cover)} name={deck.title} code={deck.cover} />
			:	<span className="card-image-missing">
					<b>{deck.title}</b>
				</span>
			}
			<span className="alysion-deck-tile-name">{deck.title}</span>
			<span className="alysion-deck-tile-meta">
				<AlysionColors colors={deck.colors} />
				{mine ?
					<span>{deck.is_public ? 'Public' : 'Private'}</span>
				:	<span>by {deck.profiles?.pseudo}</span>}
				<LikeHeart
					count={like.count}
					liked={like.liked}
					className="ms-auto"
					onClick={mine ? undefined : like.toggle}
				/>
			</span>
			<DeckRecord wins={deck.wins} losses={deck.losses} bestRank={deck.best_rank} />
		</Link>
	);
};

const PageAlysionCommunity: React.FC = () => {
	const router = useRouter();
	const { user, loading: authLoading } = useAuth();
	const mine = router.query.mine === '1' && !!user;

	const [search, setSearch] = useState('');
	const [query, setQuery] = useState('');
	const [sort, setSort] = useState<DeckSortKey>('likes');
	const [color, setColor] = useState('');
	const [decks, setDecks] = useState<CommunityDeck[]>([]);
	const [loading, setLoading] = useState(true);
	const [failed, setFailed] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const page = useRef(0);
	const request = useRef(0);

	const load = useCallback(
		async (nextPage: number) => {
			const id = ++request.current;
			setLoading(true);
			setFailed(false);
			try {
				let rows = await listCommunityDecks({
					search: query,
					sort,
					color,
					page: nextPage,
					userId: mine ? user?.id : undefined,
				});
				if (user && !mine && rows.length) {
					const liked = new Set(await listLikedDeckIds(user.id, rows.map(row => row.id)));
					rows = rows.map(row => ({ ...row, liked: liked.has(row.id) }));
				}
				if (id !== request.current) return;
				page.current = nextPage;
				setHasMore(rows.length === DECK_PAGE_SIZE);
				setDecks(prev => (nextPage ? [...prev, ...rows] : rows));
			} catch (error) {
				console.error('Failed to load the community decks:', error);
				if (id === request.current) setFailed(true);
			} finally {
				if (id === request.current) setLoading(false);
			}
		},
		[query, sort, color, mine, user]
	);

	useEffect(() => {
		if (authLoading || !router.isReady) return;
		load(0);
	}, [authLoading, router.isReady, load]);

	const showTab = (value: boolean) =>
		router.replace(value ? '/alysion/community?mine=1' : '/alysion/community', undefined, {
			shallow: true,
		});

	return (
		<Layout
			title="Community decks"
			metatitle="Digimon Alysion community decks"
			metadescription="Decks built and shared by Digimon Alysion players, with their declared ranked results."
			metaimg="alysion.jpg"
		>
			<div className="alysion-community-head">
				<p className="alysion-intro mb-0">
					Decks built and shared by players. Records are declared by their authors and
					cannot be checked by the site.
				</p>
				<Link href="/alysion/builder" className="btn btn-primary">
					<Icon name="plus-lg" /> Create a deck
				</Link>
			</div>

			<section className="alysion-panel">
				{user && (
					<Nav variant="tabs" className="mb-3" activeKey={mine ? 'mine' : 'all'}>
						<Nav.Item>
							<Nav.Link eventKey="all" onClick={() => showTab(false)}>
								Community
							</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link eventKey="mine" onClick={() => showTab(true)}>
								My decks
							</Nav.Link>
						</Nav.Item>
					</Nav>
				)}
				<Form
					className="alysion-builder-search"
					onSubmit={e => {
						e.preventDefault();
						setQuery(search);
					}}
				>
					<InputGroup>
						<Form.Control
							type="search"
							value={search}
							placeholder="Search a deck name"
							onChange={e => setSearch(e.target.value)}
						/>
						<Button type="submit" variant="primary" aria-label="Search">
							<Icon name="search" />
						</Button>
					</InputGroup>
					<Form.Select
						value={sort}
						onChange={e => isDeckSort(e.target.value) && setSort(e.target.value)}
					>
						{Object.entries(DECK_SORTS).map(([value, { label }]) => (
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
				</Form>

				{failed || (!loading && !decks.length) ?
					<p className="text-secondary mt-3 mb-0">
						{mine ? 'You have no deck yet.' : 'No deck for now.'}
					</p>
				:	<div className="alysion-deck-grid">
						{decks.map(deck => (
							<DeckTile key={deck.id} deck={deck} mine={mine} />
						))}
					</div>
				}
				{loading && <Spinner animation="border" role="status" aria-label="Loading" className="mt-3" />}
				{hasMore && !loading && (
					<div className="text-center mt-3">
						<Button variant="outline-secondary" onClick={() => load(page.current + 1)}>
							Show more
						</Button>
					</div>
				)}
			</section>
		</Layout>
	);
};

export default PageAlysionCommunity;
