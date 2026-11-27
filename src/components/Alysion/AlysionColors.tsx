import React from 'react';
import { DIGIMON_COLORS } from '@/functions/cardGames';

const AlysionColors: React.FC<{ colors: string[] }> = ({ colors }) => (
	<span className="alysion-colors">
		{colors.map(color => (
			<span
				key={color}
				className="alysion-color"
				style={{ background: DIGIMON_COLORS[color] }}
				title={color}
			/>
		))}
	</span>
);

export default AlysionColors;
