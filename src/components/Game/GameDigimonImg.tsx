import React from 'react';
import { makeClassName } from '@/functions';
import { GameDigimon } from '@/types/GameDigimon';

interface Props {
	digimon?: GameDigimon;
}
const GameDigimonImg: React.FC<Props> = ({ digimon }) => {
	if (!digimon) return null;
	const src = digimon.image ? `/images/digimon/${digimon.image}.jpg` : digimon.icon;
	return (
		<img
			src={src}
			alt={digimon.name}
			title={digimon.name}
			loading="lazy"
			className={makeClassName('game-digimon-img', !digimon.image && 'icon')}
		/>
	);
};
export default GameDigimonImg;
