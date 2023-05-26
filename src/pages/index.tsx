import React, { useEffect } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import colors from '@/consts/colors';
import useFetch from '@/hooks/useFetch';
import Layout from '@/components/Layout';
import PointImage from '@/components/LinePoint';
import { GetStaticProps } from 'next';
import { DEV } from '@/consts/env';

// TODO rename this page lines.tsx when there will be a home

const defaultData = { lines: [], fusions: [] };
interface StaticProps {
	lines: string[];
	fusions: string[];
}
interface Props {
	ssr: StaticProps;
}
const PageLines: React.FC<Props> = ({ ssr = defaultData }) => {
	const [lines, setLines] = React.useState<string[]>(ssr.lines);
	const [fusions, setFusions] = React.useState<string[]>(ssr.fusions);
	const [load, loading] = useFetch(setLines);
	const [loadFusions] = useFetch(setFusions);

	useEffect(() => {
		if (!lines.length) {
			load(`${process.env.URL}/json/lines/_index.json`);
			loadFusions(`${process.env.URL}/json/lines/_fusion.json`);
		}
	}, []);

	return (
		<Layout title="Available lines">
			{loading ? (
				<div className="text-center">
					<Spinner animation="border" />
				</div>
			) : (
				<div className="line-wrapper">
					<Row className="line-row">
						{lines.map((name, i) => (
							<Col key={i}>
								<PointImage name={name} />
							</Col>
						))}
					</Row>
				</div>
			)}
			{fusions.length > 0 && (
				<div>
					<h2 style={{ color: colors.fusion }}>Fusions&nbsp;:</h2>
					<div className="line-wrapper">
						<Row className="line-row">
							{fusions.map((name, i) => (
								<Col key={i}>
									<PointImage name={name} />
								</Col>
							))}
						</Row>
					</div>
				</div>
			)}
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	try {
		const lines = require('../../public/json/lines/_index.json');
		const fusions = require('../../public/json/lines/_fusion.json');

		return { props: { ssr: { lines, fusions } } };
	} catch (e) {
		if (process.env.NODE_ENV === DEV) {
			console.error(e);
		}
		return { props: { ssr: defaultData } };
	}
};

export default PageLines;
