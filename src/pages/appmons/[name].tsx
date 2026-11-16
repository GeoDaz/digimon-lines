// modules
import { GetStaticProps } from 'next';
// components
import { PageLine as PageAppmon } from '@/pages/lines/[name]';
import transformLine, { thumbsToNames } from '@/functions/line';
import { buildLineSummary, resolveRelated } from '@/functions/lineSummary';
// constants
import { Line } from '@/types/Line';
import { APPMON } from '@/consts/ui';

export async function getStaticPaths() {
	try {
		const appmons: string[] = thumbsToNames(
			require('../../../public/json/appmons/_index.json')
		);
		const paths = appmons.map(name => ({ params: { name } }));

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
			transformLine(require(`../../../public/json/appmons/${params.name}.json`)) ||
			null;
	} catch (e) {
		console.error(e);
	}

	const lines = thumbsToNames(require('../../../public/json/appmons/_index.json'));

	let prev = null;
	let next = null;
	let list = lines;
	let index = lines.findIndex((name: string) => name == params.name);
	if (index > 0) {
		prev = list[index - 1];
	}
	if (index > -1 && index < list.length - 1) {
		next = list[index + 1];
	}

	if (line) {
		line = { ...line, related: resolveRelated(line.related) || null } as Line;
	}
	const summary = line ? buildLineSummary(line, params.name as string, line.title) : null;

	return { props: { ssr: { name: params.name, line, prev, next, summary }, type: APPMON } };
};

export default PageAppmon;
