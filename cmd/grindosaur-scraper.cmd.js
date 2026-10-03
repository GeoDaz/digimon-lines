const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { JSDOM } = require('jsdom');

const GAMES = {
	dsts: 'digimon-story-time-stranger',
	dscs: 'digimon-story-cyber-sleuth',
};
const BASE_URL = 'https://www.grindosaur.com/en/games';
const CACHE_DIR = path.join(os.tmpdir(), 'grindosaur-cache');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'json', 'games');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'digimon');
const ATTRIBUTES_DIR = path.join(__dirname, '..', 'public', 'images', 'games');
const DELAY = 400;

const DAMAGES = {
	'Double Damage': 2,
	'One and a Half Damage': 1.5,
	'No Effect': 1,
	'Half Damage': 0.5,
	'No Damage': 0,
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const clean = text => (text || '').replace(/\s+/g, ' ').trim();

const fetchPage = async url => {
	const cacheFile = path.join(CACHE_DIR, url.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '_') + '.html');
	if (fs.existsSync(cacheFile)) return fs.readFileSync(cacheFile, 'utf-8');
	for (let attempt = 1; attempt <= 3; attempt++) {
		const html = execFileSync(
			'curl',
			[
				'-sL',
				'--compressed',
				'-H',
				'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
				'-H',
				'Accept: text/html',
				'-H',
				'Accept-Language: en-US,en;q=0.9',
				url,
			],
			{ encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
		);
		await sleep(DELAY);
		if (html.includes('<main') && !html.includes('Attention Required! | Cloudflare')) {
			fs.mkdirSync(CACHE_DIR, { recursive: true });
			fs.writeFileSync(cacheFile, html);
			return html;
		}
		await sleep(DELAY * 10 * attempt);
	}
	throw new Error(`Unable to fetch ${url}`);
};

const slugOf = href => (href || '').split('/').filter(Boolean).pop();

const cellText = cell => {
	const clone = cell.cloneNode(true);
	clone.querySelectorAll('img').forEach(img => {
		const title = img.getAttribute('title');
		if (!title || clean(clone.textContent).length) img.replaceWith(' ');
		else img.replaceWith(title);
	});
	clone.querySelectorAll('br').forEach(br => br.replaceWith(' '));
	return clean(clone.textContent);
};

const tableColumns = table =>
	Array.from(table.querySelectorAll('thead th')).map(th => clean(th.textContent));

const tableRows = table =>
	Array.from(table.querySelectorAll('tbody tr'))
		.map(tr => Array.from(tr.querySelectorAll('th, td')))
		.filter(cells => cells.length);

const genericTable = (table, skipColumns = []) => {
	const columns = tableColumns(table);
	const keep = columns.map((column, i) => !skipColumns.includes(column) && i);
	const kept = keep.filter(i => i !== false);
	return {
		columns: kept.map(i => columns[i]),
		rows: tableRows(table).map(cells => kept.map(i => (cells[i] ? cellText(cells[i]) : ''))),
	};
};

const sections = main => {
	const result = [];
	let h2 = '';
	let h3 = '';
	main.querySelectorAll('h2, h3, table').forEach(el => {
		if (el.tagName === 'H2') {
			h2 = clean(el.textContent);
			h3 = '';
		} else if (el.tagName === 'H3') {
			h3 = clean(el.textContent);
		} else {
			result.push({ h2, h3, table: el });
		}
	});
	return result;
};

const parseQuickFacts = table => {
	const facts = [];
	let current = null;
	tableRows(table).forEach(cells => {
		const th = cells.find(cell => cell.tagName === 'TH');
		const td = cells.find(cell => cell.tagName === 'TD');
		if (th) {
			current = { label: clean(th.textContent), values: [] };
			facts.push(current);
		}
		if (td && current) current.values.push(cellText(td));
	});
	return facts;
};

const parseResistances = table => {
	const names = tableColumns(table);
	const cells = tableRows(table)[0] || [];
	return names.map((name, i) => {
		const title = cells[i]?.querySelector('img')?.getAttribute('title');
		return { name, value: DAMAGES[title] ?? title ?? null };
	});
};

const parseStats = table => {
	const columns = tableColumns(table).slice(1);
	const rows = tableRows(table);
	const hasMid = rows.some(cells => clean(cells[3]?.textContent));
	const levels = hasMid ? ['Lv. 1', ...columns] : ['Lv. 1', columns[columns.length - 1]];
	return {
		levels,
		rows: rows.map(cells => {
			const values = [cells[1], cells[3], cells[4]]
				.filter((cell, i) => hasMid || i !== 1)
				.map(cell => {
					const value = parseInt(clean(cell?.textContent).replace(/[^0-9-]/g, ''), 10);
					return isNaN(value) ? null : value;
				});
			return { stat: clean(cells[0].textContent), values };
		}),
	};
};

const parseRelations = table =>
	Array.from(table.querySelectorAll('tbody tr'))
		.map(tr => slugOf(tr.querySelector('a[href*="/digimon/"]')?.getAttribute('href')))
		.filter(Boolean);

const parseTwoColumns = table =>
	tableRows(table).map(cells => ({
		label: cellText(cells[0]).replace(/:$/, ''),
		values: cells.slice(1).map(cellText).filter(Boolean),
	}));

const parseSkills = table => {
	const skills = genericTable(table);
	const iconIndex = skills.columns.indexOf('Icon');
	const nameIndex = skills.columns.indexOf('Name');
	if (iconIndex === -1) return skills;
	if (skills.rows.every(row => row[iconIndex] === row[nameIndex])) {
		return {
			columns: skills.columns.filter((column, i) => i !== iconIndex),
			rows: skills.rows.map(row => row.filter((cell, i) => i !== iconIndex)),
		};
	}
	skills.columns[iconIndex] = 'Element';
	return skills;
};

const parseDetails = html => {
	const dom = new JSDOM(html);
	const main = dom.window.document.querySelector('main');
	const details = { facts: [], resistances: [], skills: [] };
	const description = Array.from(main.querySelectorAll('h2')).find(
		h2 => clean(h2.textContent) === 'In-game description'
	);
	if (description) details.description = clean(description.parentElement.querySelector('p')?.textContent);

	sections(main).forEach(({ h2, h3, table }) => {
		const caption = clean(table.querySelector('caption')?.textContent);
		if (caption === 'Quick Facts') {
			details.facts = parseQuickFacts(table);
		} else if (/Resistances$/.test(h2) && /Resistances$/.test(h3)) {
			details.resistances.push({ title: h3, entries: parseResistances(table) });
		} else if (/Type Effectiveness$/.test(h2)) {
			details.effectiveness = parseTwoColumns(table).filter(row => row.label !== 'Type effectiveness chart');
		} else if (/Support Skill$/.test(h2)) {
			details.supportSkills = tableRows(table).map(cells => ({
				name: cellText(cells[0]),
				effect: cellText(cells[1] || cells[0]),
			}));
		} else if (/base stats$/i.test(h2)) {
			details.stats = parseStats(table);
		} else if (/(Evolution|Digivolution) Conditions$/.test(h2)) {
			details.conditions = genericTable(table);
		} else if (h2 === 'Evolves from') {
			details.from = parseRelations(table);
		} else if (h2 === 'Evolves to') {
			details.to = parseRelations(table);
		} else if (h2 === 'Skills' && h3) {
			details.skills.push({ title: h3, ...parseSkills(table) });
		} else if (/attack moves$/.test(h2)) {
			const moves = parseSkills(table);
			const typeIndex = moves.columns.indexOf('Skill Type');
			const groups = {};
			moves.rows.forEach(row => {
				const type = row[typeIndex] || 'Skills';
				(groups[type] ??= []).push(row.filter((cell, i) => i !== typeIndex));
			});
			const columns = moves.columns.filter((column, i) => i !== typeIndex);
			Object.entries(groups).forEach(([title, rows]) => details.skills.push({ title, columns, rows }));
		}
	});
	dom.window.close();
	return details;
};

const parseList = html => {
	const dom = new JSDOM(html);
	const table = Array.from(dom.window.document.querySelectorAll('main table')).find(
		table => clean(table.querySelector('th')?.textContent) === 'No. #'
	);
	const columns = Array.from(table.querySelector('tr').querySelectorAll('th')).map(th => clean(th.textContent));
	const list = Array.from(table.querySelectorAll('tbody tr'))
		.map(tr => {
			const cells = Array.from(tr.querySelectorAll('td'));
			const link = tr.querySelector('a[href*="/digimon/"]');
			if (!link || !/^\d+$/.test(clean(cells[0]?.textContent))) return null;
			const row = {};
			columns.forEach((column, i) => (row[column] = cells[i] ? cellText(cells[i]) : ''));
			return {
				slug: slugOf(link.getAttribute('href')),
				number: clean(cells[0].textContent),
				name: clean(link.textContent),
				icon: tr.querySelector('img')?.getAttribute('src'),
				row,
			};
		})
		.filter(Boolean);
	dom.window.close();
	return list;
};

const imageKeys = () => {
	const keys = new Set(fs.readdirSync(IMAGES_DIR).map(file => file.replace(/\.jpg$/, '')));
	const dubNames = require('../public/json/dubnames.json');
	const aliases = {};
	Object.entries(dubNames).forEach(([japanese, dub]) => {
		(aliases[dub] ??= []).push(japanese);
		(aliases[japanese] ??= []).push(dub);
	});
	return { keys, aliases };
};

const LEVEL_NUMBERS = {
	'Training 1': 1,
	'In-Training I': 1,
	'Training 2': 2,
	'In-Training II': 2,
	Rookie: 3,
	Champion: 4,
	Ultimate: 5,
	Mega: 6,
	'Mega +': 7,
	Ultra: 7,
};

const LEVEL_WORDS = ['in', 'tr', 'training', 'rookie', 'champion', 'ultimate', 'mega', 'ultra'];

const MODE_ABBREVIATIONS = {
	bm: ['burst_mode'],
	cm: ['crimson_mode'],
	dm: ['destroy_mode', 'dragon_mode', 'drunk'],
	fm: ['fighter_mode'],
	hm: ['holy_mode', 'hysteric_mode'],
	lm: ['leopard_mode'],
	mm: ['merciful_mode'],
	pm: ['paladin_mode'],
	rm: ['rage_mode'],
	sm: ['sleep_mode', 'satan_mode'],
	sv: ['detached'],
	wm: ['wrath_mode', 'werewolf_mode'],
	x_antibody: ['x'],
	blk: ['black'],
	good: ['virtue'],
};

const IMAGE_OVERRIDES = {
	'cherubimon-black': 'cherubimon_vice',
	'agumon-bond-of-bravery': 'agumon_yuki_no_kizuma',
	'gabumon-bond-of-friendship': 'gabumon_yujo_no_kizuma',
	motimon: 'mochimon',
	huckmon: 'hackmon',
	baohuckmon: 'baohackmon',
	saviorhuckmon: 'saviorhackmon',
	funbeemon: 'fanbeemon',
	sorcermon: 'sorcerymon',
	lighdramon: 'raidramon',
	lanamon: 'ranamon',
	cerberusmon: 'cerberumon',
	'cerberusmon-wm': 'cerberumon_werewolf_mode',
	loaderleomon: 'loaderliomon',
	hippogryphonmon: 'hippogriffomon',
	craniamon: 'craniummon',
	'craniamon-plus-enbarrmon': 'craniummon_enbarrmon',
	zombieplutomon: 'zombie_plutomon',
	rusttyrannomon: 'rusttyranomon',
	'beelzemon-bm': 'beelzebumon_blast_mode',
	'lucemon-cm': 'lucemon_falldown_mode',
	'lucemon-fm': 'lucemon_falldown_mode',
	'kerpymon-blk': 'cherubimon_vice',
	'kerpymon-good': 'cherubimon_virtue',
	socerimon: 'sorcerymon',
	hououmon: 'phoenixmon',
	brakedramon: 'breakdramon',
	'chaosmon-va': 'chaosmon_valdur_arm',
	'sistermon-b-awake': 'sistermon_blanc_awake',
	'sistermon-c-awake': 'sistermon_ciel_awake',
};

const expandTokens = tokens => {
	let variants = [tokens];
	tokens.forEach((token, i) => {
		const options = [token, ...(MODE_ABBREVIATIONS[token] || [])];
		if (/^black.+/.test(token)) options.push(`black_${token.slice(5)}`);
		variants = variants.flatMap(variant =>
			options.map(option => [...variant.slice(0, i), option, ...variant.slice(i + 1)])
		);
	});
	return variants.map(variant => variant.join('_'));
};

const findImage = (name, slug, generation, { keys, aliases }) => {
	if (IMAGE_OVERRIDES[slug] && keys.has(IMAGE_OVERRIDES[slug])) return IMAGE_OVERRIDES[slug];
	const words = name
		.toLowerCase()
		.replace(/x antibody/g, 'x_antibody')
		.replace(/[():.'’+]/g, ' ')
		.split(/[\s-]+/)
		.filter(Boolean);
	const variants = [...expandTokens(words), slug.replace(/-/g, '_')];
	if (words.includes('black')) {
		const rest = words.filter(word => word !== 'black');
		variants.push(...expandTokens(['black', ...rest]));
	}
	const withAliases = variant => {
		const [first, ...rest] = variant.split('_');
		return [
			variant,
			variant.replace(/_/g, ''),
			...(aliases[first] || []).map(alias => [alias, ...rest].join('_')),
			...(aliases[variant] || []),
			...(aliases[variant.replace(/_/g, '')] || []),
		];
	};
	const found = variants.flatMap(withAliases).find(candidate => keys.has(candidate));
	if (found) return found;
	const level = LEVEL_NUMBERS[generation];
	const base = words.filter(word => !LEVEL_WORDS.includes(word));
	if (!level || base.length === words.length) return undefined;
	return withAliases(base.join('_'))
		.map(candidate => `${candidate}_${level}`)
		.find(candidate => keys.has(candidate));
};

const splitModes = (from, to, modes = []) => {
	const both = new Set([...modes, ...from.filter(slug => to.includes(slug))]);
	return {
		modes: [...both],
		from: from.filter(slug => !both.has(slug)),
		to: to.filter(slug => !both.has(slug)),
	};
};

const LIST_FIELDS = {
	dsts: { generation: 'Generation', attribute: 'Attribute', type: 'Type', personality: 'Base Perso.' },
	dscs: { generation: 'Stage', attribute: 'Type', type: 'Attribute', memory: 'Memory Usage' },
};

const scrapeGame = async game => {
	const slug = GAMES[game];
	if (!slug) throw new Error(`Unknown game ${game}, expected one of ${Object.keys(GAMES).join(', ')}`);
	const list = parseList(await fetchPage(`${BASE_URL}/${slug}/digimon`));
	console.log(`${game}: ${list.length} digimon`);
	const images = imageKeys();
	const digimons = [];
	const details = {};
	const missingImages = [];
	for (const [i, entry] of list.entries()) {
		const html = await fetchPage(`${BASE_URL}/${slug}/digimon/${entry.slug}`);
		const { from = [], to = [], ...rest } = parseDetails(html);
		const fields = LIST_FIELDS[game];
		const digimon = { slug: entry.slug, number: entry.number, name: entry.name };
		Object.entries(fields).forEach(([key, column]) => {
			if (entry.row[column]) digimon[key] = entry.row[column];
		});
		const image = findImage(entry.name, entry.slug, entry.row[fields.generation], images);
		if (image) digimon.image = image;
		else {
			digimon.icon = entry.icon;
			missingImages.push(entry.name);
		}
		Object.assign(digimon, splitModes(from, to));
		digimons.push(digimon);
		details[entry.slug] = normalizeDetails(game, rest, digimon);
		if ((i + 1) % 25 === 0) console.log(`${game}: ${i + 1}/${list.length}`);
	}
	fs.mkdirSync(path.join(OUTPUT_DIR, game), { recursive: true });
	fs.writeFileSync(path.join(OUTPUT_DIR, game, 'digimons.json'), JSON.stringify(digimons, null, '\t'));
	fs.writeFileSync(path.join(OUTPUT_DIR, game, 'details.json'), JSON.stringify(details));
	console.log(`${game}: done, ${missingImages.length} without local image`);
	if (missingImages.length) console.log(missingImages.join(', '));
};

const remapImages = game => {
	const file = path.join(OUTPUT_DIR, game, 'digimons.json');
	const images = imageKeys();
	const missingImages = [];
	const digimons = JSON.parse(fs.readFileSync(file, 'utf-8')).map(({ image, icon, ...digimon }) => {
		const found = findImage(digimon.name, digimon.slug, digimon.generation, images);
		const fallback = icon || `https://www.grindosaur.com/img/games/${GAMES[game]}/icons/${digimon.slug}-icon.png`;
		if (!found) missingImages.push(digimon.name);
		const { from, to, modes, ...rest } = digimon;
		return {
			...rest,
			...(found ? { image: found } : { icon: fallback }),
			...splitModes(from, to, modes),
		};
	});
	fs.writeFileSync(file, JSON.stringify(digimons, null, '	'));
	console.log(`${game}: images remapped, ${missingImages.length} without local image`);
	if (missingImages.length) console.log(missingImages.join(', '));
};

const attributeKey = attribute => attribute.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const FACT_RENAMES = {
	dsts: { Generation: 'Stage' },
	dscs: {},
};

const FACT_SWAPS = {
	dsts: [],
	dscs: [['Attribute', 'Type', 'attribute']],
};

const normalizeDetails = (game, details, digimon) => {
	const facts = details.facts.map(fact => ({ ...fact, label: FACT_RENAMES[game][fact.label] || fact.label }));
	FACT_SWAPS[game].forEach(([first, second, field]) => {
		const a = facts.findIndex(fact => fact.label === first);
		const b = facts.findIndex(fact => fact.label === second);
		if (a === -1 || b === -1 || facts[a].values[0] === digimon[field]) return;
		[facts[a].values, facts[b].values] = [facts[b].values, facts[a].values];
	});
	return { ...details, facts };
};

const normalizeDetailsFile = game => {
	const file = path.join(OUTPUT_DIR, game, 'details.json');
	const details = JSON.parse(fs.readFileSync(file, 'utf-8'));
	const digimons = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, game, 'digimons.json'), 'utf-8'));
	digimons.forEach(digimon => {
		if (details[digimon.slug]) details[digimon.slug] = normalizeDetails(game, details[digimon.slug], digimon);
	});
	fs.writeFileSync(file, JSON.stringify(details));
	console.log(`${game}: details normalized`);
};

