// modules
import { GetStaticProps } from 'next';
// components
import { PageLine as PageVB } from '@/pages/lines/[name]';
import transformLine from '@/functions/line';
// constants
import { Line, VbThumb } from '@/types/Line';
import { VB } from '@/consts/ui';

export async function getStaticPaths() {
	try {
		const vbs: VbThumb[] = require('../../../public/json/vb/_index.json');
		const paths = vbs.map(({ name }) => ({ params: { name } }));

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
			transformLine(require(`../../../public/json/vb/${params.name}.json`)) || null;
	} catch (e) {
		console.error(e);
	}

	const list: VbThumb[] = require('../../../public/json/vb/_index.json');

	const index = list.findIndex(vb => vb.name == params.name);
	const prev = index > 0 ? list[index - 1] : null;
	const next = index > -1 && index < list.length - 1 ? list[index + 1] : null;
	const image = list[index]?.digimon || null;

	return { props: { ssr: { name: params.name, line, image, prev, next }, type: VB } };
};

export default PageVB;
