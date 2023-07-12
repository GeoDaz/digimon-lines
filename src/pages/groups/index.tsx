import React, { useEffect } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import useFetch from '@/hooks/useFetch';
import Layout from '@/components/Layout';
import PointImage from '@/components/LinePoint';
import { GetStaticProps } from 'next';
import { DEV } from '@/consts/env';

// TODO rename this page groups.tsx when there will be a home

const defaultData = { groups: [], fusions: [] };
interface StaticProps {
	groups: string[];
	fusions: string[];
}
interface Props {
	ssr: StaticProps;
}
const PageLines: React.FC<Props> = ({ ssr = defaultData }) => {
	const [groups, setLines] = React.useState<string[]>(ssr.groups);
	const [load, loading] = useFetch(setLines);

	useEffect(() => {
		if (!groups.length) {
			load(`${process.env.URL}/json/groups/_index.json`);
		}
	}, []);

	return (
		<Layout title="Available groups">
			{loading ? (
				<div className="text-center">
					<Spinner animation="border" />
				</div>
			) : (
				<div className="line-wrapper">
					<Row className="line-row">
						{groups.map((name, i) => (
							<Col key={i}>
								<PointImage name={name} type="group" />
							</Col>
						))}
					</Row>
				</div>
			)}
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	try {
		const groups: string[] = require('../../../public/json/groups/_index.json');

		return { props: { ssr: { groups } } };
	} catch (e) {
		if (process.env.NODE_ENV === DEV) {
			console.error(e);
		}
		return { props: { ssr: defaultData } };
	}
};

export default PageLines;
