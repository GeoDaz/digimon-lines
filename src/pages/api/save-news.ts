import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { IS_DEV } from '@/consts/env';

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

// Keep the handwritten formatting of _news.json : one entry per line and grid
// arrays inlined, so saving from the site does not rewrite the whole file.
const stringifyNews = (news: Array<string | NewsItem>): string => {
	const entries = news.map(item => {
		if (typeof item == 'string') return `\t${JSON.stringify(item)}`;
		const fields = [`\t\t"name": ${JSON.stringify(item.name)}`];
		if (item.grid?.length) {
			fields.push(`\t\t"grid": [${item.grid.map(n => JSON.stringify(n)).join(', ')}]`);
		}
		return `\t{\n${fields.join(',\n')}\n\t}`;
	});
	return `[\n${entries.join(',\n')}\n]\n`;
};

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

		fs.writeFileSync(newsPath, stringifyNews(sanitized), 'utf-8');

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
