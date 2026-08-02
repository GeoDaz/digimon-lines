import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import ButtonAdd from '@/components/Button/ButtonAdd';
import GroupGrid from '@/components/Group/GroupGrid';
import GroupPointCol from '@/components/Group/GroupPointCol';
import GroupPointModal from '@/components/Group/GroupPointModal';
import useDragReorder from '@/hooks/useDragReorder';
import Group, { GroupPoint } from '@/types/Group';

interface Props {
	group: Group;
	editable?: boolean;
	onChange?: (main: Group['main']) => void;
}

const GroupMain: React.FC<Props> = ({ group, editable = false, onChange }) => {
	const [showModal, setShowModal] = useState(false);
	const points = Array.isArray(group.main) ? group.main : [];
	const { dragProps, draggingIndex } = useDragReorder(points, onChange);

	// Grouped by digimon (digimentals, spirits...) : one row per key.
	if (!Array.isArray(group.main)) {
		return <GroupGrid group={group} editable={editable} onChange={onChange} />;
	}

	const handleAdd = (point: GroupPoint) => {
		if (points.some(item => item.name === point.name)) return;
		onChange?.([...points, point]);
	};

	const handleRemove = (index: number) => {
		onChange?.(points.filter((_, i) => i !== index));
	};

	return (
		<>
			<Row className="line-row">
				{points.map((point, i) => (
					<GroupPointCol
						key={i}
						point={point}
						onRemove={editable ? () => handleRemove(i) : undefined}
						dragging={draggingIndex === i}
						{...(editable ? dragProps(i) : {})}
					/>
				))}
				{editable && (
					<Col>
						<ButtonAdd
							title="Add a Digimon"
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
					title="Add a Digimon to the group"
					withRedirect
				/>
			)}
		</>
	);
};

export default GroupMain;
