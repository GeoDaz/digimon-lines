import type { NextApiRequest, NextApiResponse } from 'next';

const CARD_ID = /^[A-Z]{1,4}\d{0,2}-\d{1,3}(_P\d{1,2})?$/;
const MAX_BYTES = 2 * 1024 * 1024;
const LONG_CACHE = 'public, max-age=31536000, immutable';

interface Bucket {
	get(key: string): Promise<{ arrayBuffer(): Promise<ArrayBuffer>; httpMetadata?: { contentType?: string } } | null>;
	put(key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
}

const sources = (id: string): string[] => {
	const isVariant = id.includes('_P');
	return [
		...(isVariant ? [] : [`https://images.digimoncard.io/images/cards/${id}.webp`]),
		`https://web-garage.takaotaku.de/${id}.webp`,
		`https://world.digimoncard.com/images/cardlist/card/${id}.png`,
		`https://digimoncard.com/images/cardlist/card/${id}.png`,
	];
};

const getBucket = async (): Promise<Bucket | null> => {
	try {
		const { getCloudflareContext } = await import('@opennextjs/cloudflare');
		const { env } = await getCloudflareContext({ async: true });
		return ((env as Record<string, unknown>).CARD_IMAGES as Bucket) || null;
	} catch {
		return null;
	}
};

const fetchUpstream = async (id: string) => {
	for (const url of sources(id)) {
		try {
			const response = await fetch(url, { headers: { Accept: 'image/webp,image/png' } });
			if (!response.ok) continue;
			const contentType = (response.headers.get('content-type') || '').split(';')[0].trim();
			if (contentType !== 'image/webp' && contentType !== 'image/png') continue;
			const body = await response.arrayBuffer();
			if (!body.byteLength || body.byteLength > MAX_BYTES) continue;
			return { body, contentType };
		} catch {
			continue;
		}
	}
	return null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}
	const id = String(req.query.id || '').toUpperCase().replace(/\.(WEBP|PNG)$/, '');
	if (!CARD_ID.test(id)) {
		return res.status(400).json({ error: 'Invalid card id' });
	}

	const bucket = await getBucket();
	const key = `cards/${id}`;
	let image: { body: ArrayBuffer; contentType: string } | null = null;

	if (bucket) {
		const stored = await bucket.get(key).catch(() => null);
		if (stored) {
			image = {
				body: await stored.arrayBuffer(),
				contentType: stored.httpMetadata?.contentType || 'image/webp',
			};
		}
	}

	if (!image) {
		image = await fetchUpstream(id);
		if (!image) {
			res.setHeader('Cache-Control', 'public, max-age=3600');
			return res.status(404).json({ error: 'Card image not found' });
		}
		if (bucket) {
			await bucket
				.put(key, image.body, { httpMetadata: { contentType: image.contentType } })
				.catch(() => null);
		}
	}

	res.setHeader('Content-Type', image.contentType);
	res.setHeader('Cache-Control', LONG_CACHE);
	res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
	res.send(Buffer.from(image.body));
}
