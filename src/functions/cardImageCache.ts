import type { NextApiResponse } from 'next';

const MAX_BYTES = 2 * 1024 * 1024;
const LONG_CACHE = 'public, max-age=31536000, immutable';
const IMAGE_TYPES = ['image/webp', 'image/png', 'image/jpeg'];

interface CachedImage {
	body: ArrayBuffer;
	contentType: string;
}

interface Bucket {
	get(key: string): Promise<{
		arrayBuffer(): Promise<ArrayBuffer>;
		httpMetadata?: { contentType?: string };
	} | null>;
	put(
		key: string,
		value: ArrayBuffer,
		options?: { httpMetadata?: { contentType?: string } }
	): Promise<unknown>;
}

const getBucket = async (): Promise<Bucket | null> => {
	try {
		const { getCloudflareContext } = await import('@opennextjs/cloudflare');
		const { env } = await getCloudflareContext({ async: true });
		return ((env as Record<string, unknown>).CARD_IMAGES as Bucket) || null;
	} catch {
		return null;
	}
};

const fetchFirst = async (urls: string[]): Promise<CachedImage | null> => {
	for (const url of urls) {
		try {
			const response = await fetch(url, {
				headers: {
					Accept: 'image/webp,image/png,image/jpeg',
					'User-Agent': 'DigimonLinesImageProxy/1.0 (+https://digimon-lines.com)',
				},
			});
			if (!response.ok) continue;
			const contentType = (response.headers.get('content-type') || '').split(';')[0].trim();
			if (!IMAGE_TYPES.includes(contentType)) continue;
			const body = await response.arrayBuffer();
			if (!body.byteLength || body.byteLength > MAX_BYTES) continue;
			return { body, contentType };
		} catch {
			continue;
		}
	}
	return null;
};

export const sendCachedImage = async (res: NextApiResponse, key: string, urls: string[]) => {
	const bucket = await getBucket();
	let image: CachedImage | null = null;

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
		image = await fetchFirst(urls);
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
	res.setHeader('X-Content-Type-Options', 'nosniff');
	res.send(Buffer.from(image.body));
};
