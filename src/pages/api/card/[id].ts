import type { NextApiRequest, NextApiResponse } from 'next';
import { sendCachedImage } from '@/functions/cardImageCache';
import game8Images from '@/json/alysion/game8-images.json';

const CARD_ID = /^[A-Z]{1,4}\d{0,2}-\d{1,3}(_P\d{1,2})?$/;
const ALYSION_ID = /^(BD|SD)0(\d)-(\d{2})$/;

const alysionId = (id: string) => {
	const match = ALYSION_ID.exec(id);
	if (!match) return null;
	const [, set, number, card] = match;
	return `${set}${number}-${set === 'BD' ? card.padStart(3, '0') : card}`;
};

const sources = (id: string): string[] => [
	...(id.includes('_P') ? [] : [`https://images.digimoncard.io/images/cards/${id}.webp`]),
	`https://web-garage.takaotaku.de/${id}.webp`,
	`https://world.digimoncard.com/images/cardlist/card/${id}.png`,
	`https://digimoncard.com/images/cardlist/card/${id}.png`,
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}
	const id = String(req.query.id || '').toUpperCase().replace(/\.(WEBP|PNG)$/, '');
	if (!CARD_ID.test(id)) {
		return res.status(400).json({ error: 'Invalid card id' });
	}
	const alysion = alysionId(id);
	if (alysion) {
		const japanese = (game8Images as Record<string, string>)[id];
		return sendCachedImage(
			res,
			`alysion/${alysion}`,
			[`https://alysionmeta.com/cards/${alysion}.webp`],
			japanese ? { key: `alysion-ja/${alysion}`, urls: [japanese] } : undefined
		);
	}
	return sendCachedImage(res, `cards/${id}`, sources(id));
}
