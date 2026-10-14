const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { JSDOM } = require('jsdom');

const BASE_URL = 'https://humulos.com/digimon';
const PAGES = [
	{ device: 'dim', series: 'Bundled', url: `${BASE_URL}/vbdm/` },
	{ device: 'dim', series: 'Vol Series', url: `${BASE_URL}/vbdm/vol/` },
	{ device: 'dim', series: 'EX Series', url: `${BASE_URL}/vbdm/ex/` },
	{ device: 'dim', series: 'V Series', url: `${BASE_URL}/vbdm/v/` },
	{ device: 'dim', series: 'Other', url: `${BASE_URL}/vbdm/other/` },
	{ device: 'bem', series: 'Special Selection', url: `${BASE_URL}/vbbe/special/` },
	{ device: 'bem', series: 'Seekers', url: `${BASE_URL}/vbbe/seekers/` },
	{ device: 'bem', series: 'Anime', url: `${BASE_URL}/vbbe/anime/` },
	{ device: 'bem', series: 'Other', url: `${BASE_URL}/vbbe/other/` },
];
const DUB_NAMES = require('../public/json/dubnames.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'json', 'vb');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'digimon');
const LEVELS = ['baby', 'babyII', 'child', 'adult', 'perfect', 'ultimate', 'super'];
const DEVICE_SUFFIXES = { dim: 'dim', bem: 'be' };

const COLORS = {
	Red: 'fire',
	Green: 'grass',
	Forest: 'grass',
	Purple: 'fusion',
	Blue: 'x',
	Azure: 'marine',
	Navy: 'marine',
	Yellow: 'gold',
	Teal: 'slide',
	Indigo: 'dark',
	Violet: 'dark',
	Cyan: 'ice',
	Orange: 'mode',
	Brown: 'earth',
	Gray: 'machine',
	Pink: 'human',
};

const NAMES = {
	'Aero V-dramon': 'aeroveedramon',
	'Atlur Kabuterimon (Red)': 'megakabuterimon',
	'Big Ukkomon': 'big_ukkomon',
	'Black Tailmon Uver.': 'gatomon_buver',
	'Dukemon X': 'gallantmon_x',
	Fairimon: 'fairymon',
	'Karatsuki Numemon': 'karatukinumemon',
	'Marin Chimairamon': 'marinekimeramon',
	'Megalo Growmon (Orange)': 'wargrowlmon_orange',
	'Metabee (Head and Arm)': 'metabee',
	'Metal Greymon (2010)': 'metalgreymon_blue_2',
	'Rokusho (Head and Arm)': 'rokusho',
	'Shoutmon DX': 'shoutmon_dx',
	'Shoutmon X4': 'shoutmon_x4',
	'Shoutmon X7': 'shoutmon_x7',
	Susanoomon: 'susanomon',
	'Tailmon (Child)': 'gatomon_rookie',
	'Were Garurumon: Saggitarius Mode': 'weregarurumon_sagittarius_mode',
	'Agumon (2006)': 'agumon_2',
	Babydmon: 'babydramon',
	'Beelzebumon (2010)': 'beelzebumon_2',
	'Black War Greymon': 'black_wargreymon',
	'Cyberdramon (2010)': 'cyberdramon_2',
	Fladramon: 'flamedramon',
	'Gold V-dramon': 'goldveedramon',
	'Grappu Leomon': 'grapleomon',
	Lighdramon: 'raidramon',
	'Metal Greymon (Vaccine)': 'metalgreymon',
	'Metal Greymon (Virus)': 'metalgreymon_blue',
	'Neo Vamdemon': 'neomyotismon',
	'Omegamon Zwart': 'omegamon_zwart',
	'Ulforce V-dramon': 'ulforceveedramon',
	'V-dramon': 'veedramon',
	'V-mon': 'veemon',
	Vamdemon: 'myotismon',
	Wizarmon: 'wizardmon',
	'XV-mon': 'exveemon',
	"Z'd Garurumon": 'zeedgarurumon',
};

const clean = text => (text || '').replace(/\s+/g, ' ').trim();

const slugify = text =>
	clean(text)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '');

const imageExists = name => fs.existsSync(path.join(IMAGES_DIR, `${name}.jpg`));

