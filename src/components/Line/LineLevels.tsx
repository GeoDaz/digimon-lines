import { useContext, useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { GridContext } from '@/context/grid';
import { addLineRow, removeLineRow, setLineValue } from '@/reducers/lineReducer';
import { getLineLevels } from '@/functions/line';
import Icon from '../Icon';
import Line from '@/types/Line';

interface Props {
	line: Line;
}
const LineLevels: React.FC<Props> = ({ line }) => {
	const { handleEdit, handleUpdate } = useContext(GridContext);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);

	const levelsPicked = useMemo(() => getLineLevels(line), [line]);

	const handleLevelClick = (e: any, index: number) => {
		if (handleEdit) {
			setEditingIndex(index);
		}
	};

	const handleLevelChange = (e: any, index: number) => {
		if (!handleUpdate) return;
		const nextLevels = levelsPicked.slice();
		nextLevels[index] = e.target.value;
		handleUpdate(setLineValue, 'levels', nextLevels);
	};

	const handleCloseEdit = () => setEditingIndex(null);

	const handleEnter = (e: any) => {
		if (e.key === 'Enter') {
			handleCloseEdit();
		}
	};

	const handleRemove = (e: any, y: number) => {
		e.stopPropagation();
		if (handleUpdate && levelsPicked.length > 1) {
			handleUpdate(removeLineRow, y);
		}
	};

	const handleAdd = (e: any, y: number) => {
		e.stopPropagation();
		if (handleUpdate) {
			handleUpdate(addLineRow, y);
		}
	};

	const handleAddBefore = (e: any, y: number) => {
		e.stopPropagation();
		if (handleUpdate) {
			handleUpdate(addLineRow, y - 1);
		}
	};

	if (!line.size) return null;
	return (
		<div className="levels">
			{levelsPicked.map((level, i) => (
				<div
					key={i}
					className="level click"
					onClick={e => handleLevelClick(e, i)}
				>
					{!!handleEdit && editingIndex !== i && (
						<>
							{i == 0 && (
								<Button
									variant="primary"
									className="add before"
									title="insert row before"
									onClick={e => handleAddBefore(e, i)}
								>
									<Icon name="plus-lg" />
								</Button>
							)}
							<Button
								variant="primary"
								className="add"
								title="insert row"
								onClick={e => handleAdd(e, i)}
							>
								<Icon name="plus-lg" />
							</Button>
							<Button
								variant="danger"
								title="remove row"
								onClick={e => handleRemove(e, i)}
							>
								<Icon name="trash3-fill" />
							</Button>
						</>
					)}
					{editingIndex === i ?
						<Form.Control
							type="text"
							value={level}
							onChange={e => handleLevelChange(e, i)}
							onBlur={handleCloseEdit}
							autoFocus
							onKeyDown={handleEnter}
						/>
					:	<span>{level}</span>}
				</div>
			))}
		</div>
	);
};

export default LineLevels;
