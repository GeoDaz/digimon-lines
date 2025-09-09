const fs = require('fs');
const https = require('https');
const { JSDOM } = require('jsdom');

class WikimonScraper {
	constructor() {
		this.baseUrl = 'https://wikimon.net';
		this.delay = 1000; // 1 second delay between requests
		this.scraped = new Set(); // Track scraped pages to avoid duplicates
	}

	async fetchPage(url) {
		return new Promise((resolve, reject) => {
			https
				.get(url, res => {
					let data = '';
					res.on('data', chunk => (data += chunk));
					res.on('end', () => {
						if (res.statusCode === 200) {
							resolve(data);
						} else {
							reject(new Error(`HTTP ${res.statusCode}: ${url}`));
						}
					});
				})
				.on('error', reject);
		});
	}

	async sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	parseStatsTable(dom) {
		const statsBox = dom.window.document.querySelector('#StatsBoxMorphContent1');
		if (!statsBox) return null;

		const table = statsBox.querySelector('table');
		if (!table) return null;

		const rows = Array.from(table.querySelectorAll('tr'));
		const stats = {};
		let currentKey = null;
		let rowspanCount = 0;

		for (const row of rows) {
			const cells = Array.from(row.querySelectorAll('td'));

			if (cells.length === 0) continue;

			// Check if first cell has rowspan or if we're continuing a rowspan
			if (rowspanCount > 0) {
				// We're in a rowspan continuation
				if (currentKey && cells.length > 0) {
					const value = cells[0].textContent.trim();
					if (value) {
						if (Array.isArray(stats[currentKey])) {
							stats[currentKey].push(value);
						} else {
							stats[currentKey] = [stats[currentKey], value];
						}
					}
				}
				rowspanCount--;
			} else if (cells.length >= 2) {
				// New key-value pair
				const key = cells[0].textContent.trim();
				const value = cells[1].textContent.trim();

				if (key === 'Min Weight') continue;

				if (key && value) {
					currentKey = key;
					stats[key] = value;

					// Check for rowspan
					const rowspan = parseInt(cells[0].getAttribute('rowspan') || '1');
					if (rowspan > 1) {
						rowspanCount = rowspan - 1;
						stats[key] = [value]; // Initialize as array for rowspan
					}
				}
			}
		}

		return stats;
	}

	parseVariants(dom) {
		const variants = [];
		const navFrameIds = ['#NavFrame1', '#NavFrame2'];
		
		navFrameIds.forEach(frameId => {
			const navFrame = dom.window.document.querySelector(frameId);
			if (navFrame) {
				const navContent = navFrame.querySelector('.NavContent');
				if (navContent) {
					const links = Array.from(navContent.querySelectorAll('a'));
					links.forEach(link => {
						const text = link.textContent.trim();
						if (text) {
							variants.push(text);
						}
					});
				}
			}
		});

		return variants;
	}

	trimNames(name) {
		return name
			.trim()
			.replace('(X-Antibody)', 'x')
			.replace(/\s/g, '')
			.replace(/-/g, '')
			.replace(/[()]/g, '')
			.toLowerCase();
	}

	async scrapeDigimonPage(url) {
		if (this.scraped.has(url)) {
			console.log(`Already scraped: ${url}`);
			return null;
		}

		try {
			console.log(`Scraping: ${url}`);
			const html = await this.fetchPage(url);
			const dom = new JSDOM(html);

			const name = this.trimNames(
				dom.window.document.querySelector('#firstHeading').textContent
			);
			const stats = this.parseStatsTable(dom);
			const variants = this.parseVariants(dom);
			this.scraped.add(url);

			await this.sleep(this.delay);
			return { name, stats, variants };
		} catch (error) {
			console.error(`Error scraping ${url}:`, error.message);
			return null;
		}
	}

	async getDigimonLinksFromCategory(categoryUrl) {
		try {
			console.log(`Getting Digimon list from: ${categoryUrl}`);
			const html = await this.fetchPage(categoryUrl);
			const dom = new JSDOM(html);

			const mwPages = dom.window.document.querySelector('#mw-pages');
			if (!mwPages) return [];

			const links = Array.from(mwPages.querySelectorAll('a'))
				.map(a => this.baseUrl + a.getAttribute('href'))
				.filter(href => href && !href.includes('Category:'));

			await this.sleep(this.delay);
			return links;
		} catch (error) {
			console.error(`Error getting links from ${categoryUrl}:`, error.message);
			return [];
		}
	}

	async getYearCategories() {
		try {
			const mainCategoryUrl = `${this.baseUrl}/Category:Digimon_by_year_of_introduction`;
			console.log(`Getting year categories from: ${mainCategoryUrl}`);

			const html = await this.fetchPage(mainCategoryUrl);
			const dom = new JSDOM(html);

			const subcategories = dom.window.document.querySelector('#mw-subcategories');
			if (!subcategories) return [];

			const categoryLinks = Array.from(subcategories.querySelectorAll('a'))
				.map(a => this.baseUrl + a.getAttribute('href'))
				.filter(href => href && href.includes('Category:Digimon_introduced_in_'));

			await this.sleep(this.delay);
			return categoryLinks;
		} catch (error) {
			console.error(`Error getting year categories:`, error.message);
			return [];
		}
	}

	async scrapeAllDigimon() {
		const allDigimonData = {};

		try {
			// Get all year categories
			const yearCategories = await this.getYearCategories();
			console.log(`Found ${yearCategories.length} year categories`);

			for (const categoryUrl of yearCategories) {
				// Extract year from URL for organization
				const year = categoryUrl.match(/introduced_in_(\d+)/)?.[1] || 'unknown';
				console.log(`\nProcessing year: ${year}`);

				// Get all Digimon links from this year
				const digimonLinks = await this.getDigimonLinksFromCategory(categoryUrl);
				console.log(`Found ${digimonLinks.length} Digimon in ${year}`);

				// Scrape each Digimon page
				for (const digimonUrl of digimonLinks) {
					const result = await this.scrapeDigimonPage(digimonUrl);

					if (result && result.stats) {
						const { name, stats, variants } = result;
						allDigimonData[name] = {
							name: name,
							year: year,
							url: digimonUrl,
							stats: stats,
							variants: variants,
						};
						console.log(`✓ Scraped ${name}`);
					} else {
						console.log(`✗ Failed to scrape ${result?.name || 'unknown'}`);
					}
				}
			}

			return allDigimonData;
		} catch (error) {
			console.error('Error in scrapeAllDigimon:', error.message);
			return allDigimonData;
		}
	}

	async run() {
		console.log('Starting Wikimon.net Digimon scraper...\n');

		const startTime = Date.now();
		const digimonData = await this.scrapeAllDigimon();
		const endTime = Date.now();

		const totalDigimon = Object.keys(digimonData).length;
		const timeTaken = Math.round((endTime - startTime) / 1000);

		console.log(`\n=== Scraping Complete ===`);
		console.log(`Total Digimon scraped: ${totalDigimon}`);
		console.log(`Time taken: ${timeTaken} seconds`);

		// Save to JSON file
		const outputFile = 'wikimon-digimon-data.json';
		fs.writeFileSync(outputFile, JSON.stringify(digimonData, null, 2));
		console.log(`Data saved to: ${outputFile}`);

		return digimonData;
	}
}

// Run the scraper if this file is executed directly
if (require.main === module) {
	const scraper = new WikimonScraper();
	scraper.run().catch(console.error);
}

module.exports = WikimonScraper;
