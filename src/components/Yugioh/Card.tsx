import React from 'react';
import { Card as CardType } from '@/types/YugiohCard';
import Image from 'next/image';
import CardPopup from './CardPopup';

// width 260, height 379
const Card = ({
	card,
	width = 88,
	height = 128,
	bottom = false,
}: {
	card: CardType;
	width?: number;
	height?: number;
	bottom?: boolean;
}) => {
	return (
		<CardPopup card={card} placement={bottom ? 'top' : 'bottom'}>
			{(onMouseEnter, onMouseLeave) => (
				<a
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					href={`https://www.masterduelmeta.com/cards/${encodeURIComponent(
						card.name
					)}`}
					target="_blank"
					rel="noopener noreferrer nofollow"
					title={card.name}
				>
					<Image
						src={`/api/yugioh-card/${card._id}/w260`}
						alt={card.name}
						width={width}
						height={height}
					/>
				</a>
			)}
		</CardPopup>
	);
};

export default Card;
