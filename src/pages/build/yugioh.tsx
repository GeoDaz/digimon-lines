import fs from 'fs';
import path from 'path';
import { GetStaticProps } from 'next';
import { PageBuild } from '.';
import { licences } from '@/context/license';
import Search from '@/types/Search';
import Line from '@/types/Line';
import { StringObject } from '@/types/Ui';

const LEVELS = ['Deck', 'Hand', 'Field', 'Grave', 'Banished'];

const defaultLine: Line = {
	size: LEVELS.length,
	levels: LEVELS,
	columns: Array.from({ length: 6 }, () => LEVELS.map(() => null)),
};

export const getStaticProps: GetStaticProps = async () => {
	const context = licences.yugioh;
	const file = path.join(process.cwd(), 'public', 'json', 'ygo', 'cards.json');
	const rows: Array<[string, string, string, 1?]> = JSON.parse(fs.readFileSync(file, 'utf-8'));
	const names = Array.from(new Set(rows.filter(row => !row[3]).map(row => row[1])));
	const search: Search = {
		mapped: names.reduce((acc, name) => {
			acc[name] = name;
			return acc;
		}, {} as StringObject),
		values: names.slice(),
		keys: names.slice(),
	};
	return { props: { search, context, defaultLine } };
};

export default PageBuild;
