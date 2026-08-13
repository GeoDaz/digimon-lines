/**
 * Refresh Wikimon stats (level / type / attribute / field / Group / Class) for
 * entries of public/json/digimons/index.json.
 *
 * Recent Digimon are often added to the index before Wikimon publishes their
 * profile data, so their entry stays incomplete. This re-scrapes the pages and
 * merges the stats back in.
 *
 * Usage:
 *   node cmd/wikimon-update.cmd.js --min-year=2025            # recent entries
 *   node cmd/wikimon-update.cmd.js --missing                  # any incomplete entry
 *   node cmd/wikimon-update.cmd.js --only=amaterasumon,ariemon
 *   node cmd/wikimon-update.cmd.js --min-year=2025 --dry-run
 *   node cmd/wikimon-update.cmd.js --verify --only=agumon,omegamon
 *   node cmd/wikimon-update.cmd.js --only=heliosboamon --create
 *
 * Flags:
 *   --min-year=YYYY  target entries whose year is >= YYYY (default 2025 when no
 *                    other selector is given)
 *   --missing        target entries missing level, type, attribute or field
 *   --only=a,b,c     target these keys only
 *   --create         with --only, create entries that aren't in the index yet
 *                    (year and page title are read off the wikimon page)
 *   --overwrite      replace values that already exist (default: only fill holes)
 *   --dry-run        report what would change, write nothing
 *   --verify         compare scraped values with the stored ones, write nothing
 *   --delay=ms       delay between requests (default 1500 — wikimon is fragile,
 *                    don't hammer it)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { JSDOM } = require('jsdom');

const INDEX_PATH = path.join(
	process.cwd(),
	'public',
	'json',
	'digimons',
	'index.json'
);

// Wikimon shows the japanese stage names, the index stores the dub ones.
const LEVEL_MAP = {
	'Baby I': 'Baby I',
	'Baby II': 'Baby II',
	Child: 'Rookie',
	Adult: 'Champion',
	Perfect: 'Ultimate',
	Ultimate: 'Mega',
	'Super Ultimate': 'Mega+',
	Armor: 'Armor',
	Hybrid: 'Hybrid',
	Unknown: 'Unknown',
};

// Stats keys we care about, mapped to their index field name. Group and Class
// are kept verbatim, the way the index already holds them; every other row of
// the stats box (Min Weight, Subspecies, Equipment…) is ignored.
const STAT_KEYS = {
	Level: 'level',
	Type: 'type',
	Attribute: 'attribute',
	Field: 'field',
	Group: 'Group',
	Class: 'Class',
};

// Wikimon writes these when a source lists no value.
const PLACEHOLDERS = ['－', '-', '—', '?', 'N/A'];

const DATA_FIELDS = ['level', 'type', 'attribute', 'field'];

// index.json is prettier-formatted: tabs, and arrays kept on one line while
// they fit. Rewriting it any other way would reformat the whole file.
const KEY_ORDER = [
	'name',
	'name2',
	'year',
	'url',
	'level',
	'Class',
	'type',
	'attribute',
	'field',
	'Group',
	'variants',
];
const PRINT_WIDTH = 84;

const sortKeys = digimon =>
	Object.fromEntries(
		Object.entries(digimon).sort(([a], [b]) => {
			const rankA = KEY_ORDER.indexOf(a);
			const rankB = KEY_ORDER.indexOf(b);
			return (rankA < 0 ? KEY_ORDER.length : rankA) - (rankB < 0 ? KEY_ORDER.length : rankB);
		})
	);

/** JSON.stringify replacement matching the file's prettier formatting. */
const formatValue = (value, depth, prefixLength) => {
	const pad = '\t'.repeat(depth);
	const innerPad = '\t'.repeat(depth + 1);

	if (Array.isArray(value)) {
		if (!value.length) return '[]';
		const inline = `[${value.map(item => JSON.stringify(item)).join(', ')}]`;
		if (prefixLength + inline.length <= PRINT_WIDTH) return inline;
		const items = value.map(item => innerPad + JSON.stringify(item));
		return `[\n${items.join(',\n')}\n${pad}]`;
	}

	if (value && typeof value === 'object') {
		const entries = Object.entries(value);
		const body = entries.map(([key, child], position) => {
			const prefix = `${innerPad}${JSON.stringify(key)}: `;
			const comma = position < entries.length - 1 ? 1 : 0;
			return prefix + formatValue(child, depth + 1, prefix.length + comma);
		});
		return `{\n${body.join(',\n')}\n${pad}}`;
	}

	return JSON.stringify(value);
};

const formatIndex = data => `${formatValue(data, 0, 0)}\n`;

