import React from 'react';
import { Badge } from 'react-bootstrap';
import CardImage from '@/components/Cards/CardImage';
import { cardImageUrl, CARD_LEVELS } from '@/functions/dcgCards';
import { AlysionCard, CARD_SECTIONS, countCards } from '@/functions/alysionCards';

export const AlysionDeckCard: React.FC<{ card: AlysionCard; children?: React.ReactNode }> = ({
	card,
	children,
}) => (
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
		{children}
	</figure>
);

interface Props {
	cards: AlysionCard[];
	renderActions?: (card: AlysionCard) => React.ReactNode;
}

const AlysionDecklist: React.FC<Props> = ({ cards, renderActions }) => (
	<>
		{CARD_SECTIONS.map(({ type, title }) => {
			const list = cards.filter(card => card.type === type);
			if (!list.length) return null;
			return (
				<section key={type} className="alysion-card-section">
					<h3>
						{title} <small>{countCards(list)}</small>
					</h3>
					<div className="alysion-card-grid">
						{list.map(card => (
							<AlysionDeckCard key={card.id} card={card}>
								{renderActions?.(card)}
							</AlysionDeckCard>
						))}
					</div>
				</section>
			);
		})}
	</>
);

export default AlysionDecklist;
