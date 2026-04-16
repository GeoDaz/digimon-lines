import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { url } = req.query;

	if (!url || typeof url !== 'string') {
		return res.status(400).json({ error: 'Missing url parameter' });
	}

	try {
		const response = await fetch(url);
		const buffer = await response.arrayBuffer();
		const contentType = response.headers.get('content-type') || 'image/png';

		res.setHeader('Content-Type', contentType);
		res.setHeader('Cache-Control', 'public, max-age=86400');
		res.send(Buffer.from(buffer));
	} catch {
		res.status(500).json({ error: 'Failed to fetch image' });
	}
}
