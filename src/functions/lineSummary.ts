import { capitalize } from '@/functions';
import { flattenDigimonItems, getDigimonItemLevels } from '@/functions/items';
import { lineToArray, thumbsToNames } from '@/functions/line';
import { getDubNamesFor } from '@/functions/search';
import { levels as defaultLevels } from '@/consts/levels';
import { digimonGames } from '@/consts/games';
import { Line, LineRelation } from '@/types/Line';
import { Digimon, DigimonItem } from '@/types/Digimon';
import { GameDigimon } from '@/types/GameDigimon';
import { Group, GroupPoint } from '@/types/Group';
import { StringObject } from '@/types/Ui';

export interface SummaryGameLink {
	key: string;
	slug: string;
	title: string;
}

export interface SummaryMember {
	name: string;
	label: string;
	game: SummaryGameLink | null;
}

export interface SummaryLevel {
	level: string;
	members: SummaryMember[];
}

export interface SummaryEvolution {
	label: string;
	to: string[];
}

export interface LineSummary {
	title: string;
	aliases: string[];
	count: number;
	levels: SummaryLevel[];
	evolutions: SummaryEvolution[];
}

type DigimonIndex = { [name: string]: Digimon };
type ItemIndex = { [name: string]: DigimonItem };

let digimonIndex: DigimonIndex | undefined;
let itemIndex: ItemIndex | undefined;
let itemLevelIndex: StringObject | undefined;
let gameIndex: { [name: string]: SummaryGameLink } | undefined;
let gameNames: StringObject | undefined;
let lineByDigimon: StringObject | undefined;

export const getDigimonIndex = (): DigimonIndex =>
	(digimonIndex ??= require('../../public/json/digimons/index.json'));

const getRanked = () => require('../../public/json/digimons/ranked.json');

export const getItemIndex = (): ItemIndex => (itemIndex ??= flattenDigimonItems(getRanked()));

export const getItemLevelIndex = (): StringObject =>
	(itemLevelIndex ??= getDigimonItemLevels(getRanked()));

export const getRankedLevels = (): string[] => Object.keys(getRanked());

const getGameIndex = () => {
	if (gameIndex && gameNames) return { gameIndex, gameNames };
	gameIndex = {};
	gameNames = {};
	for (const game of Object.values(digimonGames)) {
		const digimons: GameDigimon[] = require(
			`../../public/json/games/${game.key}/digimons.json`
		);
		for (const digimon of digimons) {
			const link = { key: game.key, slug: digimon.slug, title: game.shortTitle };
			const slugKey = digimon.slug.replace(/-/g, '_');
			gameNames[slugKey] ??= digimon.name;
			gameIndex[slugKey] ??= link;
			if (digimon.image) gameIndex[digimon.image] ??= link;
		}
	}
	return { gameIndex, gameNames };
};

export const digimonLabel = (name: string): string => {
	const url = getDigimonIndex()[name]?.url;
	if (url && /wikimon\.net\//.test(url)) {
		try {
			const title = decodeURIComponent(url.split('/').pop() || '').replace(/_/g, ' ');
			if (title) return title;
		} catch {}
	}
	return getGameIndex().gameNames[name] || capitalize(name);
};

const dubLabel = (name: string): string | null => {
	const dubNames: StringObject = require('../../public/json/dubnames.json');
	const dub = dubNames[name];
	if (!dub) return null;
	return getGameIndex().gameNames[dub] || capitalize(dub);
};

export const getLineByDigimon = (): StringObject => {
	if (lineByDigimon) return lineByDigimon;
	const result: StringObject = {};
	const lines = [
		...thumbsToNames(require('../../public/json/lines/_index.json')),
		...thumbsToNames(require('../../public/json/lines/_fusion.json')),
	];
	for (const line of lines) {
		try {
			lineToArray(require(`../../public/json/lines/${line}.json`)).forEach(
				name => (result[name] ??= line)
			);
		} catch (e) {
			console.error(e);
		}
	}
	lines.forEach(line => (result[line] = line));
	lineByDigimon = result;
	return result;
};

const relationTypes = (name: string) => (name.startsWith('app_') ? 'appmons' : 'lines');

export const resolveRelated = (
	related: Line['related']
): Array<string | LineRelation> | undefined => {
	if (!related) return related;
	const redirects: StringObject = require('../../redirects.json');
	const appmons = new Set(thumbsToNames(require('../../public/json/appmons/_index.json')));
	const lines = getLineByDigimon();
	const exists = (type: string, name: string) =>
		type === 'appmons' ? appmons.has(name)
		: type === 'lines' ? lines[name] === name || !!redirects[name]
		: true;
	return related.reduce(
		(acc, relation) => {
			const item = typeof relation === 'string' ? { name: relation } : relation;
			const type = item.type || relationTypes(item.name);
			if (exists(type, item.name)) {
				acc.push(relation);
				return acc;
			}
			const target = type === 'lines' ? lines[item.name] : undefined;
			if (target && !acc.some(r => (typeof r === 'string' ? r : r.name) === target)) {
				acc.push({ ...item, name: target, for: item.for || item.name });
			}
			return acc;
		},
		[] as Array<string | LineRelation>
	);
};

