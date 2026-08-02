import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import LinePoint from '@/components/Line/LinePoint';
import LineImage from '@/components/Line/LineImage';
import ButtonAdd from '@/components/Button/ButtonAdd';
import GroupPointModal from '@/components/Group/GroupPointModal';
import { GroupPoint } from '@/types/Group';

interface Props {
	related?: GroupPoint[];
	editable?: boolean;
	onChange?: (related: GroupPoint[]) => void;
}

const GroupRelated: React.FC<Props> = ({ related, editable = false, onChange }) => {
	const [showModal, setShowModal] = useState(false);

	if (!related?.length && !editable) return null;

	const handleSubmit = (point: GroupPoint) => {
		const current = related || [];
		if (current.some(item => item.name === point.name)) return;
		onChange?.([...current, point]);
	};

	return (
		<div className="line-wrapper">
			<h2>Related to the group&nbsp;:</h2>
			<Row className="line-row">
				{related?.map((relation, i) => (
					<Col key={i}>
						<LinePoint name={relation.name} line={relation.line}>
							{!!relation.line && (
								<LineImage
									className="line-skin"
									name={relation.line}
									loadable={false}
								/>
							)}
						</LinePoint>
					</Col>
				))}
				{editable && (
					<Col>
						<ButtonAdd
							title="Add a related Digimon"
							onClick={() => setShowModal(true)}
						/>
					</Col>
				)}
			</Row>
			{editable && (
				<GroupPointModal
					show={showModal}
					onClose={() => setShowModal(false)}
					onSubmit={handleSubmit}
				/>
			)}
		</div>
	);
};

export default GroupRelated;
