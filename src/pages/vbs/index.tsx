import React, { useEffect } from 'react';
import fs from 'fs';
import { Row, Col, Spinner } from 'react-bootstrap';
import useFetch from '@/hooks/useFetch';
import Layout from '@/components/Layout';
import LinePoint from '@/components/Line/LinePoint';
import { GetStaticProps } from 'next';
import { LineThumb } from '@/types/Line';
import { VB } from '@/consts/ui';

const defaultData = { lines: [] };
interface StaticProps {
	lines: string[] | Array<LineThumb>;
}
interface Props {
	ssr: StaticProps;
}
const PageLines: React.FC<Props> = ({ ssr = defaultData }) => {
	const [lines, setLines] = React.useState<string[] | Array<LineThumb>>(ssr.lines);
	const [load, loading] = useFetch(setLines);

	useEffect(() => {
		if (!lines.length) {
			load(`${process.env.URL}/json/vb/_index.json`);
		}
	}, []);

	return (
		<Layout title="Available DIM" metadescription="List of available Digimon DIM">
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
									<LinePoint name={line} type={VB} />
								</Col>
							) : (
								<Col key={i}>
									<LinePoint
										name={line.name}
										available={line.available}
										type={VB}
									/>
								</Col>
							)
						)}
					</Row>
				</div>
			)}
		</Layout>
	);
};

const checkGroupAvailability = (line: string): LineThumb => {
	try {
		const available = fs.existsSync(`public/json/vb/${line}.json`);
		return { name: line, available } as LineThumb;
	} catch (e) {
		return { name: line, available: false } as LineThumb;
	}
};

export const getStaticProps: GetStaticProps = async () => {
	try {
		let lines = require('../../../public/json/vb/_index.json');
		lines = lines.map(checkGroupAvailability);

		return { props: { ssr: { lines } } };
	} catch (e) {
		console.error(e);
		return { props: { ssr: defaultData } };
	}
};

export default PageLines;
