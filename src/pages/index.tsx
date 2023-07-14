import React, { useEffect } from 'react';
import fs from 'fs';
import { Row, Col, Spinner } from 'react-bootstrap';
import colors from '@/consts/colors';
import useFetch from '@/hooks/useFetch';
import Layout from '@/components/Layout';
import PointImage from '@/components/LinePoint';
import { GetStaticProps } from 'next';
import { DEV } from '@/consts/env';
import Thumbnail from '@/types/Thumbnail';

// TODO rename this page lines.tsx when there will be a home

const defaultData = { lines: [], fusions: [] };
interface StaticProps {
	lines: string[] | Array<Thumbnail>;
	fusions: string[] | Array<Thumbnail>;
}
interface Props {
	ssr: StaticProps;
}
const PageLines: React.FC<Props> = ({ ssr = defaultData }) => {
	const [lines, setLines] = React.useState<string[] | Array<Thumbnail>>(ssr.lines);
	const [fusions, setFusions] = React.useState<string[] | Array<Thumbnail>>(
		ssr.fusions
	);
	const [load, loading] = useFetch(setLines);
	const [loadFusions] = useFetch(setFusions);

	useEffect(() => {
		if (!lines.length) {
			load(`${process.env.URL}/json/lines/_index.json`);
			loadFusions(`${process.env.URL}/json/lines/_fusion.json`);
		}
	}, []);

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
			{loading ? (
				<div className="text-center">
					<Spinner animation="border" />
				</div>
			) : (
				<div className="line-wrapper">
					<Row className="line-row">
						{lines.map((line, i) =>
							typeof line === 'string' ? (
								<Col key={i}>
									<PointImage name={line} />
								</Col>
							) : (
								<Col key={i}>
									<PointImage
										name={line.name}
										available={line.available}
									/>
								</Col>
							)
						)}
					</Row>
				</div>
			)}
			{fusions.length > 0 && (
				<div>
					<h2 style={{ color: colors.fusion }}>Fusions&nbsp;:</h2>
					<div className="line-wrapper">
						<Row className="line-row">
							{fusions.map((line, i) =>
								typeof line === 'string' ? (
									<Col key={i}>
										<PointImage name={line} />
									</Col>
								) : (
									<Col key={i}>
										<PointImage
											name={line.name}
											available={line.available}
										/>
									</Col>
								)
							)}
						</Row>
					</div>
				</div>
			)}
		</Layout>
	);
};

const checkLineAvailability = (line: string): Thumbnail => {
	try {
		const available = fs.existsSync(`public/json/lines/${line}.json`);
		return { name: line, available } as Thumbnail;
	} catch (e) {
		return { name: line, available: false } as Thumbnail;
	}
};

export const getStaticProps: GetStaticProps = async () => {
	try {
		let lines = require('../../public/json/lines/_index.json');
		let fusions = require('../../public/json/lines/_fusion.json');

		lines = lines.map(checkLineAvailability);
		fusions = fusions.map(checkLineAvailability);

		return { props: { ssr: { lines, fusions } } };
	} catch (e) {
		if (process.env.NODE_ENV === DEV) {
			console.error(e);
		}
		return { props: { ssr: defaultData } };
	}
};

export default PageLines;
