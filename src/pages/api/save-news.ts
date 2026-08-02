import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { IS_DEV } from '@/consts/env';
import { formatJsonLike } from '@/functions/json';

interface NewsItem {
	name: string;
	grid?: string[];
}

const linesDir = path.join(process.cwd(), 'public', 'json', 'lines');
const newsPath = path.join(linesDir, '_news.json');

const sanitizeName = (name: unknown): string =>
	String(name || '')
		.toLowerCase()
		.replace(/[^a-z0-9_-]/g, '_');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (!IS_DEV) {
		return res.status(403).json({ error: 'Only available in development mode' });
	}

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const { news } = req.body;

		if (!Array.isArray(news)) {
			return res.status(400).json({ error: 'Missing news data' });
		}

		const sanitized = news.reduce((acc: Array<string | NewsItem>, item: any) => {
			const name = sanitizeName(typeof item == 'string' ? item : item?.name);
			if (!name) return acc;
			const grid =
				Array.isArray(item?.grid) ?
					item.grid.map(sanitizeName).filter(Boolean)
				:	[];
			acc.push(grid.length ? { name, grid } : name);
			return acc;
		}, []);

		const previous = fs.existsSync(newsPath) ? fs.readFileSync(newsPath, 'utf-8') : '';
		fs.writeFileSync(newsPath, formatJsonLike(sanitized, previous), 'utf-8');

		// Send back thumbs so the page can tell which lines actually exist.
		const thumbs = sanitized.map(item => {
			const thumb: NewsItem = typeof item == 'string' ? { name: item } : item;
			return {
				...thumb,
				available: fs.existsSync(path.join(linesDir, `${thumb.name}.json`)),
			};
		});

		return res.status(200).json({ success: true, news: thumbs });
	} catch (error) {
		console.error('Error saving news:', error);
		return res.status(500).json({ error: 'Failed to save news' });
	}
}
