import Group, { GroupPoint } from '@/types/Group';
import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import LineImage from '../Line/LineImage';
import ButtonAdd from '../Button/ButtonAdd';
import GroupPointCol from './GroupPointCol';
import GroupPointModal from './GroupPointModal';
import useDragReorder from '@/hooks/useDragReorder';

interface Props {
	group: Group;
	editable?: boolean;
	onChange?: (main: Group['main']) => void;
}

type GroupRow = Array<GroupPoint | null>;
type GroupRows = { [key: string]: GroupRow };

const GroupGrid: React.FC<Props> = ({ group, editable = false, onChange }) => {
	// TODO ajouter le zoom
	// Row the added digimon goes to, also holds the modal visibility.
	const [addRow, setAddRow] = useState<string | null>(null);
	const rows = group.main as GroupRows;

	const handleAdd = (point: GroupPoint) => {
		if (!addRow) return;
		const row = rows[addRow] || [];
		if (row.some(item => item?.name === point.name)) return;
		onChange?.({ ...rows, [addRow]: [...row, point] });
	};

	return (
		<div className="frame">
			<div className="line-grid ps-4">
				{Object.entries(rows).map(([key, points]) => (
					<GroupGridRow
						key={key}
						name={key}
						type={group.type}
						points={points}
						editable={editable}
						onAdd={() => setAddRow(key)}
						onChange={row => onChange?.({ ...rows, [key]: row })}
					/>
				))}
			</div>
			{editable && (
				<GroupPointModal
					show={!!addRow}
					onClose={() => setAddRow(null)}
					onSubmit={handleAdd}
					title={`Add a Digimon to ${addRow}`}
					withRedirect
				/>
			)}
		</div>
	);
};

interface RowProps {
	name: string;
	type?: string;
	points: GroupRow;
	editable: boolean;
	onAdd: () => void;
	onChange: (points: GroupRow) => void;
}

const GroupGridRow: React.FC<RowProps> = ({
	name,
	type,
	points,
	editable,
	onAdd,
	onChange,
}) => {
	const { dragProps, draggingIndex } = useDragReorder(points, onChange);

	const handleRemove = (index: number) => {
		onChange(points.filter((_, i) => i !== index));
	};

	return (
		<Row className="line-row">
			<Col>
				<div title={name} className="line-point pictured">
					<div className="line-point-safe-zone">
						<LineImage name={name} type={type} />
					</div>
				</div>
			</Col>
			{points.map((point, i) =>
				point ?
					<GroupPointCol
						key={i}
						point={point}
						onRemove={editable ? () => handleRemove(i) : undefined}
						dragging={draggingIndex === i}
						{...(editable ? dragProps(i) : {})}
					/>
				:	<Col key={i}>
						<div className="line-point" />
					</Col>
			)}
			{editable && (
				<Col>
					<ButtonAdd title={`Add a Digimon to ${name}`} onClick={onAdd} />
				</Col>
			)}
		</Row>
	);
};

export default GroupGrid;