const ICON_FIELDS = {
	dsts: ['attribute'],
	dscs: ['attribute', 'type'],
};

const downloadAttributeIcons = async game => {
	const digimons = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, game, 'digimons.json'), 'utf-8'));
	const dir = path.join(ATTRIBUTES_DIR, game, 'attributes');
	fs.mkdirSync(dir, { recursive: true });
	const values = [
		...new Set(ICON_FIELDS[game].flatMap(field => digimons.map(digimon => digimon[field])).filter(Boolean)),
	];
	const sources = [GAMES[game], ...Object.values(GAMES).filter(slug => slug !== GAMES[game])];
	for (const value of values) {
		const key = attributeKey(value);
		const file = path.join(dir, `${key}.png`);
		if (fs.existsSync(file)) continue;
		for (const source of sources) {
			try {
				execFileSync('curl', [
					'-sfL',
					'-A',
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
					'-o',
					file,
					`https://www.grindosaur.com/img/games/${source}/icons/${key}-icon.png`,
				]);
				break;
			} catch (error) {
				if (fs.existsSync(file)) fs.unlinkSync(file);
			} finally {
				await sleep(DELAY);
			}
		}
		if (!fs.existsSync(file)) console.log(`${game}: no icon for ${value}`);
	}
	console.log(`${game}: ${values.length} icons`);
};

const run = async () => {
	const imagesOnly = process.argv.includes('--images');
	const attributesOnly = process.argv.includes('--attributes');
	const detailsOnly = process.argv.includes('--details');
	const games = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
	for (const game of games.length ? games : Object.keys(GAMES)) {
		if (detailsOnly) normalizeDetailsFile(game);
		else if (attributesOnly) await downloadAttributeIcons(game);
		else if (imagesOnly) remapImages(game);
		else await scrapeGame(game);
	}
};

if (require.main === module) {
	run().catch(error => {
		console.error(error);
		process.exit(1);
	});
}

module.exports = { parseDetails, parseList, findImage, imageKeys };
