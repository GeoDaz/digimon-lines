import React, { useEffect, useState } from 'react';
import Router from 'next/router';
import { Row, Col } from 'react-bootstrap';
import colors from '@/consts/colors';
import Layout from '@/components/Layout';
import LinePoint from '@/components/Line/LinePoint';
import LineImage from '@/components/Line/LineImage';
import { GetStaticProps } from 'next';
import { LineThumb } from '@/types/Line';
import Line, { LineFound } from '@/types/Line';
import { filterlinesFound, foundLines, lineToArray } from '@/functions/line';
import SearchBar from '@/components/SearchBar';
import useQueryParam from '@/hooks/useQueryParam';
import { stringToKey } from '@/functions';
import { StringArrayObject } from '@/types/Ui';
import { APPMON } from '@/consts/ui';

const SEARCH = 'search';
const defaultData = {
	lines: [],
	news: [],
	list: [],
	fusions: [],
	appmons: [],
	searchList: {},
};
interface Props {
	lines: LineThumb[];
	news: LineThumb[];
	list: LineThumb[];
	fusions: LineThumb[];
	appmons: LineThumb[];
	searchList: Record<string, string[]>;
}
const PageLines: React.FC<Props> = props => {
	const { search: searchParam } = useQueryParam(SEARCH) || props;
	const [news, setNews] = useState<LineThumb[]>(props.news);
	const [list, setList] = useState<LineThumb[]>(props.list);
	const [fusions, setFusions] = useState<LineThumb[]>(props.fusions);
	const [appmons, setAppmons] = useState<LineThumb[]>(props.appmons);
	const [search, setSearch] = useState<string>(searchParam);

	useEffect(() => {
		if (!search) {
			if (searchParam) {
				setNews(props.news);
				setList(props.list);
				setFusions(props.fusions);
				setAppmons(props.appmons);
				Router.push({ pathname: '/', query: null });
			}
		} else {
			const foundList: LineFound[] = foundLines(search, props.searchList);
			setNews([]);
			setList(filterlinesFound(props.list, foundList));
			setFusions(filterlinesFound(props.fusions, foundList));
			setAppmons(filterlinesFound(props.appmons, foundList));
			if (search != searchParam) {
				Router.push({ pathname: '/', query: { search } });
			}
		}
	}, [search]);

	useEffect(() => {
		if (searchParam != search) {
			setSearch(searchParam);
		}
	}, [searchParam]);

	const handleSearch = (value: string) => {
		let sanitizedSearch = stringToKey(value);
		if (sanitizedSearch == search) return;
		if (sanitizedSearch.length < 3) {
			sanitizedSearch = '';
		}
		setSearch(sanitizedSearch);
	};

	return (
		<Layout
			noGoBack
			title="Available lines"
			metadescription="The aim of this site is to present evolutionary lines designed to bring together members of the same species."
		>
			<blockquote className="blockquote">
				The aim of this site is to present evolutionary lines designed to bring
				together members of the same species.
			</blockquote>
			<SearchBar
				label="Research a digimon"
				onSubmit={handleSearch}
				defaultValue={search}
				width={300}
			/>
			<>
				{news.length > 0 && (
					<div>
						<h2>News&nbsp;:</h2>
						<LineRow lines={news} />
						<h2>List&nbsp;:</h2>
					</div>
				)}
				{list.length > 0 && <LineRow lines={list} />}
				{fusions.length > 0 && (
					<div>
						<h2 style={{ color: colors.fusion }}>Fusions&nbsp;:</h2>
						<LineRow lines={fusions} />
					</div>
				)}
				{appmons.length > 0 && (
					<div>
						<h2>Appmons&nbsp;:</h2>
						<LineRow lines={appmons} type={APPMON} />
					</div>
				)}
			</>
		</Layout>
	);
};

const LineRow = ({ lines, type }: { lines: LineThumb[]; type?: string }) => (
	<div className="line-wrapper">
		<Row className="line-row">
			{lines.map((line, i) => (
				<Col key={i}>
					<LinePoint name={line.name} available={line.available} type={type}>
						{!!line.for && line.for != line.name && (
							<LineImage
								className="line-skin"
								name={line.for}
								loadable={false}
							/>
						)}
					</LinePoint>
				</Col>
			))}
		</Row>
	</div>
);

const checkLineAvailability = (
	item: string | LineThumb,
	searchList?: StringArrayObject,
	type: string = 'lines'
): LineThumb => {
	let name: string;
	if (typeof item === 'string') {
		name = item;
		item = { name: item } as LineThumb;
	} else {
		name = item.name;
	}
	try {
		const line: Line | undefined = require(`../../public/json/${type}/${name}.json`);
		if (!line) throw new Error(`line ${name} not found`);
		const lineArray = lineToArray(line);
		if (searchList) {
			lineArray.forEach(digimon => {
				if (!searchList[digimon]) searchList[digimon] = [];
				searchList[digimon].push(name);
			});
		}
		return { ...item, available: true } as LineThumb;
	} catch (e) {
		return { ...item, available: false } as LineThumb;
	}
};

export const getStaticProps: GetStaticProps = async () => {
	try {
		let lines = require('../../public/json/lines/_index.json');
		let news = require('../../public/json/lines/_news.json');
		let list = require('../../public/json/lines/_list.json');
		let fusions = require('../../public/json/lines/_fusion.json');
		let appmons = require('../../public/json/appmons/_index.json');

		const searchList: StringArrayObject = {};
		lines.forEach((line: string) => checkLineAvailability(line, searchList));
		news = news.map((line: string) => checkLineAvailability(line));
		list = list.map((line: string) => checkLineAvailability(line));
		fusions = fusions.map((fusion: string) =>
			checkLineAvailability(fusion, searchList)
		);
		appmons = appmons.map((appmon: string) =>
			checkLineAvailability(appmon, searchList, 'appmons')
		);

		return {
			props: { news, list, fusions, appmons, searchList },
		};
	} catch (e) {
		console.error(e);
		return { props: { defaultData } };
	}
};

export default PageLines;
