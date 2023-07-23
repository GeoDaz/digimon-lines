import React, { useEffect, useState } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import colors from '@/consts/colors';
import useFetch from '@/hooks/useFetch';
import Layout from '@/components/Layout';
import PointImage, { LineImage } from '@/components/LinePoint';
import { GetStaticProps } from 'next';
import { DEV } from '@/consts/env';
import { LineThumb } from '@/types/Line';
import Line, { LineFound } from '@/types/Line';
import { filterlinesFound, foundLines, lineToArray } from '@/functions/transformer/line';
import SearchBar from '@/components/SearchBar';

// TODO rename this page lines.tsx when there will be a home

const defaultData = { lines: [], fusions: [], searchList: {} };
interface StaticProps {
	lines: LineThumb[];
	fusions: LineThumb[];
	searchList: { [key: string]: string[] };
}
interface Props {
	ssr: StaticProps;
}
const PageLines: React.FC<Props> = ({ ssr = defaultData }) => {
	const [lines, setLines] = useState<LineThumb[]>(ssr.lines);
	const [fusions, setFusions] = useState<LineThumb[]>(ssr.fusions);
	const [load, loading] = useFetch(setLines);
	const [search, setSearch] = useState<string>();
	const [loadFusions] = useFetch(setFusions);

	useEffect(() => {
		if (!lines.length) {
			load(`${process.env.URL}/json/lines/_index.json`);
			loadFusions(`${process.env.URL}/json/lines/_fusion.json`);
		}
	}, []);

	const handleSearch = (value: string) => {
		// To do lower case, remove spaces
		const sanitizedSearch = value.toLowerCase().replace(/\s/g, '');
		if (sanitizedSearch == search) return;
		setSearch(sanitizedSearch);
		if (!sanitizedSearch) {
			setLines(ssr.lines);
			setFusions(ssr.fusions);
			return;
		}
		const foundList: LineFound[] = foundLines(sanitizedSearch, ssr.searchList);
		setLines(filterlinesFound(ssr.lines, foundList));
		setFusions(filterlinesFound(ssr.fusions, foundList));
	};

	return (
		<Layout
			noGoBack
			title="Available lines"
			metadescription="The aim of this site is to present evolutionary lines designed to group together members of the same species."
		>
			<blockquote className="blockquote">
				The aim of this site is to present evolutionary lines designed to group
				together members of the same species.
			</blockquote>
			<SearchBar onSubmit={handleSearch} />
			{loading ? (
				<div className="text-center">
					<Spinner animation="border" />
				</div>
			) : (
				<LineRow lines={lines} />
			)}
			{fusions.length > 0 && (
				<div>
					<h2 style={{ color: colors.fusion }}>Fusions&nbsp;:</h2>
					<LineRow lines={fusions} />
				</div>
			)}
		</Layout>
	);
};

const LineRow = ({ lines }: { lines: LineThumb[] }) => (
	<div className="line-wrapper">
		<Row className="line-row">
			{lines.map((line, i) => (
				<Col key={i}>
					<PointImage name={line.name} available={line.available}>
						{!!line.found && line.found.found != line.name && (
							<LineImage
								className="line-skin"
								name={line.found.found}
								title={line.found.found}
							/>
						)}
					</PointImage>
				</Col>
			))}
		</Row>
	</div>
);

const checkLineAvailability = (
	value: string,
	searchList: { [key: string]: string[] }
): LineThumb => {
	try {
		let line: Line | undefined = require(`../../public/json/lines/${value}.json`);
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

		const searchList: { [key: string]: string[] } = {};
		lines = lines.map((line: string) => checkLineAvailability(line, searchList));
		fusions = fusions.map((fusion: string) =>
			checkLineAvailability(fusion, searchList)
		);

		return { props: { ssr: { lines, fusions, searchList } } };
	} catch (e) {
		if (process.env.NODE_ENV === DEV) {
			console.error(e);
		}
		return { props: { ssr: defaultData } };
	}
};

export default PageLines;
