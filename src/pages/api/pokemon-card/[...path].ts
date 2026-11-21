import type { NextApiRequest, NextApiResponse } from 'next';
import { sendCachedImage } from '@/functions/cardImageCache';

const CARD_PATH = /^(en|fr|ja)\/[A-Za-z0-9.-]{1,30}\/[A-Za-z0-9.-]{1,30}\/[A-Za-z0-9.-]{1,20}\/(low|high)$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}
	const segments = req.query.path;
	const path = Array.isArray(segments) ? segments.join('/') : '';
	if (!CARD_PATH.test(path)) {
		return res.status(400).json({ error: 'Invalid card path' });
	}
	return sendCachedImage(res, `pokemon/${path}`, [`https://assets.tcgdex.net/${path}.webp`]);
}
