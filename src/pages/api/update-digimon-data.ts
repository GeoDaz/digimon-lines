import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Digimon } from '@/types/Digimon';
import { IS_DEV } from '@/consts/env';

interface UpdateDigimonDataRequest {
	name: string;
	digimon: Digimon;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (!IS_DEV) {
		return res.status(403).json({ error: 'Only available in development mode' });
	}

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const { name, digimon } = req.body as UpdateDigimonDataRequest;

		if (!name || !digimon) {
			return res.status(400).json({ error: 'Missing name or digimon data' });
		}

		const filePath = path.join(
			process.cwd(),
			'public',
			'json',
			'digimons',
			'index.json'
		);
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		const data = JSON.parse(fileContent);

		// Merge onto the existing entry so untouched fields (url, evos, tags…) are
		// preserved, and keep the key's name in sync.
		data[name] = { ...data[name], ...digimon, name };

		fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf-8');

		return res.status(200).json({ success: true, name, digimon: data[name] });
	} catch (error) {
		console.error('Error updating digimon data:', error);
		return res.status(500).json({ error: 'Failed to update digimon data' });
	}
}
