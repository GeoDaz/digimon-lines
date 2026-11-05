import { Fragment, memo, useContext, useRef, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { Axis, CollapseAttr, Line, LineColumn, LineFrom, LinePoint, SizeAttr } from '@/types/Line';
import { makeClassName } from '@/functions';
import {
	addLineColumn,
	moveLinePoint,
	removeLineColumn,
	resizeLinePoint,
	setLinePoint,
} from '@/reducers/lineReducer';
import { GridContext } from '@/context/grid';
import { ZoomContext } from '@/context/zoom';
import LinePointSettings from './LinePointSettings';
import LineGridPoint from './LineGridPoint';
import LineAddRow from './LineAddRow';
import Icon from '../Icon';
import LineLevels from './LineLevels';

export interface LineEdition {
	point?: LinePoint;
	coord: number[];
}

interface GridProps {
	line: Line;
	handleUpdate?: CallableFunction;
}
const LineGrid: React.FC<GridProps> = ({ line, handleUpdate }) => {
	const [drawing, setDrawing] = useState<number[] | undefined>();
	const [edition, edit] = useState<number[]>();
	const { zoomFactor } = useContext(ZoomContext);
	const dragCoord = useRef<number[] | null>(null);

	const handleDragStart = (coord: number[]) => {
		dragCoord.current = coord;
	};

	const handleDragEnd = () => {
		dragCoord.current = null;
	};

	const handleDragOver = (e: React.DragEvent) => {
		if (dragCoord.current) e.preventDefault();
	};

	const handleDrop = (coord: number[]) => {
		const source = dragCoord.current;
		dragCoord.current = null;
		if (!handleUpdate || !source) return;
		if (source[0] === coord[0] && source[1] === coord[1]) return;
		handleUpdate(moveLinePoint, source, coord);
	};

	const handleTarget = (target: number[]) => {
		if (!handleUpdate || !drawing) return;
		let source = drawing;
		let sourcePoint: LinePoint | null = line.columns[source[0]][source[1]];
		let targetPoint: LinePoint | null = line.columns[target[0]][target[1]];
		if (!sourcePoint || !targetPoint) return;
		const from: LineFrom = [
			target[0] -
				source[0] -
				(sourcePoint.xSize == 2 ? 0.5 : 0) +
				(targetPoint.xSize == 2 ? 0.5 : 0),
			target[1] -
				source[1] -
				(sourcePoint.ySize == 2 ? 0.5 : 0) +
				(targetPoint.ySize == 2 ? 0.5 : 0),
		];
		const nextPoint: LinePoint = { ...sourcePoint };
		if (!nextPoint.from) nextPoint.from = [];
		(nextPoint.from as Array<number[]>).push(from);
		handleUpdate(setLinePoint, source, nextPoint);
		setDrawing(undefined);
	};

	const handleEdit = (coord: number[]) => {
		edit(coord);
		if (drawing) setDrawing(undefined);
	};

	const handleCollapse = (axis: Axis, coord: number[]) => {
		const point: LinePoint | null = line.columns[coord[0]][coord[1]];
		if (!handleUpdate || !point) return;
		const sizeAttr = (axis + 'Size') as SizeAttr;
		const collapsableAttr = (axis + 'Collapsable') as CollapseAttr;
		if (!point[collapsableAttr] && point[sizeAttr] != 2) return;
		handleUpdate(resizeLinePoint, coord, axis);
	};

	const handleXCollapse = (coord: number[]) => {
		handleCollapse('x', coord);
	};

	const handleYCollapse = (coord: number[]) => {
		handleCollapse('y', coord);
	};

	return (
		<GridContext.Provider
			value={{
				drawing,
				anchor: line.anchor,
				handleUpdate,
				handleEdit: handleUpdate ? handleEdit : undefined,
				handleDraw: setDrawing,
				handleTarget,
				handleXCollapse,
				handleYCollapse,
				handleDragStart: handleUpdate ? handleDragStart : undefined,
				handleDragEnd: handleUpdate ? handleDragEnd : undefined,
				handleDragOver: handleUpdate ? handleDragOver : undefined,
				handleDrop: handleUpdate ? handleDrop : undefined,
			}}
		>
			{!!handleUpdate && (
				<LinePointSettings
					show={!!edition}
					point={
						edition
							? (line.columns[edition[0]][edition[1]] as LinePoint)
							: undefined
					}
					coord={edition}
					handleClose={() => edit(undefined)}
				/>
			)}
			<div className="frame">
				<div
					className={makeClassName(
						'line-wrapper line-grid',
						handleUpdate && 'editable'
					)}
					style={{ fontSize: `${zoomFactor}rem` }}
				>
					<LineLevels line={line} />
					{line.columns.map((column, i) => (
						<LineRow key={i} x={i} column={column} />
					))}
					{!!handleUpdate && <LineAddRow handleUpdate={handleUpdate} />}
				</div>
			</div>
		</GridContext.Provider>
	);
};

interface RowProps {
	column?: LineColumn;
	x: number;
	y?: number; // for sub rows
}
const LineRow: React.FC<RowProps> = ({ column, x, y }) => {
	const { handleEdit, handleUpdate } = useContext(GridContext);

	const handleRemove = (e: any) => {
		if (handleUpdate) {
			handleUpdate(removeLineColumn, x);
		}
	};
	const handleAdd = (e: any) => {
		if (handleUpdate) {
			handleUpdate(addLineColumn, x);
		}
	};

	if (!column) return null;
	return (
		<Row className="line-row">
			{!!handleEdit && (
				<>
					<Button
						variant="primary"
						className="add"
						title="insert column"
						onClick={handleAdd}
					>
						<Icon name="plus-lg" />
					</Button>
					<Button variant="danger" title="remove column" onClick={handleRemove}>
						<Icon name="trash3-fill" />
					</Button>
				</>
			)}
			{column.map((point, i) => {
				if (Array.isArray(point)) {
					return (
						<Fragment key={i}>
							<LineRow x={x} column={point} />
						</Fragment>
					);
				}
				return (
					<Col key={i}>
						<LineGridPoint point={point} coord={[x, i]} />
					</Col>
				);
			})}
		</Row>
	);
};

export default memo(LineGrid);
