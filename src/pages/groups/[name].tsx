// modules
import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { GetStaticProps } from 'next';
import { redirect } from 'next/navigation';
// components
import Layout from '@/components/Layout';
import LineLoading from '@/components/Line/LineLoading';
import LinePoint from '@/components/Line/LinePoint';
import LineImage from '@/components/Line/LineImage';
import CommentLink from '@/components/CommentLink';
// functions
import useFetch from '@/hooks/useFetch';
import { capitalize } from '@/functions';
import useQueryParam from '@/hooks/useQueryParam';
// constants
import { Group } from '@/types/Group';

const NAME = 'name';
interface StaticProps {
	group?: Group;
	name?: string;
}
interface Props {
	ssr: StaticProps;
}
const PageGroup: React.FC<Props> = ({ ssr = {} }) => {
	const { name } = useQueryParam(NAME) || ssr;
	const [group, setGroup] = useState<Group | undefined>(ssr.group);

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
		redirect('/groups');
	}
	const nameCap = capitalize(name);
	return (
		<Layout
			title={
				<>
					Group&nbsp;:{' '}
					<span className="text-capitalize">{group?.title || name}</span>
				</>
			}
			metatitle={nameCap + ' Group'}
			metadescription={`List of Digimon in the ${nameCap} group`}
			metaimg={`groups/${name}.jpg`}
		>
			{loading ? (
				<LineLoading />
			) : group ? (
				<Row className="line-row">
					{group.main.map((point, i) => (
						<Col key={i}>
							<LinePoint name={point.name} line={point.line}>
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
								<LinePoint name={relation.name} line={relation.line}>
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
			{!!group && <CommentLink />}
		</Layout>
	);
};

export async function getStaticPaths() {
	try {
		const groups: string[] = require('../../../public/json/groups/_index.json');
		const paths = groups.map(name => ({ params: { name } }));

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
		console.error(e);
		return { props: { ssr: { name: params.name } } };
	}
};

export default PageGroup;
