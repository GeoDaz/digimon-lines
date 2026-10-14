import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { IS_DEV } from '@/consts/env';
import { APPMON, GROUP, LINE, VB } from '@/consts/ui';
import { formatJsonLike } from '@/functions/json';

const DIRS: Record<string, string> = {
	[LINE]: 'lines',
	[VB]: 'vb',
	[APPMON]: 'appmons',
	[GROUP]: 'groups',
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (!IS_DEV) {
		return res.status(403).json({ error: 'Only available in development mode' });
	}

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const { name, line, type = LINE } = req.body;

		if (!name || !line) {
			return res.status(400).json({ error: 'Missing name or line data' });
		}

		const dir = DIRS[type];
		if (!dir) {
			return res.status(400).json({ error: `Unknown type "${type}"` });
		}

		const sanitizedName = String(name)
			.toLowerCase()
			.replace(/[^a-z0-9_-]/g, '_');

		const filePath = path.join(
			process.cwd(),
			'public',
			'json',
			dir,
			`${sanitizedName}.json`
		);
		const previous = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';

		if (type === GROUP) {
			if (!previous) {
				return res.status(404).json({ error: `Group "${sanitizedName}" not found` });
			}
			const group = { ...JSON.parse(previous), grid: line };
			fs.writeFileSync(filePath, formatJsonLike(group, previous), 'utf-8');
		} else if (type === VB || type === APPMON) {
			fs.writeFileSync(filePath, formatJsonLike(line, previous), 'utf-8');
		} else {
			fs.writeFileSync(filePath, JSON.stringify(line, null, 4), 'utf-8');
		}

		return res.status(200).json({
			success: true,
			name: sanitizedName,
			dir,
			created: !previous,
		});
	} catch (error) {
		console.error('Error saving line:', error);
		return res.status(500).json({ error: 'Failed to save line' });
	}
}
