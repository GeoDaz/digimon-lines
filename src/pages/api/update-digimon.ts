import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { DigimonItem } from '@/types/Digimon';
import { IS_DEV } from '@/consts/env';

interface UpdateDigimonRequest {
	level: string;
	originalName: string;
	originalLevel?: string;
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
		// The digimon has no id, so the client sends its previous level to move it.
		const originalLevel =
			(req.body as UpdateDigimonRequest).originalLevel || level;

		if (!level || !digimon || !digimon.name || !originalName) {
			return res
				.status(400)
				.json({ error: 'Missing level, originalName or digimon data' });
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

		if (!ranked[originalLevel]) {
			return res
				.status(404)
				.json({ error: `Level "${originalLevel}" not found` });
		}

		if (!ranked[originalLevel][originalName]) {
			return res.status(404).json({
				error: `Digimon "${originalName}" not found in level "${originalLevel}"`,
			});
		}

		const movingLevel = originalLevel !== level;
		const renaming = originalName !== digimon.name;

		if (
			(movingLevel || renaming) &&
			ranked[level] &&
			ranked[level][digimon.name]
		) {
			return res.status(409).json({
				error: `Digimon "${digimon.name}" already exists in level "${level}"`,
			});
		}

		if (movingLevel || renaming) {
			delete ranked[originalLevel][originalName];
		}

		if (!ranked[level]) {
			ranked[level] = {};
		}
		ranked[level][digimon.name] = digimon;

		// Drop the source level if the move emptied it.
		if (
			movingLevel &&
			ranked[originalLevel] &&
			Object.keys(ranked[originalLevel]).length === 0
		) {
			delete ranked[originalLevel];
		}

		fs.writeFileSync(filePath, JSON.stringify(ranked, null, 4), 'utf-8');

		return res
			.status(200)
			.json({ success: true, digimon, level, originalLevel, originalName });
	} catch (error) {
		console.error('Error updating digimon:', error);
		return res.status(500).json({ error: 'Failed to update digimon' });
	}
}
