import type { NextApiRequest, NextApiResponse } from 'next';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = /^image\/(png|jpe?g|gif|webp|avif|bmp)$/;

const parseUrl = (value: string): URL | null => {
	try {
		const url = new URL(value);
		return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
	} catch {
		return null;
	}
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { url } = req.query;
	const target = typeof url === 'string' ? parseUrl(url) : null;
	if (!target) {
		return res.status(400).json({ error: 'Invalid url parameter' });
	}

	try {
		const response = await fetch(target, { headers: { Accept: 'image/*' } });
		if (!response.ok) {
			return res.status(502).json({ error: 'Failed to fetch image' });
		}

		const contentType = (response.headers.get('content-type') || '')
			.split(';')[0]
			.trim()
			.toLowerCase();
		if (!ALLOWED_TYPES.test(contentType)) {
			return res.status(415).json({ error: 'Not an image' });
		}

		const declaredLength = Number(response.headers.get('content-length'));
		if (declaredLength > MAX_BYTES) {
			return res.status(413).json({ error: 'Image too large' });
		}

		const buffer = await response.arrayBuffer();
		if (buffer.byteLength > MAX_BYTES) {
			return res.status(413).json({ error: 'Image too large' });
		}

		res.setHeader('Content-Type', contentType);
		res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
		res.setHeader('X-Content-Type-Options', 'nosniff');
		res.setHeader('Cache-Control', 'private, no-store');
		res.send(Buffer.from(buffer));
	} catch {
		res.status(500).json({ error: 'Failed to fetch image' });
	}
}