const digimonName = title => {
	if (NAMES[title]) return NAMES[title];
	const [base, ...suffixes] = title.replace(/ X$/, ' (X)').split(/[:(]/);
	const name = [base.replace(/[^a-zA-Z0-9]/g, ''), ...suffixes.map(slugify)]
		.filter(Boolean)
		.join('_')
		.toLowerCase()
		.replace(/_20(06|10)$/, '_2');
	const candidates = [name, name.replace(/_x$/, 'x')];
	const found = candidates.find(imageExists) || candidates.find(candidate => DUB_NAMES[candidate]);
	if (!found) return name;
	return imageExists(found) ? found : DUB_NAMES[found];
};

const lineColor = element => {
	const className = Array.from(element.classList).find(name => /^line[A-Z]/.test(name));
	return className ? COLORS[className.slice(4)] : undefined;
};

const fetchPage = url =>
	execFileSync('curl', ['-sL', '--compressed', '-H', 'User-Agent: Mozilla/5.0', url], {
		encoding: 'utf-8',
		maxBuffer: 50 * 1024 * 1024,
	});

const parseChart = anchor => {
	const title = clean(anchor.querySelector('.rdisplay').textContent);
	const chart = anchor.querySelector('.chart');
	const chartId = chart.id;
	const levels = Array.from(chart.children)
		.filter(column => LEVELS.some(level => column.classList.contains(level)))
		.map(column =>
			Array.from(column.children)
				.filter(row => row.classList.contains('row') && row.querySelector('.digimon'))
				.map(row => {
					const digimon = row.querySelector('.digimon');
					const parents = [];
					const colors = {};
					row.querySelectorAll('[class*="_line"]').forEach(line => {
						line.classList.forEach(className => {
							if (
								className.startsWith(chartId + '_') &&
								className.endsWith('_line') &&
								!className.endsWith('_Req_line')
							) {
								const parent = className
									.slice(chartId.length + 1, -5)
									.replace(/Skip[A-Z0-9]*$/, '');
								if (!parents.includes(parent)) parents.push(parent);
								colors[parent] = colors[parent] || lineColor(line);
							}
						});
					});
					const lineOut = row.querySelector('[class*="_lineOut"]');
					const title = digimon.querySelector('img').getAttribute('title');
					return {
						key: row.id || digimon.id,
						title,
						name: digimonName(title),
						parents,
						colors,
						color: lineOut ? lineColor(lineOut) : undefined,
					};
				})
		);
	return { title, levels };
};

const toLine = ({ title, levels }) => {
	const width = Math.max(...levels.map(nodes => nodes.length));
	const positions = {};
	const byKey = {};
	levels.forEach((nodes, level) => {
		const offset = Math.floor((width - nodes.length) / 2);
		nodes.forEach((node, i) => {
			positions[node.key] = { lane: offset + i, level };
			byKey[node.key] = node;
		});
	});
	const columns = Array.from({ length: width }, () => Array(levels.length).fill(null));
	levels.forEach((nodes, level) => {
		const previous = levels[level - 1] || [];
		nodes.forEach((node, i) => {
			let parents = node.parents.filter(parent => positions[parent]);
			if (!parents.length && level > 0) {
				if (previous.length === nodes.length) parents = [previous[i].key];
				else if (previous.length === 1) parents = [previous[0].key];
			}
			const { lane } = positions[node.key];
			const point = { name: node.name };
			if (parents.length) {
				point.from = parents.map(parent => [
					positions[parent].lane - lane,
					positions[parent].level - level,
				]);
				const colors = parents.map(
					parent => node.colors[parent] || byKey[parent].color || 'default'
				);
				if (colors.some(color => color !== 'default')) point.color = colors;
			}
			columns[lane][level] = point;
		});
	});
	return { title, columns };
};

const stringify = value =>
	JSON.stringify(value, null, '\t').replace(/\[\s+(-?\d+),\s+(-?\d+)\s+\]/g, '[$1, $2]') + '\n';

const main = () => {
	const index = [];
	const missing = new Set();
	PAGES.forEach(({ device, series, url }) => {
		const { document } = new JSDOM(fetchPage(url)).window;
		document.querySelectorAll('#charts > .anchor').forEach(anchor => {
			const chart = parseChart(anchor);
			let name = slugify(chart.title);
			if (index.some(vb => vb.name === name)) name += '_' + DEVICE_SUFFIXES[device];
			fs.writeFileSync(path.join(OUTPUT_DIR, `${name}.json`), stringify(toLine(chart)));
			index.push({
				name,
				title: chart.title,
				digimon: (chart.levels[2] || chart.levels[0])[0].name,
				device,
				series,
			});
			chart.levels.flat().forEach(node => {
				if (!imageExists(node.name)) missing.add(`${node.name} (${node.title})`);
			});
			console.log(`${device} ${series} ${name}`);
		});
	});
	fs.writeFileSync(path.join(OUTPUT_DIR, '_index.json'), stringify(index));
	if (missing.size) console.warn('Missing images:', [...missing].join(', '));
};

main();
