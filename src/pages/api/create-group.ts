import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { IS_DEV } from '@/consts/env';
import { formatJsonLike } from '@/functions/json';
import { capitalize } from '@/functions';
import Group from '@/types/Group';

/** Same output as cmd/optimize-images.js, the images stay light and uniform. */
const MAX_SIZE = 800;
const QUALITY = 80;

export const config = {
	api: {
		// Group illustrations are sent as a base64 data url.
		bodyParser: { sizeLimit: '16mb' },
	},
};

/** Writes the illustration of the group as a jpg, whatever the sent format. */
const writeGroupImage = async (name: string, image: string) => {
	// Native module, only required in dev where this route is available.
	const sharp = require('sharp');
	sharp.cache(false);

	const input = Buffer.from(image.replace(/^data:[^;]+;base64,/, ''), 'base64');
	const metadata = await sharp(input).metadata();

	let pipeline = sharp(input).rotate(); // auto-orientation then strip
	if (Math.max(metadata.width, metadata.height) > MAX_SIZE) {
		pipeline = pipeline.resize(MAX_SIZE, MAX_SIZE, {
			fit: 'inside',
			withoutEnlargement: true,
		});
	}
	if (metadata.hasAlpha) {
		// JPEG has no transparency : flattened on a white background.
		pipeline = pipeline.flatten({ background: '#ffffff' });
	}
	const buffer = await pipeline.jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();

	const imagePath = path.join(process.cwd(), 'public', 'images', 'groups', `${name}.jpg`);
	const replaced = fs.existsSync(imagePath);
	fs.writeFileSync(imagePath, buffer);

	return replaced;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (!IS_DEV) {
		return res.status(403).json({ error: 'Only available in development mode' });
	}

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const { name, title, image } = req.body;

		if (!name) {
			return res.status(400).json({ error: 'Missing name' });
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

		// An existing group is never overwritten, it is only added to the index.
		const created = !fs.existsSync(filePath);
		if (created) {
			const group: Group = {
				title: String(title || '').trim() || capitalize(sanitizedName),
				main: [],
			};
			fs.writeFileSync(filePath, formatJsonLike(group), 'utf-8');
		}

		// The image is optional, and is the only file a known group can get.
		let replaced = false;
		if (image) {
			try {
				replaced = await writeGroupImage(sanitizedName, image);
			} catch (error) {
				console.error('Error writing the group image:', error);
				return res.status(400).json({
					error: 'The group was saved but its image could not be read',
					name: sanitizedName,
					created,
				});
			}
		}

		return res.status(200).json({
			success: true,
			name: sanitizedName,
			created,
			image: !image ? null
			: replaced ? 'replaced'
			: 'saved',
		});
	} catch (error) {
		console.error('Error creating group:', error);
		return res.status(500).json({ error: 'Failed to create the group' });
	}
}
