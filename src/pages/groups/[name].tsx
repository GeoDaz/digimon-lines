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
import ShareButton from '@/components/ShareButton';
import GroupRelated from '@/components/Group/GroupRelated';
// functions
import useFetch from '@/hooks/useFetch';
import useSaveGroup from '@/hooks/useSaveGroup';
import { capitalize, typeOf } from '@/functions';
import useQueryParam from '@/hooks/useQueryParam';
import { getDubNames, getDubbedSearchList } from '@/functions/search';
import { getDirPaths } from '@/functions/file';
// constants
import { Group, GroupPoint } from '@/types/Group';
import GroupGrid from '@/components/Group/GroupGrid';
import { SearchContext } from '@/context/search';
import Search from '@/types/Search';
import { IS_DEV } from '@/consts/env';

const NAME = 'name';
interface StaticProps {
	group?: Group;
	name?: string;
	/** Digimon autocompletion, only built in dev for the related edition. */
	digimonSearch?: Search;
}
interface Props {
	ssr: StaticProps;
}
const PageGroup: React.FC<Props> = ({ ssr = {} }) => {
	const { name } = useQueryParam(NAME) || ssr;
	const [group, setGroup] = useState<Group | undefined>(ssr.group);
	const saveGroup = useSaveGroup(name, setGroup);

	useEffect(() => {
		if (group !== ssr.group) {
			setGroup(ssr.group);
		}
	}, [ssr.group]);

	// Related edition is a dev only tool.
	const editable = IS_DEV && !!group;

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
			<div className="line-filters">
				<ShareButton
					title={`${group?.title || nameCap} Group`}
					text={`List of Digimon in the ${nameCap} group`}
				/>
			</div>
			{group ? (
				Array.isArray(group.main) ? (
					<Row className="line-row">
						{(group.main as GroupPoint[]).map((point, i) => (
							<Col key={i}>
								<LinePoint name={point.name} line={point.redirect || point.line}>
									{!!point.line && (
										<LineImage
											className="line-skin"
											name={point.line}
											loadable={false}
										/>
									)}
								</LinePoint>
							</Col>
						))}
					</Row>
				) : (
					<GroupGrid group={group} />
				)
			) : (
				<p>Group not found</p>
			)}
			<SearchContext.Provider value={ssr.digimonSearch}>
				<GroupRelated
					related={group?.related}
					editable={editable}
					onChange={related => group && saveGroup({ ...group, related })}
				/>
			</SearchContext.Provider>
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

		// Only shipped in dev : it feeds the related edition autocompletion.
		const digimonSearch =
			IS_DEV ? getDubbedSearchList(getDirPaths('images/digimon'), getDubNames())
			:	null;

		return { props: { ssr: { name: params.name, group, digimonSearch } } };
	} catch (e) {
		console.error(e);
		return { props: { ssr: { name: params.name } } };
	}
};

export default PageGroup;
