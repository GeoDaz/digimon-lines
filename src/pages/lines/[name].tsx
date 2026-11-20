// modules
import React, { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { GetStaticProps } from 'next';
// components
import Layout from '@/components/Layout';
import JsonLd from '@/components/JsonLd';
import LineNav from '@/components/Line/LineNav';
import CommentLink from '@/components/CommentLink';
import RelatedLines from '@/components/Line/RelatedLines';
import LineViewer from '@/components/Line/LineViewer';
import LineSummary from '@/components/Line/LineSummary';
// functions
import useQueryParam from '@/hooks/useQueryParam';
import { capitalize } from '@/functions';
import { flattenDigimonItems, getDigimonItemLevels } from '@/functions/items';
import transformLine, { lineToArray, thumbsToNames } from '@/functions/line';
import {
	breadcrumbJsonLd,
	graphJsonLd,
	itemListJsonLd,
	listUpTo,
	webPageJsonLd,
	withList,
} from '@/functions/seo';
import {
	buildLineSummary,
	getLineDigimonProps,
	resolveRelated,
} from '@/functions/lineSummary';
import type { LineSummary as Summary, SummaryLevel } from '@/functions/lineSummary';
// constants
import { Line, VbThumb } from '@/types/Line';
import { LINE, VB, titles } from '@/consts/ui';
import { IS_DEV } from '@/consts/env';
import { Digimon, DigimonItem } from '@/types/Digimon';
import { StringObject } from '@/types/Ui';
import Search from '@/types/Search';
import { getDubbedSearchList, getDubNames } from '@/functions/search';
import { getDirPaths } from '@/functions/file';

const NAME = 'name';
const defaultObject: any = {};
interface StaticProps {
	line?: Line;
	name?: string;
	image?: string;
	category?: string;
	next?: string | VbThumb;
	prev?: string | VbThumb;
	digimons?: {
		[key: string]: Digimon;
	};
	items?: {
		[key: string]: DigimonItem;
	};
	itemLevels?: StringObject;
	levels?: string[];
	dubNames?: StringObject;
	search?: Search;
	summary?: Summary;
}
interface Props {
	ssr: StaticProps;
	type: string;
}

interface DigimonData {
	digimons: { [key: string]: Digimon };
	items: { [key: string]: DigimonItem };
	itemLevels: StringObject;
}

const useFullDigimonData = (enabled: boolean) => {
	const [data, setData] = useState<DigimonData | null>(null);
	useEffect(() => {
		if (!enabled) return;
		let cancelled = false;
		Promise.all([
			fetch('/json/digimons/index.json').then(res => res.json()),
			fetch('/json/digimons/ranked.json').then(res => res.json()),
		])
			.then(([digimons, ranked]) => {
				if (cancelled) return;
				setData({
					digimons,
					items: flattenDigimonItems(ranked),
					itemLevels: getDigimonItemLevels(ranked),
				});
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [enabled]);
	return data;
};

const levelLabels = (level: SummaryLevel) => level.members.map(member => member.label);

const isBabyLevel = (level: SummaryLevel) => /^baby\b/i.test(level.level);

const describeLine = (summary: Summary, isVb: boolean, typeTitle: string) => {
	const levels = summary.levels.filter(level => !isBabyLevel(level));
	const count = levels.reduce((total, level) => total + level.members.length, 0);
	const first = levels[0];
	const last = levels[levels.length - 1];
	const aliasText = summary.aliases.length ? ` (${summary.aliases.join(', ')})` : '';
	const heading =
		isVb ? `${summary.title} ${typeTitle} evolutions` : `${summary.title} evolution line`;
	const metatitle =
		isVb ?
			`${summary.title} (${typeTitle}) evolution chart`
		:	`${summary.title} evolution line${aliasText}`;
	if (!first) return { heading, metatitle, intro: '', description: '' };
	const range =
		first === last ?
			`at the ${first.level} level`
		:	`from ${first.level} (${listUpTo(levelLabels(first), 50)}) to ${last.level} (${listUpTo(levelLabels(last), 50)})`;
	const hasGames = summary.levels.some(level => level.members.some(member => member.game));
	const intro = [
		isVb ?
			`The ${summary.title} ${typeTitle} features ${count} Digimon, ${range}.`
		:	`The ${summary.title} evolution line${aliasText} gathers ${count} Digimon of the same species, ${range}.`,
		summary.evolutions.length ?
			`It covers ${summary.evolutions.length} digivolution paths, detailed level by level below.`
		:	'',
		hasGames ?
			'Linked names lead to their evolutions, stats and skills in Digimon Story games.'
		:	'',
	]
		.filter(Boolean)
		.join(' ');
	const description = withList(
		`${heading}: ${count} Digimon from ${first.level} to ${last.level}, including `,
		levels.flatMap(levelLabels),
		'. Full digivolution chart.'
	);
	return { heading, metatitle, intro, description };
};

export const PageLine: React.FC<Props> = ({ ssr = defaultObject, type = LINE }) => {
	const { name } = useQueryParam(NAME) || ssr;
	const [line, setLine] = useState<Line | undefined>(ssr.line);
	const fullData = useFullDigimonData(!!ssr.digimons);

	useEffect(() => {
		if (line !== ssr.line) {
			setLine(ssr.line);
		}
	}, [ssr.line]);

	if (!name) {
		redirect('/lines');
	}
	const { next, prev, summary } = ssr;
	const nameCap = capitalize(name);
	const typeTitle = ssr.category || titles[type];
	const isVb = type === VB;
	const title = summary?.title || line?.title || nameCap;
	const texts = summary ? describeLine(summary, isVb, typeTitle) : null;
	const path = `/${type}/${name}`;
	const parent =
		isVb ? { name: 'Virtual Pets', path: '/vbs' } : { name: 'Evolution lines', path: '/lines' };
	const jsonLd =
		summary &&
		texts &&
		graphJsonLd(
			breadcrumbJsonLd([parent, { name: title, path }]),
			webPageJsonLd('CollectionPage', path, texts.metatitle, texts.description, {
				mainEntity: itemListJsonLd(summary.levels.flatMap(levelLabels)),
			})
		);
	const metadescription = texts?.description || `Evolution line for ${nameCap} species`;
	return (
		<Layout
			title={
				isVb ?
					<>
						{typeTitle} for {title}
					</>
				:	<>{title} evolution line</>
			}
			metatitle={texts?.metatitle || `${nameCap} ${typeTitle}`}
			metadescription={metadescription}
			metaimg={`digimon/${ssr.image || name}.jpg`}
		>
			{!!jsonLd && <JsonLd data={jsonLd} />}
			{line ?
				<>
					<LineViewer
						line={line}
						downloadName={ssr.line?.title || name}
						editName={name}
						editType={type}
						shareTitle={`${title} ${typeTitle}`}
						search={ssr.search}
						digimons={fullData?.digimons || ssr.digimons}
						items={fullData?.items || ssr.items}
						itemLevels={fullData?.itemLevels || ssr.itemLevels}
						levels={ssr.levels}
						dubNames={ssr.dubNames}
					/>
					<CommentLink />
				</>
			:	<p>Line not found</p>}
			<LineNav prev={prev} next={next} type={type} />
			<RelatedLines related={line?.related} />
			{!!line && !!summary && !!texts && (
				<LineSummary summary={summary} heading={texts.heading} intro={texts.intro} />
			)}
		</Layout>
	);
};

export async function getStaticPaths() {
	try {
		const lines = thumbsToNames(require('../../../public/json/lines/_index.json'));
		const fusions = thumbsToNames(require('../../../public/json/lines/_fusion.json'));

		const paths = [...lines, ...fusions].map(name => ({
			params: { name },
		}));

		return { paths, fallback: false };
	} catch {
		return { paths: [], fallback: true };
	}
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
	if (!params || !params.name) {
		return { notFound: true };
	}
	const name = params.name as string;
	let line: Line | null = null;
	try {
		line = transformLine(require(`../../../public/json/lines/${name}.json`)) || null;
	} catch (e) {
		console.error(e);
	}
	if (line) {
		line = { ...line, related: resolveRelated(line.related) || null } as Line;
	}

	const lines = thumbsToNames(require('../../../public/json/lines/_index.json'));
	const fusions = thumbsToNames(require('../../../public/json/lines/_fusion.json'));
	const names = lineToArray(line || undefined);
	const search: Search | null =
		IS_DEV ? getDubbedSearchList(getDirPaths('images/digimon'), getDubNames()) : null;

	let prev = null;
	let next = null;
	let list = lines;
	let index = lines.findIndex((item: string) => item == name);
	if (index < 0) {
		index = fusions.findIndex((item: string) => item == name);
		if (index > -1) {
			list = fusions;
		}
	}
	if (index > 0) {
		prev = list[index - 1];
	}
	if (index > -1 && index < list.length - 1) {
		next = list[index + 1];
	}

	return {
		props: {
			ssr: {
				name,
				line,
				prev,
				next,
				...getLineDigimonProps(names),
				search,
				summary: line ? buildLineSummary(line, name, line.title) : null,
			},
		},
	};
};

export default PageLine;