const parseArgs = argv => {
	const options = { delay: 1500 };
	argv.forEach(arg => {
		const [flag, value] = arg.replace(/^--/, '').split('=');
		switch (flag) {
			case 'min-year':
				options.minYear = parseInt(value, 10);
				break;
			case 'only':
				options.only = value.split(',').map(name => name.trim());
				break;
			case 'delay':
				options.delay = parseInt(value, 10);
				break;
			case 'missing':
			case 'overwrite':
			case 'create':
			case 'dry-run':
			case 'verify':
				options[flag === 'dry-run' ? 'dryRun' : flag] = true;
				break;
			default:
				console.warn(`Unknown flag: ${arg}`);
		}
	});
	if (!options.only && !options.missing && !options.minYear) options.minYear = 2025;
	return options;
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const fetchPage = (url, redirects = 0) =>
	new Promise((resolve, reject) => {
		https
			.get(url, { headers: { 'User-Agent': 'digimon-lines-scraper' } }, res => {
				const { statusCode, headers } = res;
				if (statusCode >= 300 && statusCode < 400 && headers.location) {
					res.resume();
					if (redirects >= 5) return reject(new Error(`Too many redirects: ${url}`));
					const next = headers.location.startsWith('http')
						? headers.location
						: `https://wikimon.net${headers.location}`;
					return fetchPage(next, redirects + 1).then(resolve, reject);
				}
				let data = '';
				res.on('data', chunk => (data += chunk));
				res.on('end', () => {
					if (statusCode === 200) resolve(data);
					else reject(new Error(`HTTP ${statusCode}: ${url}`));
				});
			})
			.on('error', reject);
	});

/** Cell text without the citation markers ("[2]") wikimon appends. */
const cellText = cell => {
	const clone = cell.cloneNode(true);
	clone.querySelectorAll('sup, .reference').forEach(node => node.remove());
	return clone.textContent.replace(/\s+/g, ' ').trim();
};

/**
 * Read the stats table. Rows are `label | value | citation`; a label with a
 * rowspan owns the value of the following label-less rows.
 */
const parseStatsTable = document => {
	const table = document.querySelector('#StatsBoxMorphContent1 table');
	if (!table) return null;

	const stats = {};
	let currentKey = null;

	Array.from(table.querySelectorAll('tr')).forEach(row => {
		const cells = Array.from(row.children).filter(cell => cell.tagName === 'TD');
		if (!cells.length) return;

		// Label cells are the bold ones; without a label the row continues the
		// previous key's rowspan.
		const hasLabel = !!cells[0].querySelector('b');
		let values = cells;
		if (hasLabel) {
			currentKey = cellText(cells[0]);
			values = cells.slice(1);
		}
		if (!currentKey || !STAT_KEYS[currentKey]) return;

		values
			.map(cellText)
			.filter(value => value && !PLACEHOLDERS.includes(value))
			.forEach(value => {
				stats[currentKey] = (stats[currentKey] || []).concat(value);
			});
	});

	return stats;
};

const parseVariants = document =>
	['#NavFrame1', '#NavFrame2'].flatMap(frameId => {
		const navContent = document.querySelector(`${frameId} .NavContent`);
		if (!navContent) return [];
		return Array.from(navContent.querySelectorAll('a'))
			.map(link => link.textContent.trim())
			.filter(Boolean);
	});

/** Turn the raw stats table into index.json fields. */
const toDigimonFields = stats => {
	const fields = {};
	Object.entries(stats).forEach(([key, values]) => {
		const target = STAT_KEYS[key];
		let list = values;
		if (target === 'level') list = list.map(value => LEVEL_MAP[value] || value);
		list = [...new Set(list)];
		fields[target] = list.length === 1 ? list[0] : list;
	});
	return fields;
};

/** Year of introduction, taken from the page categories. */
const parseYear = document =>
	Array.from(document.querySelectorAll('#catlinks a'))
		.map(link => link.textContent.match(/introduced in (\d{4})/i)?.[1])
		.find(Boolean) || null;

/** Same key normalisation as the index: "Helios Boamon" -> "heliosboamon". */
const trimNames = name =>
	name
		.trim()
		.replace('(X-Antibody)', 'x')
		.replace(/\s/g, '')
		.replace(/-/g, '')
		.replace(/[()]/g, '')
		.toLowerCase();

const scrape = async url => {
	const document = new JSDOM(await fetchPage(url)).window.document;
	const stats = parseStatsTable(document);
	const title = document.querySelector('#firstHeading')?.textContent.trim() || '';
	return {
		title,
		year: parseYear(document),
		// No table at all (card pages…) vs. a table wikimon hasn't filled yet.
		hasTable: !!stats,
		fields: stats ? toDigimonFields(stats) : {},
		variants: parseVariants(document),
	};
};

const urlOf = (key, digimon) => {
	if (digimon.url) return digimon.url;
	// Fall back on the wiki page name derived from the key.
	const slug = key
		.split('_')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join('_');
	return `https://wikimon.net/${slug}`;
};

const isIncomplete = digimon => DATA_FIELDS.some(field => !digimon[field]);

const selectTargets = (data, options) => {
	if (options.only) {
		return options.only.filter(key => {
			if (data[key] || options.create) return true;
			console.warn(`Unknown key, skipped (use --create to add it): ${key}`);
			return false;
		});
	}
	return Object.keys(data).filter(key => {
		const digimon = data[key];
		const recent = options.minYear && parseInt(digimon.year, 10) >= options.minYear;
		const incomplete = options.missing && isIncomplete(digimon);
		return recent || incomplete;
	});
};

const sameValue = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const update = async original => {
	const options = parseArgs(process.argv.slice(2));
	const data = JSON.parse(original);
	const targets = selectTargets(data, options);

	console.log(`${targets.length} entries to check`);
	if (options.verify) console.log('(verify mode: nothing will be written)\n');

	const updated = [];
	const unchanged = [];
	const failed = [];
	const noData = [];
	const mismatches = [];

	for (const key of targets) {
		const isNew = !data[key];
		const digimon = data[key] || { name: key, variants: [] };
		const url = urlOf(key, digimon);
		let result;
		try {
			result = await scrape(url);
		} catch (error) {
			console.log(`✗ ${key}: ${error.message}`);
			failed.push(key);
			await sleep(options.delay);
			continue;
		}
		if (!Object.keys(result.fields).length) {
			if (result.hasTable) {
				console.log(`- ${key}: wikimon has no stats yet`);
				noData.push(key);
			} else {
				console.log(`- ${key}: no stats box (${url})`);
				failed.push(key);
			}
			await sleep(options.delay);
			continue;
		}

		// A new entry has to match the page it was scraped from, otherwise we
		// would file someone else's stats under this key.
		if (isNew && trimNames(result.title) !== key) {
			console.log(`✗ ${key}: page is "${result.title}", not this Digimon`);
			failed.push(key);
			await sleep(options.delay);
			continue;
		}

		const changes = {};
		Object.entries(result.fields).forEach(([field, value]) => {
			const current = digimon[field];
			if (current === undefined || current === '') changes[field] = value;
			else if (!sameValue(current, value)) {
				if (options.verify || !options.overwrite) {
					mismatches.push({ key, field, current, scraped: value });
				}
				if (options.overwrite) changes[field] = value;
			}
		});
		if (!digimon.url) {
			// Store the canonical page name ("Helios Boamon" -> Helios_Boamon).
			changes.url = `https://wikimon.net/${result.title.replace(/\s/g, '_')}`;
		}
		if (!digimon.year && result.year) changes.year = result.year;

		if (Object.keys(changes).length) {
			console.log(`${isNew ? '+' : '✓'} ${key}: ${JSON.stringify(changes)}`);
			if (!options.verify && !options.dryRun) {
				data[key] = sortKeys({ ...digimon, ...changes });
			}
			updated.push(key);
		} else {
			unchanged.push(key);
		}

		await sleep(options.delay);
	}

	if (mismatches.length) {
		console.log(`\n=== ${mismatches.length} differing values (kept as-is) ===`);
		mismatches.forEach(({ key, field, current, scraped }) =>
			console.log(
				`${key}.${field}: stored ${JSON.stringify(current)} / wikimon ${JSON.stringify(
					scraped
				)}`
			)
		);
	}

	// Entries wikimon simply hasn't documented yet: worth re-running later.
	const stillIncomplete = targets.filter(key => {
		const digimon = { ...data[key] };
		return isIncomplete(digimon) && !failed.includes(key);
	});

	console.log(`\n=== Done ===`);
	console.log(`Updated: ${updated.length}`);
	console.log(`Already up to date: ${unchanged.length}`);
	console.log(`No stats on wikimon yet: ${noData.length}`);
	if (noData.length) console.log(noData.join(', '));
	console.log(`Failed (page or stats box missing): ${failed.length}`);
	if (failed.length) console.log(failed.join(', '));
	console.log(`Still incomplete after update: ${stillIncomplete.length}`);
	if (stillIncomplete.length) console.log(stillIncomplete.join(', '));

	if (options.verify || options.dryRun) {
		console.log('\nNothing written (verify/dry-run).');
		return;
	}
	if (updated.length) {
		fs.writeFileSync(INDEX_PATH, formatIndex(data), 'utf-8');
		console.log(`Written to ${INDEX_PATH}`);
	}
};

const run = async () => {
	const original = fs.readFileSync(INDEX_PATH, 'utf-8');
	// Guard against reformatting the whole file: our writer must reproduce the
	// untouched file byte for byte before we let it write anything.
	if (formatIndex(JSON.parse(original)) !== original) {
		throw new Error(
			'The formatter no longer reproduces index.json as-is; fix it before writing ' +
				'(otherwise the whole file gets reformatted).'
		);
	}
	return update(original);
};

if (require.main === module) {
	run().catch(error => {
		console.error(error.message || error);
		process.exit(1);
	});
}

module.exports = { formatIndex, parseStatsTable, toDigimonFields };
