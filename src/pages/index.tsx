import React, { useEffect, useState } from 'react';
import Router from 'next/router';
import { Row, Col, Spinner } from 'react-bootstrap';
import colors from '@/consts/colors';
import useFetch from '@/hooks/useFetch';
import Layout from '@/components/Layout';
import LinePoint from '@/components/Line/LinePoint';
import LineImage from '@/components/Line/LineImage';
import { GetStaticProps } from 'next';
import { LineThumb } from '@/types/Line';
import Line, { LineFound } from '@/types/Line';
import { filterlinesFound, foundLines, lineToArray } from '@/functions/transformer/line';
import SearchBar from '@/components/SearchBar';
import useQueryParam, { addQueryParam, removeQueryParam } from '@/hooks/useQueryParam';
import { stringToKey } from '@/functions';
import { StringArrayObject } from '@/types/Ui';
import { APPMON } from '@/consts/ui';

const SEARCH = 'search';
const defaultData = { lines: [], fusions: [], appmons: [], searchList: {} };
interface StaticProps {
	lines: LineThumb[];
	fusions: LineThumb[];
	appmons: LineThumb[];
	searchList: Record<string, string[]>;
}
interface Props {
	ssr: StaticProps;
}
const PageLines: React.FC<Props> = ({ ssr = defaultData }) => {
	const { search: searchParam } = useQueryParam(SEARCH) || ssr;
	const [lines, setLines] = useState<LineThumb[]>(ssr.lines);
	const [fusions, setFusions] = useState<LineThumb[]>(ssr.fusions);
	const [appmons, setAppmons] = useState<LineThumb[]>(ssr.appmons);
	const [load, loading] = useFetch(setLines);
	const [search, setSearch] = useState<string>(searchParam);
	const [loadFusions] = useFetch(setFusions);

	useEffect(() => {
		if (!lines.length) {
			load(`${process.env.URL}/json/lines/_index.json`);
			loadFusions(`${process.env.URL}/json/lines/_fusion.json`);
		}
	}, []);

	useEffect(() => {
		if (!search) {
			if (searchParam) {
				setLines(ssr.lines);
				setFusions(ssr.fusions);
				setAppmons(ssr.appmons);
				Router.push({ pathname: '/', query: null });
			}
		} else {
			const foundList: LineFound[] = foundLines(search, ssr.searchList);
			setLines(filterlinesFound(ssr.lines, foundList));
			setFusions(filterlinesFound(ssr.fusions, foundList));
			setAppmons(filterlinesFound(ssr.appmons, foundList));
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
			<SearchBar onSubmit={handleSearch} defaultValue={search} />
			{loading ? (
				<div className="text-center">
					<Spinner animation="border" />
				</div>
			) : (
				<>
					{lines.length > 0 && <LineRow lines={lines} />}
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
			)}
			{!lines.length && !fusions.length && <p>No line found.</p>}
		</Layout>
	);
};

const LineRow = ({ lines, type }: { lines: LineThumb[]; type?: string }) => (
	<div className="line-wrapper">
		<Row className="line-row">
			{lines.map((line, i) => (
				<Col key={i}>
					<LinePoint name={line.name} available={line.available} type={type}>
						{!!line.found && line.found.found != line.name && (
							<LineImage
								className="line-skin"
								name={line.found.found}
								title={line.found.found}
							/>
						)}
					</LinePoint>
				</Col>
			))}
		</Row>
	</div>
);

const checkLineAvailability = (
	value: string,
	searchList: StringArrayObject,
	type: string = 'lines'
): LineThumb => {
	try {
		let line: Line | undefined = require(`../../public/json/${type}/${value}.json`);
		if (!line) throw new Error(`line ${value} not found`);
		let lineArray = lineToArray(line);
		lineArray.forEach(digimon => {
			if (!searchList[digimon]) searchList[digimon] = [];
			searchList[digimon].push(value);
		});
		return { name: value, available: true } as LineThumb;
	} catch (e) {
		return { name: value, available: false } as LineThumb;
	}
};

export const getStaticProps: GetStaticProps = async () => {
	try {
		let lines = require('../../public/json/lines/_index.json');
		let fusions = require('../../public/json/lines/_fusion.json');
		let appmons = require('../../public/json/appmons/_index.json');

		const searchList: StringArrayObject = {};
		lines = lines.map((line: string) => checkLineAvailability(line, searchList));
		fusions = fusions.map((fusion: string) =>
			checkLineAvailability(fusion, searchList)
		);
		appmons = appmons.map((appmon: string) =>
			checkLineAvailability(appmon, searchList, 'appmons')
		);
		// TODO make a flat searchList for previews

		return { props: { ssr: { lines, fusions, appmons, searchList } } };
	} catch (e) {
		console.error(e);
		return { props: { ssr: defaultData } };
	}
};

export default PageLines;
