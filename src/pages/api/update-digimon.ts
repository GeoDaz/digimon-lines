import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { DigimonItem } from '@/types/Digimon';
import { IS_DEV } from '@/consts/env';

interface UpdateDigimonRequest {
	level: string;
	originalName: string;
	digimon: DigimonItem;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (!IS_DEV) {
		return res.status(403).json({ error: 'Only available in development mode' });
	}

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const { level, originalName, digimon } = req.body as UpdateDigimonRequest;

		if (!level || !digimon || !digimon.name || !originalName) {
			return res.status(400).json({ error: 'Missing level, originalName or digimon data' });
		}

		const filePath = path.join(process.cwd(), 'public', 'json', 'digimons', 'ranked.json');
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		const ranked = JSON.parse(fileContent);

		if (!ranked[level]) {
			return res.status(404).json({ error: `Level "${level}" not found` });
		}

		if (!ranked[level][originalName]) {
			return res.status(404).json({ error: `Digimon "${originalName}" not found in level "${level}"` });
		}

		if (originalName !== digimon.name && ranked[level][digimon.name]) {
			return res.status(409).json({ error: `Digimon "${digimon.name}" already exists in level "${level}"` });
		}

		if (originalName !== digimon.name) {
			delete ranked[level][originalName];
		}

		ranked[level][digimon.name] = digimon;

		fs.writeFileSync(filePath, JSON.stringify(ranked, null, '\t'), 'utf-8');

		return res.status(200).json({ success: true, digimon, level, originalName });
	} catch (error) {
		console.error('Error updating digimon:', error);
		return res.status(500).json({ error: 'Failed to update digimon' });
	}
}
