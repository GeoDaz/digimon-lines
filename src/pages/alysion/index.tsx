import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import { Button, Modal } from 'react-bootstrap';
import Layout from '@/components/Layout';
import Link from '@/components/Link';
import Icon from '@/components/Icon';
import AlysionColors from '@/components/Alysion/AlysionColors';
import CardImage from '@/components/Cards/CardImage';
import { cardImageUrl } from '@/functions/dcgCards';
import {
	AlysionCard,
	AlysionDeckSummary,
	getAlysionDeckSummaries,
	getAlysionRestricted,
	getAlysionUpdated,
	TIER_LABELS,
} from '@/functions/alysion';

interface Props {
	decks: AlysionDeckSummary[];
	restricted: AlysionCard[];
	updated: string;
}

export const getStaticProps: GetStaticProps<Props> = async () => ({
	props: {
		decks: getAlysionDeckSummaries(),
		restricted: getAlysionRestricted(),
		updated: getAlysionUpdated(),
	},
});

const formatDate = (date: string) =>
	new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	});

const PageAlysion: React.FC<Props> = ({ decks, restricted, updated }) => {
	const [showRestricted, setShowRestricted] = useState(false);
	const tiers = decks
		.map(deck => deck.tier)
		.filter((tier, index, list) => list.indexOf(tier) === index)
		.sort((a, b) => a - b);
	return (
		<Layout
			noGoBack
			title="Digimon Alysion meta"
			metatitle="Digimon Alysion tier list and top decks"
			metadescription="The strongest decks of Digimon Alysion, the Digimon Card Game app, ranked by tier with full decklists, key cards and strategy."
			metaimg="digimon-cards.jpg"
		>
			<p className="alysion-intro">
				The best decks of the Digimon Alysion app, with full decklists to build
				your own. Alysion just launched, so this tier list comes from early player
				guides, not from tournament results yet: expect it to move. Last update:{' '}
				{formatDate(updated)}.
			</p>
			<div className="alysion-links">
				<Link href="/alysion/community" className="btn btn-primary">
					<Icon name="people-fill" /> Community decks
				</Link>
				<Link href="/alysion/builder" className="btn btn-outline-light">
					<Icon name="plus-lg" /> Create your deck
				</Link>
				<Button variant="outline-warning" onClick={() => setShowRestricted(true)}>
					<Icon name="slash-circle" /> Restricted cards
				</Button>
			</div>
			{tiers.map(tier => (
				<section key={tier} className="alysion-tier alysion-panel">
					<h2 className={`alysion-tier-title alysion-tier-${tier}`}>
						{TIER_LABELS[tier] || `Tier ${tier}`}
					</h2>
					<div className="alysion-deck-grid">
						{decks
							.filter(deck => deck.tier === tier)
							.map(deck => (
								<Link
									key={deck.slug}
									href={`/alysion/decks/${deck.slug}`}
									className="alysion-deck-tile"
								>
									<CardImage src={cardImageUrl(deck.cover)} name={deck.coverName} code={deck.cover} />
									<span className="alysion-deck-tile-name">{deck.name}</span>
									<span className="alysion-deck-tile-meta">
										<AlysionColors colors={deck.colors} /> {deck.style}
									</span>
								</Link>
							))}
					</div>
				</section>
			))}
			<Modal show={showRestricted} onHide={() => setShowRestricted(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>Restricted cards</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p className="alysion-intro">
						The official Alysion list limits these cards to one copy per deck. No card is
						banned for now.
					</p>
					<div className="alysion-key-cards">
						{restricted.map(card => (
							<figure key={card.id} className="alysion-card">
								<CardImage src={cardImageUrl(card.id)} name={card.name} code={card.id} />
								<span className="alysion-card-count">×1</span>
								<figcaption>
									{card.name}
									<small>{card.id}</small>
								</figcaption>
							</figure>
						))}
					</div>
				</Modal.Body>
			</Modal>
			<p className="alysion-credits">
				Decklists gathered from community guides such as Game8. Digimon Card Game card
				images © Bandai. Fan-made site, not affiliated with Bandai.
			</p>
		</Layout>
	);
};

export default PageAlysion;
