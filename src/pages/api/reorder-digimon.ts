import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { IS_DEV } from '@/consts/env';

interface ReorderDigimonRequest {
	level: string;
	order: string[];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (!IS_DEV) {
		return res.status(403).json({ error: 'Only available in development mode' });
	}

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const { level, order } = req.body as ReorderDigimonRequest;

		if (!level || !Array.isArray(order)) {
			return res.status(400).json({ error: 'Missing level or order data' });
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

		const currentLevel = ranked[level];
		const seen = new Set<string>();
		const reordered: { [key: string]: any } = {};

		// Place the digimons following the requested order first.
		for (const name of order) {
			if (currentLevel[name] && !seen.has(name)) {
				reordered[name] = currentLevel[name];
				seen.add(name);
			}
		}

		// Keep any digimon not present in the order to avoid data loss.
		for (const name of Object.keys(currentLevel)) {
			if (!seen.has(name)) {
				reordered[name] = currentLevel[name];
			}
		}

		ranked[level] = reordered;

		fs.writeFileSync(filePath, JSON.stringify(ranked, null, 4), 'utf-8');

		return res.status(200).json({ success: true, level, order: Object.keys(reordered) });
	} catch (error) {
		console.error('Error reordering digimons:', error);
		return res.status(500).json({ error: 'Failed to reorder digimons' });
	}
}
