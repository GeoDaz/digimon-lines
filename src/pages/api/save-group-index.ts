import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { IS_DEV } from '@/consts/env';
import { formatJsonLike } from '@/functions/json';

const groupsDir = path.join(process.cwd(), 'public', 'json', 'groups');
const indexPath = path.join(groupsDir, '_index.json');

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
		const { groups } = req.body;

		if (!Array.isArray(groups)) {
			return res.status(400).json({ error: 'Missing groups data' });
		}

		const names: string[] = groups.reduce((acc: string[], group: any) => {
			const name = sanitizeName(typeof group == 'string' ? group : group?.name);
			if (name && !acc.includes(name)) acc.push(name);
			return acc;
		}, []);

		const previous = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf-8') : '';
		fs.writeFileSync(indexPath, formatJsonLike(names, previous), 'utf-8');

		// Send back thumbs so the page can tell which groups actually exist.
		const thumbs = names.map(name => ({
			name,
			available: fs.existsSync(path.join(groupsDir, `${name}.json`)),
		}));

		return res.status(200).json({ success: true, groups: thumbs });
	} catch (error) {
		console.error('Error saving groups:', error);
		return res.status(500).json({ error: 'Failed to save groups' });
	}
}
