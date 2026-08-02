import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import ButtonAdd from '@/components/Button/ButtonAdd';
import GroupPointCol from '@/components/Group/GroupPointCol';
import GroupPointModal from '@/components/Group/GroupPointModal';
import useDragReorder from '@/hooks/useDragReorder';
import { GroupPoint } from '@/types/Group';

interface Props {
	related?: GroupPoint[];
	editable?: boolean;
	onChange?: (related: GroupPoint[]) => void;
}

const GroupRelated: React.FC<Props> = ({ related, editable = false, onChange }) => {
	const [showModal, setShowModal] = useState(false);
	const relations = related || [];
	const { dragProps, draggingIndex } = useDragReorder(relations, onChange);

	if (!related?.length && !editable) return null;

	const handleAdd = (point: GroupPoint) => {
		if (relations.some(item => item.name === point.name)) return;
		onChange?.([...relations, point]);
	};

	const handleRemove = (index: number) => {
		onChange?.(relations.filter((_, i) => i !== index));
	};

	return (
		<div className="line-wrapper">
			<h2>Related to the group&nbsp;:</h2>
			<Row className="line-row">
				{relations.map((relation, i) => (
					<GroupPointCol
						key={i}
						point={relation}
						onRemove={editable ? () => handleRemove(i) : undefined}
						dragging={draggingIndex === i}
						{...(editable ? dragProps(i) : {})}
					/>
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
					onSubmit={handleAdd}
				/>
			)}
		</div>
	);
};

export default GroupRelated;
