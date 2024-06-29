import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		const browser = await puppeteer.launch({ headless: true });
		const page = await browser.newPage();
		const xCases = req.body.columns.length;
		const yCases = req.body.size;
		await page.setViewport({
			width: 70 + 45 + 175 * xCases,
			height: 70 + 45 + 175 * yCases,
		});
		// prettier-ignore
		await page.goto(
			process.env.URL 
			+ '/build/' 
			+ encodeURIComponent(JSON.stringify(req.body))
			+ '/screen'
		);

		await new Promise(resolve => setTimeout(resolve, 500));
		const screenshot = await page.screenshot();
		await browser.close();

		res.setHeader('Content-Type', 'image/png');
		res.send(screenshot);
	} catch (e: any) {
		res.status(500).json({ message: e.message });
	}
}
