// modules
import React, { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { GetStaticProps } from 'next';
// components
import Layout from '@/components/Layout';
import LineNav from '@/components/Line/LineNav';
import CommentLink from '@/components/CommentLink';
import RelatedLines from '@/components/Line/RelatedLines';
import LineViewer from '@/components/Line/LineViewer';
// functions
import useQueryParam from '@/hooks/useQueryParam';
import { capitalize } from '@/functions';
import { flattenDigimonItems, getDigimonItemLevels } from '@/functions/items';
import transformLine, { thumbsToNames } from '@/functions/line';
// constants
import { Line } from '@/types/Line';
import { LINE, titles } from '@/consts/ui';
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
	next?: string;
	prev?: string;
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
}
interface Props {
	ssr: StaticProps;
	type: string;
}
export const PageLine: React.FC<Props> = ({ ssr = defaultObject, type = LINE }) => {
	const { name } = useQueryParam(NAME) || ssr;
	const [line, setLine] = useState<Line | undefined>(ssr.line);

	useEffect(() => {
		if (line !== ssr.line) {
			setLine(ssr.line);
		}
	}, [ssr.line]);

	if (!name) {
		redirect('/');
	}
	const { next, prev } = ssr;
	const nameCap = capitalize(name);
	const typeTitle = titles[type];
	return (
		<Layout
			title={
				<>
					{typeTitle} for {line?.title || nameCap}
				</>
			}
			metatitle={nameCap + ' ' + typeTitle}
			metadescription={`Evolution line for ${nameCap} species`}
			metaimg={`digimon/${name}.jpg`}
		>
			{line ?
				<>
					<LineViewer
						line={line}
						downloadName={ssr.line?.title || name}
						editName={name}
						shareTitle={`${line.title || nameCap} ${typeTitle}`}
						shareText={`Evolution line for ${nameCap} species`}
						search={ssr.search}
						digimons={ssr.digimons}
						items={ssr.items}
						itemLevels={ssr.itemLevels}
						levels={ssr.levels}
						dubNames={ssr.dubNames}
					/>
					<CommentLink />
				</>
			:	<p>Line not found</p>}
			<LineNav prev={prev} next={next} type={type} />
			<RelatedLines related={line?.related} />
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
	let line: Line | null = null;
	try {
		line =
			transformLine(require(`../../../public/json/lines/${params.name}.json`)) ||
			null;
	} catch (e) {
		console.error(e);
	}

	const lines = thumbsToNames(require('../../../public/json/lines/_index.json'));
	const fusions = thumbsToNames(require('../../../public/json/lines/_fusion.json'));
	const digimons: {
		[key: string]: Digimon;
	} = require('../../../public/json/digimons/index.json');
	const ranked = require('../../../public/json/digimons/ranked.json');
	const items = flattenDigimonItems(ranked);
	const itemLevels = getDigimonItemLevels(ranked);
	const levels = Object.keys(ranked);
	const dubNames: StringObject = getDubNames();
	const search: Search = getDubbedSearchList(getDirPaths('images/digimon'), dubNames);

	let prev = null;
	let next = null;
	let list = lines;
	let index = lines.findIndex((name: string) => name == params.name);
	if (index < 0) {
		index = fusions.findIndex((name: string) => name == params.name);
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
				name: params.name,
				line,
				prev,
				next,
				digimons,
				items,
				itemLevels,
				levels,
				dubNames,
				search,
			},
		},
	};
};

export default PageLine;
