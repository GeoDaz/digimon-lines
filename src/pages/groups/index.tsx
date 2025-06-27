import React, { useEffect, useState } from 'react';
import fs from 'fs';
import { Row, Col, Spinner } from 'react-bootstrap';
import useFetch from '@/hooks/useFetch';
import Layout from '@/components/Layout';
import LinePoint from '@/components/Line/LinePoint';
import { GetStaticProps } from 'next';
import { LineThumb } from '@/types/Line';
import { GROUP } from '@/consts/ui';
import { SITE_URL } from '@/consts/env';

// TODO rename this page groups.tsx when there will be a home

const defaultData = { groups: [], fusions: [] };
interface StaticProps {
	groups: string[] | LineThumb[];
}
interface Props {
	ssr: StaticProps;
}
const PageLines: React.FC<Props> = ({ ssr = defaultData }) => {
	return (
		<Layout
			title="Available groups"
			metatitle="Groups"
			metadescription="List of available Digimon groups"
		>
			<div className="line-wrapper">
				<Row className="line-row">
					{ssr.groups.map((group, i) =>
						typeof group === 'string' ? (
							<Col key={i}>
								<LinePoint name={group} type={GROUP} />
							</Col>
						) : (
							<Col key={i}>
								<LinePoint
									name={group.name}
									available={group.available}
									type={GROUP}
								/>
							</Col>
						)
					)}
				</Row>
			</div>
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
