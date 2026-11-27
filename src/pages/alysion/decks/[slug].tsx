import React, { useState } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { Badge, Button } from 'react-bootstrap';
import Layout from '@/components/Layout';
import Link from '@/components/Link';
import Icon from '@/components/Icon';
import AlysionColors from '@/components/Alysion/AlysionColors';
import CardImage from '@/components/Cards/CardImage';
import { cardImageUrl, CARD_LEVELS } from '@/functions/dcgCards';
import {
	AlysionCard,
	AlysionDeck,
	CARD_SECTIONS,
	decklistText,
	getAlysionDeck,
	getAlysionSlugs,
	TIER_LABELS,
} from '@/functions/alysion';

interface Props {
	deck: AlysionDeck;
}

export const getStaticPaths: GetStaticPaths = async () => ({
	paths: getAlysionSlugs().map(slug => ({ params: { slug } })),
	fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
	const deck = getAlysionDeck(String(params?.slug || ''));
	return deck ? { props: { deck } } : { notFound: true };
};

const sourceLabel = (url: string) => {
	try {
		return new URL(url).hostname.replace(/^www\./, '');
	} catch {
		return url;
	}
};

const DeckCard: React.FC<{ card: AlysionCard }> = ({ card }) => (
	<figure className="alysion-card" title={`${card.id} ${card.name}`}>
		<CardImage src={cardImageUrl(card.id)} name={card.name} code={card.id} />
		{card.count > 0 && <span className="alysion-card-count">×{card.count}</span>}
		<figcaption>
			{card.name}
			{card.restricted && (
				<Badge bg="warning" text="dark" className="ms-1" title="Limited to one copy">
					Restricted
				</Badge>
			)}
			<small>
				{card.id}
				{card.type === 'D' && CARD_LEVELS[card.level] && ` · ${CARD_LEVELS[card.level]}`}
			</small>
		</figcaption>
	</figure>
);

const PageAlysionDeck: React.FC<Props> = ({ deck }) => {
	const [copied, setCopied] = useState(false);
	const total = (cards: AlysionCard[]) => cards.reduce((sum, card) => sum + card.count, 0);

	const handleCopy = () => {
		navigator.clipboard
			.writeText(decklistText(deck.cards))
			.then(() => {
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			})
			.catch(() => setCopied(false));
	};

	return (
		<Layout
			title={deck.name}
			metatitle={`${deck.name} deck - Digimon Alysion`}
			metadescription={`${deck.name} decklist for Digimon Alysion (${TIER_LABELS[deck.tier]}): ${deck.summary}`}
			metaimg={cardImageUrl(deck.keyCards[0].id)}
		>
			<section className="alysion-panel">
				<div className="alysion-deck-head">
					<Badge bg="secondary" className={`alysion-tier-badge alysion-tier-${deck.tier}`}>
						{TIER_LABELS[deck.tier]}
					</Badge>
					<AlysionColors colors={deck.colors} />
					<span>{deck.style}</span>
					<Link href="/alysion" className="ms-auto">
						<Icon name="list-ol" /> Tier list
					</Link>
				</div>
				<p className="alysion-summary">{deck.summary}</p>
			</section>

			<section className="alysion-panel">
				<h2 className="alysion-section-title">Key cards</h2>
				<div className="alysion-key-cards">
					{deck.keyCards.map(card => (
						<DeckCard key={card.id} card={card} />
					))}
				</div>
			</section>

			<section className="alysion-panel">
				<div className="alysion-decklist-head">
					<h2 className="alysion-section-title">
						Decklist{' '}
						<small>
							{total(deck.cards.filter(card => card.type !== 'E'))} cards
						</small>
					</h2>
					<Button variant="outline-primary" onClick={handleCopy}>
						<Icon name={copied ? 'check-lg' : 'clipboard'} />{' '}
						{copied ? 'Copied' : 'Copy the list'}
					</Button>
				</div>
				{CARD_SECTIONS.map(({ type, title }) => {
					const cards = deck.cards.filter(card => card.type === type);
					if (!cards.length) return null;
					return (
						<section key={type} className="alysion-card-section">
							<h3>
								{title} <small>{total(cards)}</small>
							</h3>
							<div className="alysion-card-grid">
								{cards.map(card => (
									<DeckCard key={card.id} card={card} />
								))}
							</div>
						</section>
					);
				})}
			</section>

			<p className="alysion-credits">
				Decklist source:{' '}
				<a href={deck.source} target="_blank" rel="noopener noreferrer nofollow">
					{sourceLabel(deck.source)}
				</a>
				. Digimon Card Game card images © Bandai. Fan-made site, not affiliated with
				Bandai.
			</p>
		</Layout>
	);
};

export default PageAlysionDeck;
