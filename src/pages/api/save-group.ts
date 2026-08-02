import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { IS_DEV } from '@/consts/env';
import { formatJsonLike } from '@/functions/json';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (!IS_DEV) {
		return res.status(403).json({ error: 'Only available in development mode' });
	}

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const { name, group } = req.body;

		if (!name || !group) {
			return res.status(400).json({ error: 'Missing name or group data' });
		}

		const sanitizedName = String(name)
			.toLowerCase()
			.replace(/[^a-z0-9_-]/g, '_');

		const filePath = path.join(
			process.cwd(),
			'public',
			'json',
			'groups',
			`${sanitizedName}.json`
		);
		const previous = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';

		fs.writeFileSync(filePath, formatJsonLike(group, previous), 'utf-8');

		return res
			.status(200)
			.json({ success: true, name: sanitizedName, created: !previous });
	} catch (error) {
		console.error('Error saving group:', error);
		return res.status(500).json({ error: 'Failed to save group' });
	}
}
