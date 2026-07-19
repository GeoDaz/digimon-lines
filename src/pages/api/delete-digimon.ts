import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { IS_DEV } from '@/consts/env';

interface DeleteDigimonRequest {
	level: string;
	name: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (!IS_DEV) {
		return res.status(403).json({ error: 'Only available in development mode' });
	}

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const { level, name } = req.body as DeleteDigimonRequest;

		if (!level || !name) {
			return res.status(400).json({ error: 'Missing level or name' });
		}

		const filePath = path.join(
			process.cwd(),
			'public',
			'json',
			'digimons',
			'ranked.json'
		);
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		const ranked = JSON.parse(fileContent);

		if (!ranked[level]) {
			return res.status(404).json({ error: `Level "${level}" not found` });
		}

		if (!ranked[level][name]) {
			return res
				.status(404)
				.json({ error: `Digimon "${name}" not found in level "${level}"` });
		}

		delete ranked[level][name];

		// Drop the level entirely once it holds no digimon left.
		if (Object.keys(ranked[level]).length === 0) {
			delete ranked[level];
		}

		fs.writeFileSync(filePath, JSON.stringify(ranked, null, 4), 'utf-8');

		return res.status(200).json({ success: true, level, name });
	} catch (error) {
		console.error('Error deleting digimon:', error);
		return res.status(500).json({ error: 'Failed to delete digimon' });
	}
}
