import type { NextApiRequest, NextApiResponse } from 'next';
import { sendCachedImage } from '@/functions/cardImageCache';

const CARD_ID = /^[0-9a-f]{24}$/;
const SIZES = ['w260', 'w420'];
const MAX_NAME_LENGTH = 120;
const API = 'https://www.masterduelmeta.com/api/v1/cards';

interface ApiCard {
	_id: string;
	name: string;
	alternateArt?: boolean;
}

const imageUrl = (id: string, size: string) => `https://s3.duellinksmeta.com/cards/${id}_${size}.webp`;

const findCards = async (query: string): Promise<ApiCard[]> => {
	const response = await fetch(`${API}?${query}&fields=_id,name,alternateArt&limit=20`, {
		headers: { 'User-Agent': 'DigimonLinesImageProxy/1.0 (+https://digimon-lines.com)' },
	});
	return response.ok ? response.json() : [];
};

const resolveName = async (name: string): Promise<string[]> => {
	const lower = name.toLowerCase();
	const exact = await findCards(`name=${encodeURIComponent(name)}`);
	const candidates =
		exact.length ? exact : (
			(await findCards(`search=${encodeURIComponent(name)}`)).filter(
				card => card.name.toLowerCase() === lower
			)
		);
	const card = candidates.find(item => !item.alternateArt) || candidates[0];
	return card && CARD_ID.test(card._id) ? [imageUrl(card._id, 'w260')] : [];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}
	const segments = Array.isArray(req.query.path) ? req.query.path : [];

	if (segments[0] === 'name' && segments.length === 2) {
		const name = segments[1].trim();
		if (!name || name.length > MAX_NAME_LENGTH) {
			return res.status(400).json({ error: 'Invalid card name' });
		}
		const key = `yugioh/name/${encodeURIComponent(name.toLowerCase())}`;
		return sendCachedImage(res, key, () => resolveName(name));
	}

	const [id, size] = segments;
	if (segments.length !== 2 || !CARD_ID.test(id) || !SIZES.includes(size)) {
		return res.status(400).json({ error: 'Invalid card path' });
	}
	return sendCachedImage(res, `yugioh/${id}/${size}`, [imageUrl(id, size)]);
}
