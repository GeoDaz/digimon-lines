import { useContext, useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { levels } from '@/consts/levels';
import { GridContext } from '@/context/grid';
import { addLineRow, defaultLine, removeLineRow } from '@/reducers/lineReducer';
import Icon from '../Icon';
import Line from '@/types/Line';

interface Props {
	line: Line;
}
const LineLevels: React.FC<Props> = ({ line }) => {
	const { handleEdit, handleUpdate } = useContext(GridContext);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [levelsPicked, setLevelsPicked] = useState<string[]>(levels);

	useEffect(() => {
		if (line === defaultLine) {
			setLevelsPicked(levels);
		} else if (line.size !== levelsPicked.length) {
			setLevelsPicked(
				Array.from({ length: line.size }).map(
					(_, i) => levelsPicked[i] || levels[i] || ''
				)
			);
		}
	}, [line]);

	const handleLevelClick = (e: any, index: number) => {
		if (handleEdit) {
			setEditingIndex(index);
		}
	};

	const handleLevelChange = (e: any, index: number) => {
		setLevelsPicked(current => {
			const nextLevels = current.slice();
			nextLevels[index] = e.target.value;
			return nextLevels;
		});
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
			if (!levels.includes(levelsPicked[y])) {
				setLevelsPicked(current => current.filter((l, i) => i !== y));
			}

			handleUpdate(removeLineRow, y);
		}
	};

	const handleAdd = (e: any, y: number) => {
		e.stopPropagation();
		if (handleUpdate) {
			const nextY = y + 1;
			const currentLevel = levelsPicked[y];
			const levelIndex = levels.indexOf(currentLevel);
			if (levelIndex >= 0 && levelsPicked[nextY] != levels[levelIndex + 1]) {
				// add a level from a level in the levels array
				setLevelsPicked(current => {
					const nextLevels = current.slice();
					nextLevels.splice(nextY, 0, levels[levelIndex + 1]);
					return nextLevels;
				});
			}

			handleUpdate(addLineRow, y);
		}
	};

	const handleAddBefore = (e: any, y: number) => {
		e.stopPropagation();
		if (handleUpdate) {
			setLevelsPicked(current => ['', ...current]);
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
					{editingIndex === i ? (
						<Form.Control
							type="text"
							value={level}
							onChange={e => handleLevelChange(e, i)}
							onBlur={handleCloseEdit}
							autoFocus
							onKeyDown={handleEnter}
						/>
					) : (
						<span>{level}</span>
					)}
				</div>
			))}
		</div>
	);
};

export default LineLevels;
