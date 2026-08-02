import React, { useState } from 'react';
import fs from 'fs';
import { Row, Col } from 'react-bootstrap';
import Layout from '@/components/Layout';
import LinePoint from '@/components/Line/LinePoint';
import ButtonAdd from '@/components/Button/ButtonAdd';
import ButtonRemove from '@/components/Button/ButtonRemove';
import GroupModal from '@/components/Group/GroupModal';
import useSaveGroupIndex from '@/hooks/useSaveGroupIndex';
import { GetStaticProps } from 'next';
import { LineThumb } from '@/types/Line';
import { GROUP } from '@/consts/ui';
import { capitalize } from '@/functions';
import { IS_DEV } from '@/consts/env';

// TODO rename this page groups.tsx when there will be a home

const defaultData = { groups: [], fusions: [] };
interface StaticProps {
	groups: LineThumb[];
}
interface Props {
	ssr: StaticProps;
}
const PageLines: React.FC<Props> = ({ ssr = defaultData }) => {
	const [groups, setGroups] = useState<LineThumb[]>(ssr.groups);
	const [showModal, setShowModal] = useState(false);
	const saveGroups = useSaveGroupIndex(setGroups);

	const handleAdd = (name: string) => {
		if (groups.some(group => group.name === name)) return;
		saveGroups([...groups, { name }]);
	};

	// Only removes the group from the index, its json file is kept.
	const handleRemove = (index: number) => {
		saveGroups(groups.filter((_, i) => i !== index));
	};

	return (
		<Layout
			title="Available groups"
			metatitle="Groups"
			metadescription="List of available Digimon groups"
		>
			<div className="line-wrapper">
				<Row className="line-row">
					{groups.map((group, i) => (
						<Col key={i} className={IS_DEV ? 'position-relative' : undefined}>
							{IS_DEV && (
								<ButtonRemove
									size="sm"
									overlay
									title="Remove from the list"
									onClick={() => handleRemove(i)}
								/>
							)}
							<LinePoint
								name={group.name}
								available={group.available}
								type={GROUP}
							/>
							<GroupName name={group.name} />
						</Col>
					))}
					{IS_DEV && (
						<Col>
							<ButtonAdd
								title="Add a group"
								onClick={() => setShowModal(true)}
							/>
						</Col>
					)}
				</Row>
			</div>
			{IS_DEV && (
				<GroupModal
					show={showModal}
					onClose={() => setShowModal(false)}
					onSubmit={handleAdd}
				/>
			)}
		</Layout>
	);
};

const GroupName: React.FC<{ name: string }> = ({ name }) => {
	return (
		<a href={`/groups/${name}`} className="h5 d-block text-center mt-2">
			{capitalize(name)}
		</a>
	);
};

const checkGroupAvailability = (group: string | LineThumb): LineThumb => {
	const name = typeof group === 'string' ? group : group.name;
	try {
		const available = fs.existsSync(`public/json/groups/${name}.json`);
		return { name, available } as LineThumb;
	} catch (e) {
		return { name, available: false } as LineThumb;
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
