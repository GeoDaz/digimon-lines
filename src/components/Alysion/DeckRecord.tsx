import React from 'react';
import { winRate } from '@/functions/alysionDecks';

interface Props {
	wins: number;
	losses: number;
	bestRank?: string | null;
}

const DeckRecord: React.FC<Props> = ({ wins, losses, bestRank }) => {
	const rate = winRate(wins, losses);
	if (rate === null && !bestRank) return null;
	return (
		<span className="alysion-record" title="Declared by the author, not verified">
			{rate !== null && (
				<>
					<b>
						{wins}W - {losses}L
					</b>{' '}
					({rate}%)
				</>
			)}
			{rate !== null && bestRank && ' · '}
			{bestRank}
			<small> declared</small>
		</span>
	);
};

export default DeckRecord;
