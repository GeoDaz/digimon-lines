import React, { useEffect } from 'react';
import fs from 'fs';
import { Row, Col, Spinner } from 'react-bootstrap';
import useFetch from '@/hooks/useFetch';
import Layout from '@/components/Layout';
import PointImage from '@/components/LinePoint';
import { GetStaticProps } from 'next';
import { DEV } from '@/consts/env';
import { LineThumb } from '@/types/Line';
import { GROUP } from '@/consts/ui';

// TODO rename this page groups.tsx when there will be a home

const defaultData = { groups: [], fusions: [] };
interface StaticProps {
	groups: string[] | Array<LineThumb>;
}
interface Props {
	ssr: StaticProps;
}
const PageLines: React.FC<Props> = ({ ssr = defaultData }) => {
	const [groups, setLines] = React.useState<string[] | Array<LineThumb>>(ssr.groups);
	const [load, loading] = useFetch(setLines);

	useEffect(() => {
		if (!groups.length) {
			load(`${process.env.URL}/json/groups/_index.json`);
		}
	}, []);

	return (
		<Layout
			title="Available groups"
			metadescription="List of available Digimon groups"
		>
			{loading ? (
				<div className="text-center">
					<Spinner animation="border" />
				</div>
			) : (
				<div className="line-wrapper">
					<Row className="line-row">
						{groups.map((group, i) =>
							typeof group === 'string' ? (
								<Col key={i}>
									<PointImage name={group} type={GROUP} />
								</Col>
							) : (
								<Col key={i}>
									<PointImage
										name={group.name}
										available={group.available}
										type={GROUP}
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

const checkGroupAvailability = (group: string): LineThumb => {
	try {
		const available = fs.existsSync(`public/json/groups/${group}.json`);
		return { name: group, available } as LineThumb;
	} catch (e) {
		return { name: group, available: false } as LineThumb;
	}
};

export const getStaticProps: GetStaticProps = async () => {
	try {
		let groups = require('../../../public/json/groups/_index.json');
		groups = groups.map(checkGroupAvailability);

		return { props: { ssr: { groups } } };
	} catch (e) {
		console.error(e);
		return { props: { ssr: defaultData } };
	}
};

export default PageLines;
