import Group, { GroupPoint } from '@/types/Group';
import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import LineImage from '../Line/LineImage';
import ButtonAdd from '../Button/ButtonAdd';
import GroupPointCol from './GroupPointCol';
import GroupPointModal from './GroupPointModal';

interface Props {
	group: Group;
	editable?: boolean;
	onChange?: (main: Group['main']) => void;
}

type GroupRows = { [key: string]: Array<GroupPoint | null> };

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

	const handleRemove = (key: string, index: number) => {
		onChange?.({ ...rows, [key]: rows[key].filter((_, i) => i !== index) });
	};

	return (
		<div className="frame">
			<div className="line-grid ps-4">
				{Object.entries(rows).map(([key, points]) => (
					<Row className="line-row" key={key}>
						<Col>
							<div title={key} className="line-point pictured">
								<div className="line-point-safe-zone">
									<LineImage name={key} type={group.type} />
								</div>
							</div>
						</Col>
						{points.map((point, i) =>
							point ? (
								<GroupPointCol
									key={i}
									point={point}
									onRemove={
										editable ? () => handleRemove(key, i) : undefined
									}
								/>
							) : (
								<Col key={i}>
									<div className="line-point" />
								</Col>
							)
						)}
						{editable && (
							<Col>
								<ButtonAdd
									title={`Add a Digimon to ${key}`}
									onClick={() => setAddRow(key)}
								/>
							</Col>
						)}
					</Row>
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
export default GroupGrid;
