import React from 'react';
import Image from 'next/image';
import { makeClassName } from '@/functions';
import { GameDigimon } from '@/types/GameDigimon';

interface Props {
	digimon?: GameDigimon;
}
const GameDigimonImg: React.FC<Props> = ({ digimon }) => {
	const src = digimon?.image ? `/images/digimon-thumbs/${digimon.image}.webp` : digimon?.icon;
	if (!digimon || !src) return null;
	return (
		<Image
			src={src}
			alt={digimon.name}
			title={digimon.name}
			width={64}
			height={64}
			className={makeClassName('game-digimon-img', !digimon.image && 'icon')}
		/>
	);
};
export default GameDigimonImg;
