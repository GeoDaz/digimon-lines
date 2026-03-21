import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { IS_DEV } from '@/consts/env';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (!IS_DEV) {
		return res.status(403).json({ error: 'Only available in development mode' });
	}

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const { name, line } = req.body;

		if (!name || !line) {
			return res.status(400).json({ error: 'Missing name or line data' });
		}

		const sanitizedName = String(name)
			.toLowerCase()
			.replace(/[^a-z0-9_-]/g, '_');

		const filePath = path.join(process.cwd(), 'public', 'json', 'lines', `${sanitizedName}.json`);
		const exists = fs.existsSync(filePath);

		fs.writeFileSync(filePath, JSON.stringify(line, null, '\t'), 'utf-8');

		return res.status(200).json({ success: true, name: sanitizedName, created: !exists });
	} catch (error) {
		console.error('Error saving line:', error);
		return res.status(500).json({ error: 'Failed to save line' });
	}
}
