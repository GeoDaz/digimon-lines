import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { Badge } from 'react-bootstrap';
import Layout from '@/components/Layout';
import Link from '@/components/Link';
import Icon from '@/components/Icon';
import AlysionColors from '@/components/Alysion/AlysionColors';
import AlysionDecklist, { AlysionDeckCard } from '@/components/Alysion/AlysionDecklist';
import CopyDecklistButton from '@/components/Alysion/CopyDecklistButton';
import { cardImageUrl } from '@/functions/dcgCards';
import { countCards } from '@/functions/alysionCards';
import { AlysionDeck, getAlysionDeck, getAlysionSlugs, TIER_LABELS } from '@/functions/alysion';

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

const PageAlysionDeck: React.FC<Props> = ({ deck }) => (
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
					<AlysionDeckCard key={card.id} card={card} />
				))}
			</div>
		</section>

		<section className="alysion-panel">
			<div className="alysion-decklist-head">
				<h2 className="alysion-section-title">
					Decklist <small>{countCards(deck.cards.filter(card => card.type !== 'E'))} cards</small>
				</h2>
				<CopyDecklistButton cards={deck.cards} />
			</div>
			<AlysionDecklist cards={deck.cards} />
		</section>

		<p className="alysion-credits">
			Decklist source:{' '}
			<a href={deck.source} target="_blank" rel="noopener noreferrer nofollow">
				{sourceLabel(deck.source)}
			</a>
			. Digimon Card Game card images © Bandai. Fan-made site, not affiliated with Bandai.
		</p>
	</Layout>
);

export default PageAlysionDeck;
