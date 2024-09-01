import { useContext, useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { levels } from '@/consts/levels';
import { GridContext } from '@/context/grid';
import { addLineRow, removeLineRow } from '@/reducers/lineReducer';
import Icon from '../Icon';

const makeDefaultLevels = (size: number) => {
	return Array.from({ length: size || 0 }).map((_, i) => levels[i] || '');
};

interface Props {
	size?: number;
}
const LineLevels: React.FC<Props> = ({ size = 0 }) => {
	const { handleEdit, handleUpdate } = useContext(GridContext);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [levelsPicked, setLevelsPicked] = useState<string[]>(() =>
		makeDefaultLevels(size)
	);

	useEffect(() => {
		if (size !== levelsPicked.length) {
			setLevelsPicked(
				Array.from({ length: size }).map((_, i) => levelsPicked[i] || '')
			);
		}
	}, [size]);

	const handleLevelClick = (e: any, index: number) => {
		if (handleEdit) {
			setEditingIndex(index);
		}
	};

	const handleLevelChange = (e: any, index: number) => {
		setLevelsPicked(current => {
			const nextevels = current.slice();
			nextevels[index] = e.target.value;
			return nextevels;
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
		const nextY = y + 1;
		if (handleUpdate) {
			if (!levels.includes(levelsPicked[y])) {
				setLevelsPicked(current => {
					const nextevels = current.slice();
					nextevels.splice(nextY, 0, '');
					return nextevels;
				});
			} else if (levels[nextY] && levelsPicked[nextY] != levels[nextY]) {
				setLevelsPicked(current => {
					const nextevels = current.slice();
					nextevels.splice(nextY, 0, levels[nextY]);
					return nextevels;
				});
			}

			handleUpdate(addLineRow, y);
		}
	};

	const handleAddBefore = (e: any, y: number) => {
		e.stopPropagation();
		if (handleUpdate) {
			setLevelsPicked(current => ['', ...current]);
			handleUpdate(addLineRow, y);
		}
	};

	if (!size) return null;
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
