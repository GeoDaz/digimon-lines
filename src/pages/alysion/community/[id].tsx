import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Alert, Spinner } from 'react-bootstrap';
import Layout from '@/components/Layout';
import Link from '@/components/Link';
import Icon from '@/components/Icon';
import LikeHeart from '@/components/Account/LikeHeart';
import AlysionColors from '@/components/Alysion/AlysionColors';
import AlysionDecklist from '@/components/Alysion/AlysionDecklist';
import CopyDecklistButton from '@/components/Alysion/CopyDecklistButton';
import DeckRecord from '@/components/Alysion/DeckRecord';
import { useAuth } from '@/context/auth';
import { DcgCard } from '@/functions/dcgCards';
import { countCards } from '@/functions/alysionCards';
import {
	CommunityDeck,
	fetchCommunityDeck,
	loadAlysionPool,
	readDeckEntries,
	resolveDeckCards,
} from '@/functions/alysionDecks';
import useDeckLike from '@/hooks/useDeckLike';

const PageCommunityDeck: React.FC = () => {
	const router = useRouter();
	const { user, loading: authLoading } = useAuth();
	const id = typeof router.query.id === 'string' ? router.query.id : '';

	const [deck, setDeck] = useState<CommunityDeck | null>(null);
	const [pool, setPool] = useState<Map<string, DcgCard> | null>(null);
	const [loading, setLoading] = useState(true);
	const [failed, setFailed] = useState(false);
	const like = useDeckLike(deck?.id, deck?.like_count ?? 0);

	useEffect(() => {
		if (!id || authLoading) return;
		let active = true;
		setLoading(true);
		setFailed(false);
		Promise.all([fetchCommunityDeck(id), loadAlysionPool()])
			.then(([found, cards]) => {
				if (!active) return;
				setDeck(found);
				setPool(cards);
			})
			.catch(error => {
				console.error('Failed to load the deck:', error);
				if (active) setFailed(true);
			})
			.finally(() => active && setLoading(false));
		return () => {
			active = false;
		};
	}, [id, authLoading]);

	const cards = useMemo(
		() => (deck && pool ? resolveDeckCards(readDeckEntries(deck.cards), pool) : []),
		[deck, pool]
	);
	const isOwn = !!user && deck?.user_id === user.id;
	const pseudo = deck?.profiles?.pseudo;

	return (
		<Layout
			title={deck?.title || 'Community deck'}
			metatitle={deck ? `${deck.title} - Digimon Alysion deck` : 'Digimon Alysion community deck'}
			metadescription="A Digimon Alysion deck shared by the community."
			metaimg="digimon-cards.jpg"
		>
			{loading ?
				<Spinner animation="border" role="status" aria-label="Loading" />
			: failed ?
				<Alert variant="danger">The deck could not be loaded. Please try again.</Alert>
			: !deck ?
				<Alert variant="warning">
					This deck does not exist, or it is private.{' '}
					<Link href="/alysion/community">See the community decks</Link>.
				</Alert>
			:	<>
					<section className="alysion-panel">
						<div className="alysion-deck-head">
							<AlysionColors colors={deck.colors} />
							{pseudo && (
								<span>
									by <Link href={`/profile/${pseudo}`}>{pseudo}</Link>
								</span>
							)}
							{!deck.is_public && <span className="badge bg-secondary">Private</span>}
							{deck.is_public && (
								<LikeHeart
									count={like.count}
									liked={like.liked}
									onClick={isOwn ? undefined : like.toggle}
								/>
							)}
							<span className="ms-auto d-flex gap-3">
								{isOwn && (
									<Link href={`/alysion/builder?id=${deck.id}`}>
										<Icon name="pencil" /> Edit
									</Link>
								)}
								<Link href="/alysion/community">
									<Icon name="people" /> Community decks
								</Link>
							</span>
						</div>
						<DeckRecord wins={deck.wins} losses={deck.losses} bestRank={deck.best_rank} />
						{deck.description && <p className="alysion-summary mt-2">{deck.description}</p>}
					</section>

					<section className="alysion-panel">
						<div className="alysion-decklist-head">
							<h2 className="alysion-section-title">
								Decklist{' '}
								<small>{countCards(cards.filter(card => card.type !== 'E'))} cards</small>
							</h2>
							<CopyDecklistButton cards={cards} />
						</div>
						<AlysionDecklist cards={cards} />
					</section>
				</>
			}
		</Layout>
	);
};

export default PageCommunityDeck;