const resolveGroupPoint = (point: GroupPoint | null): GroupPoint | null => {
	if (!point) return point;
	const redirects: StringObject = require('../../redirects.json');
	const lines = getLineByDigimon();
	const target = point.redirect || point.line || point.name;
	if (lines[target] === target || redirects[target]) return point;
	const resolved = lines[point.name] || (point.line && lines[point.line]);
	return resolved ? { ...point, redirect: resolved } : { ...point, available: false };
};

export const resolveGroup = (group: Group): Group => ({
	...group,
	main:
		Array.isArray(group.main) ?
			group.main.map(point => resolveGroupPoint(point) as GroupPoint)
		:	Object.fromEntries(
				Object.entries(group.main).map(([key, points]) => [
					key,
					points.map(resolveGroupPoint),
				])
			),
	...(group.related && {
		related: group.related.map(point => resolveGroupPoint(point) as GroupPoint),
	}),
});

const relationNames = (item?: DigimonItem): string[] =>
	item ?
		[
			...(item.variants || []),
			...(item.modes || []),
			...(item.x || []),
			...(item.armors || []),
			...(item.from || []),
			...(item.fusionFrom || []),
			...(item.to || []),
		]
	:	[];

export const getLineDigimonProps = (names: string[]) => {
	const digimons = getDigimonIndex();
	const items = getItemIndex();
	const itemLevels = getItemLevelIndex();
	const scope = new Set(names);
	names.forEach(name => relationNames(items[name]).forEach(n => scope.add(n)));
	const pick = <T>(source: { [name: string]: T }) =>
		Object.fromEntries(Array.from(scope).filter(name => source[name]).map(n => [n, source[n]]));
	const dubNames: StringObject = getDubNamesFor(names);
	return {
		digimons: pick(digimons),
		items: pick(items),
		itemLevels: pick(itemLevels),
		levels: getRankedLevels(),
		dubNames: Object.fromEntries(
			Object.entries(dubNames).filter(([key, value]) => scope.has(key) || scope.has(value))
		),
	};
};

const levelLabel = (level: string) =>
	level
		.split(' ')
		.map(word => (/^[ivx]+$/i.test(word) ? word.toUpperCase() : capitalize(word)))
		.join(' ');

export const buildLineSummary = (
	line: Line,
	name: string,
	title?: string | null
): LineSummary => {
	const { gameIndex } = getGameIndex();
	const items = getItemIndex();
	const redirects: StringObject = require('../../redirects.json');
	const lineLevels = line.levels || defaultLevels;
	const depth = Math.max(lineLevels.length, ...line.columns.map(row => row.length));
	const levelNames: string[] = [];
	for (let i = 0; i < depth; i++) {
		levelNames[i] = lineLevels[i] ? levelLabel(lineLevels[i]) : levelNames[i - 1] || 'Other';
	}
	const seen = new Set<string>();
	const levels: SummaryLevel[] = [];
	for (let i = 0; i < depth; i++) {
		const members: SummaryMember[] = [];
		line.columns.forEach(row => {
			const point = row[i];
			if (!point?.name || seen.has(point.name)) return;
			seen.add(point.name);
			const dub = dubLabel(point.name);
			const label = digimonLabel(point.name);
			members.push({
				name: point.name,
				label:
					dub && !label.includes('(') && dub.toLowerCase() !== label.toLowerCase() ?
						`${label} (${dub})`
					:	label,
				game: gameIndex[point.name] || null,
			});
		});
		if (!members.length) continue;
		const existing = levels.find(item => item.level === levelNames[i]);
		if (existing) existing.members.push(...members);
		else levels.push({ level: levelNames[i], members });
	}
	const labels: StringObject = Object.fromEntries(
		levels.flatMap(level => level.members.map(m => [m.name, m.label]))
	);
	const evolutions = Object.keys(labels)
		.map(member => ({
			label: labels[member],
			to: Array.from(new Set(items[member]?.to || []))
				.filter(to => labels[to] && to !== member)
				.map(to => labels[to]),
		}))
		.filter(evolution => evolution.to.length);
	const aliases = Object.entries(redirects)
		.filter(([from, to]) => to === name && from !== name)
		.map(([from]) => digimonLabel(from));
	return {
		title: title || (getDigimonIndex()[name] ? digimonLabel(name) : capitalize(name)),
		aliases,
		count: seen.size,
		levels,
		evolutions,
	};
};
