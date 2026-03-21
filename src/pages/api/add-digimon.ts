import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { DigimonItem } from '@/types/Digimon';
import { IS_DEV } from '@/consts/env';

interface AddDigimonRequest {
	level: string;
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
		const { level, digimon } = req.body as AddDigimonRequest;

		if (!level || !digimon || !digimon.name) {
			return res.status(400).json({ error: 'Missing level or digimon data' });
		}

		const filePath = path.join(process.cwd(), 'public', 'json', 'digimons', 'ranked.json');
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		const ranked = JSON.parse(fileContent);

		if (!ranked[level]) {
			ranked[level] = {};
		}

		if (ranked[level][digimon.name]) {
			return res.status(409).json({ error: `Digimon "${digimon.name}" already exists in level "${level}"` });
		}

		ranked[level][digimon.name] = digimon;

		fs.writeFileSync(filePath, JSON.stringify(ranked, null, '\t'), 'utf-8');

		return res.status(200).json({ success: true, digimon, level });
	} catch (error) {
		console.error('Error adding digimon:', error);
		return res.status(500).json({ error: 'Failed to add digimon' });
	}
}
