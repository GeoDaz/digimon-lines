import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { DigimonItem } from '@/types/Digimon';
import { IS_DEV } from '@/consts/env';
import {
	mergeItemRelations,
	renameRelationsTo,
	syncRelations,
} from '@/functions/relations';

interface UpdateDigimonRequest {
	level: string;
	originalName: string;
	originalLevel?: string;
	digimon: DigimonItem;
	/** The entry the edit started from, to merge against the stored one. */
	baseItem?: DigimonItem;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (!IS_DEV) {
		return res.status(403).json({ error: 'Only available in development mode' });
	}

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const { level, originalName, digimon, baseItem } =
			req.body as UpdateDigimonRequest;
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

		// Relations of the stored entry, to know which ones this edit drops.
		const previousItem = JSON.parse(
			JSON.stringify(ranked[originalLevel][originalName])
		) as DigimonItem;

		// The client may have edited a copy the mirroring has completed since:
		// keep the relations it doesn't know about instead of dropping them.
		const item = mergeItemRelations(
			previousItem,
			digimon,
			baseItem
		) as DigimonItem;

		if (movingLevel || renaming) {
			delete ranked[originalLevel][originalName];
		}

		if (!ranked[level]) {
			ranked[level] = {};
		}
		ranked[level][item.name] = item;

		// Drop the source level if the move emptied it.
		if (
			movingLevel &&
			ranked[originalLevel] &&
			Object.keys(ranked[originalLevel]).length === 0
		) {
			delete ranked[originalLevel];
		}

		// Follow the rename in the relations of the other digimons before
		// mirroring, so they are compared under the new name.
		if (renaming) {
			renameRelationsTo(ranked, originalName, item.name);
		}
		syncRelations(ranked, item.name, previousItem);

		fs.writeFileSync(filePath, JSON.stringify(ranked, null, 4), 'utf-8');

		return res.status(200).json({
			success: true,
			digimon: ranked[level][item.name],
			level,
			originalLevel,
			originalName,
			// Mirroring edits other entries: send the whole list back so the
			// client doesn't have to guess what changed.
			list: ranked,
		});
	} catch (error) {
		console.error('Error updating digimon:', error);
		return res.status(500).json({ error: 'Failed to update digimon' });
	}
}
