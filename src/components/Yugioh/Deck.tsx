import React from 'react';
import { Card as CardType } from '@/types/YugiohCard';
import Card from './Card';
import Icon from '@/components/Icon';

const Deck = ({
	deck,
	title = 'Deck',
	max = 60,
	bottom = false,
	handleAddCard,
}: {
	deck: CardType[];
	title?: string;
	max?: number;
	bottom?: boolean;
	handleAddCard?: () => void;
}) => {
	// TODO ajouter et supprimer des cartes
	return (
		<div className="card">
			<div className="card-header">
				<h2 className="card-title">
					{title} ({deck.length})
				</h2>
			</div>
			<div className="d-flex flex-wrap gap-3 card-body">
				{deck.map((card, i) => (
					<Card key={i} card={card} bottom={bottom} />
				))}
				{/* {deck.length < max && (
					<div
						className="bg-secondary-subtle rounded-3 p-3 d-flex justify-content-center align-items-center click"
						style={{ width: '88px', height: '128px' }}
						
					>
						<Icon name="plus" className="h1" />
					</div>
				)} */}
			</div>
		</div>
	);
};

export default Deck;
