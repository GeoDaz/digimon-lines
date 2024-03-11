import { useContext, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { levels } from '@/consts/levels';
import { GridContext } from '@/context/grid';
import { addLineRow, removeLineRow } from '@/reducers/lineReducer';
import Icon from '../Icon';

const defaultArray: string[] = [];

interface Props {
	size?: number;
}
const LineLevels: React.FC<Props> = ({ size }) => {
	const levelsPicked = useMemo(
		() =>
			size
				? Array.from({ length: size }).map((_, i) => levels[i] || '\u00A0')
				: defaultArray,
		[size]
	);

	if (!size) return null;
	return (
		<div className="levels">
			{levelsPicked.map((level, i) => (
				<LineLevel key={i} y={i} level={level} />
			))}
		</div>
	);
};

interface LevelProps {
	y: number;
	level: string;
}
const LineLevel: React.FC<LevelProps> = ({ y, level }) => {
	const { handleEdit, handleUpdate } = useContext(GridContext);

	const handleRemove = (e: any) => {
		if (handleUpdate) {
			handleUpdate(removeLineRow, y);
		}
	};
	const handleAdd = (e: any) => {
		if (handleUpdate) {
			handleUpdate(addLineRow, y);
		}
	};
	return (
		<div className="level">
			{!!handleEdit && (
				<>
					<Button
						variant="primary"
						className="add"
						title="insert row"
						onClick={handleAdd}
					>
						<Icon name="plus-lg" />
					</Button>
					<Button variant="danger" title="remove row" onClick={handleRemove}>
						<Icon name="trash3-fill" />
					</Button>
				</>
			)}
			<span>{level}</span>
		</div>
	);
};

export default LineLevels;
