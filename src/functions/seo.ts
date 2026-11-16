import { SITE_URL } from '@/consts/env';

export const WEBSITE_ID = `${SITE_URL}/#website`;
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export interface Crumb {
	name: string;
	path: string;
}

export const absoluteUrl = (path: string) => `${SITE_URL}${path === '/' ? '/' : path}`;

export const breadcrumbJsonLd = (crumbs: Crumb[]) => ({
	'@type': 'BreadcrumbList',
	itemListElement: [{ name: 'Digimon Lines', path: '/' }, ...crumbs].map((crumb, i) => ({
		'@type': 'ListItem',
		position: i + 1,
		name: crumb.name,
		item: absoluteUrl(crumb.path),
	})),
});

export const webPageJsonLd = (
	type: string,
	path: string,
	name: string,
	description?: string,
	extra: object = {}
) => ({
	'@type': type,
	'@id': `${absoluteUrl(path)}#page`,
	url: absoluteUrl(path),
	name,
	...(description && { description }),
	inLanguage: 'en',
	isPartOf: { '@id': WEBSITE_ID },
	...extra,
});

export const itemListJsonLd = (names: string[], max = 100) => ({
	'@type': 'ItemList',
	numberOfItems: names.length,
	itemListElement: names.slice(0, max).map((name, i) => ({
		'@type': 'ListItem',
		position: i + 1,
		name,
	})),
});

export const graphJsonLd = (...nodes: object[]) => ({
	'@context': 'https://schema.org',
	'@graph': nodes,
});

export const listNames = (names: string[]) =>
	names.length < 2 ?
		names.join('')
	:	`${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

export const fitText = (text: string, max = 160) =>
	text.length <= max ? text : `${text.slice(0, max - 1).replace(/[\s,;:]+\S*$/, '')}…`;

export const withList = (prefix: string, names: string[], suffix: string, max = 160) =>
	fitText(
		`${prefix}${listUpTo(names, Math.max(20, max - prefix.length - suffix.length - 14))}${suffix}`,
		max
	);

export const fitSentences = (sentences: Array<string | false | null | undefined>, max = 160) =>
	(sentences.filter(Boolean) as string[]).reduce(
		(text, sentence) =>
			!text ? fitText(sentence, max)
			: `${text} ${sentence}`.length <= max ? `${text} ${sentence}`
			: text,
		''
	);

export const listUpTo = (names: string[], max: number) => {
	const result: string[] = [];
	for (const name of names) {
		if (result.length && [...result, name].join(', ').length > max) break;
		result.push(name);
	}
	const rest = names.length - result.length;
	return rest > 0 ? `${result.join(', ')} and ${rest} more` : listNames(result);
};
