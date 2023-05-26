// modules
import React, { useState, useEffect } from 'react';
import { Row, Col, Image } from 'react-bootstrap';
import { useRouter } from 'next/router';
// components
import Layout from '@/components/Layout';
import LineGrid, { LineLoading } from '@/components/LineGrid';
import Page404 from '@/pages/404';
import ProgressBarSteps from '@/components/ProgressBarSteps';
import Icon from '@/components/Icon';
import ColorLegend from '@/components/ColorLegend';
import LinePoint, { LineImage } from '@/components/LinePoint';
// functions
import useFetch from '@/hooks/useFetch';
import { capitalize } from '@/functions';
// constants
import { Group } from '@/types/Group';
import { zooms, zoomOptions } from '@/consts/zooms';
import { GetStaticProps } from 'next';
import useQueryParam from '@/hooks/useQueryParam';
import { DEV } from '@/consts/env';

const NAME = 'name';
interface StaticProps {
	group?: Group;
	name?: string;
}
interface Props {
	ssr: StaticProps;
}
const PageGroup: React.FC<Props> = ({ ssr = {} }) => {
	const name = useQueryParam(NAME) || ssr.name;
	const [group, setGroup] = useState<Group | undefined>(ssr.group);
	const [zoom, setZoom] = useState(0);

	const [load, loading] = useFetch((group: Group | undefined): void => setGroup(group));

	useEffect(() => {
		if (name != ssr.name) {
			load(`${process.env.URL}/json/groups/${name}.json`);
		}
	}, [name]);

	useEffect(() => {
		if (group !== ssr.group) {
			setGroup(ssr.group);
		}
	}, [ssr.group]);

	if (!name) {
		return <Page404 />;
	}
	return (
		<Layout
			title={
				<>
					Group&nbsp;:{' '}
					<span className="text-capitalize">{group?.title || name}</span>
				</>
			}
			metatitle={capitalize(name) + ' Group'}
		>
			<div className="line-filters">
				<Icon name="zoom-in lead d-inline-block d-max-xs-none" />
				<ProgressBarSteps
					steps={zoomOptions}
					selected={zoom}
					progress={zooms[zoom] / 1.5}
					onChange={setZoom}
					className="progress-zoom me-4"
				/>
			</div>
			{loading ? (
				<LineLoading />
			) : group ? (
				<Row className="line-row">
					{group.main.map((point, i) => (
						<Col key={i}>
							<LinePoint name={point.name}>
								{!!point.line && (
									<LineImage
										className="line-skin"
										name={point.line}
										title={point.line}
									/>
								)}
							</LinePoint>
						</Col>
					))}
				</Row>
			) : (
				<p>Group not found</p>
			)}
			{group?.related ? (
				<div className="line-wrapper">
					<h2>Related to the group&nbsp;:</h2>
					<Row className="line-row">
						{group.related.map((relation, i) => (
							<Col key={i}>
								<LinePoint name={relation.name}>
									{!!relation.line && (
										<LineImage
											className="line-skin"
											name={relation.line}
											title={relation.line}
										/>
									)}
								</LinePoint>
							</Col>
						))}
					</Row>
				</div>
			) : null}
		</Layout>
	);
};

export async function getStaticPaths() {
	try {
		const res = await fetch(`${process.env.URL}/json/groups/_index.json`);
		const groups: string[] = await res.json();

		const paths = groups.map(name => ({
			params: { name },
		}));

		return { paths, fallback: false };
	} catch {
		return { paths: [], fallback: true };
	}
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
	if (!params || !params.name) {
		return { notFound: true };
	}
	try {
		// prettier-ignore
		const group: Group | undefined = require(
			`../../../public/json/groups/${params.name}.json`
		);

		return { props: { ssr: { name: params.name, group } } };
	} catch (e) {
		if (process.env.NODE_ENV === DEV) {
			console.error(e);
		}
		return { props: { ssr: { name: params.name } } };
	}
};

export default PageGroup;
