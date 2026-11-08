import { Fragment, memo, useContext, useRef, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import {
	Axis,
	CollapseAttr,
	Line,
	LineColumn,
	LineFrom,
	LinePoint,
	SizeAttr,
} from '@/types/Line';
import { makeClassName } from '@/functions';
import {
	addLineColumn,
	moveLineColumn,
	moveLinePoint,
	moveLineRow,
	removeLineColumn,
	resizeLinePoint,
	setLinePoint,
} from '@/reducers/lineReducer';
import { GridContext, ReorderAxis, ReorderState } from '@/context/grid';
import { pointMainImage, setDragGhost } from '@/functions/dragGhost';
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

type DragSource =
	| { axis: 'cell'; coord: number[] }
	| { axis: ReorderAxis; index: number };

interface GridProps {
	line: Line;
	handleUpdate?: CallableFunction;
}
const LineGrid: React.FC<GridProps> = ({ line, handleUpdate }) => {
	const [drawing, setDrawing] = useState<number[] | undefined>();
	const [edition, edit] = useState<number[]>();
	const { zoomFactor } = useContext(ZoomContext);
	const dragSource = useRef<DragSource | null>(null);
	const [reorder, setReorder] = useState<ReorderState | null>(null);

	const startDrag = (e: React.DragEvent, source: DragSource) => {
		dragSource.current = source;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', '');
	};

	const handleDragStart = (e: React.DragEvent, coord: number[]) => {
		startDrag(e, { axis: 'cell', coord });
		const img = pointMainImage(e.currentTarget);
		if (!img) return;
		const rect = img.getBoundingClientRect();
		setDragGhost(e, [img], {
			size: rect.width,
			offset: [e.clientX - rect.left, e.clientY - rect.top],
		});
	};

	const handleAxisDragStart = (
		e: React.DragEvent,
		axis: ReorderAxis,
		index: number
	) => {
		e.stopPropagation();
		startDrag(e, { axis, index });
		setReorder({ axis, from: index });
		const grid = (e.currentTarget as HTMLElement).closest('.line-grid');
		if (!grid) return;
		const points = Array.from(
			grid.querySelectorAll<HTMLElement>('.line-point.pictured[data-coord]')
		)
			.map(el => ({ el, coord: (el.dataset.coord || '').split(',').map(Number) }))
			.filter(({ coord }) => coord[axis === 'column' ? 0 : 1] === index)
			.sort((a, b) =>
				axis === 'column' ? a.coord[1] - b.coord[1] : a.coord[0] - b.coord[0]
			);
		setDragGhost(
			e,
			points.map(({ el }) => pointMainImage(el)),
			{ size: 48, direction: axis === 'column' ? 'column' : 'row' }
		);
	};

	const handleDragEnd = () => {
		dragSource.current = null;
		setReorder(null);
	};

	const setOver = (axis: ReorderAxis, index: number) => {
		setReorder(current =>
			current && current.axis === axis && current.over !== index ?
				{ ...current, over: index }
			:	current
		);
	};

	const handleDragOver = (e: React.DragEvent, coord: number[]) => {
		const source = dragSource.current;
		if (!source) return;
		if (source.axis === 'cell') {
			e.preventDefault();
		} else if (source.axis === 'row') {
			e.preventDefault();
			setOver('row', coord[1]);
		}
	};

	const handleAxisDragOver = (e: React.DragEvent, axis: ReorderAxis, index: number) => {
		if (dragSource.current?.axis !== axis) return;
		e.preventDefault();
		setOver(axis, index);
	};

	const moveAxis = (axis: ReorderAxis, from: number, to: number) => {
		if (!handleUpdate || from === to) return;
		handleUpdate(axis === 'column' ? moveLineColumn : moveLineRow, from, to);
	};

	const handleDrop = (e: React.DragEvent, coord: number[]) => {
		const source = dragSource.current;
		if (!handleUpdate || !source) return;
		if (source.axis === 'cell') {
			e.preventDefault();
			handleDragEnd();
			if (source.coord[0] === coord[0] && source.coord[1] === coord[1]) return;
			handleUpdate(moveLinePoint, source.coord, coord);
		} else if (source.axis === 'row') {
			e.preventDefault();
			handleDragEnd();
			moveAxis('row', source.index, coord[1]);
		}
	};

	const handleAxisDrop = (e: React.DragEvent, axis: ReorderAxis, index: number) => {
		const source = dragSource.current;
		if (!source || source.axis !== axis) return;
		e.preventDefault();
		handleDragEnd();
		moveAxis(axis, source.index, index);
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
				reorder,
				handleDragStart: handleUpdate ? handleDragStart : undefined,
				handleDragEnd: handleUpdate ? handleDragEnd : undefined,
				handleDragOver: handleUpdate ? handleDragOver : undefined,
				handleDrop: handleUpdate ? handleDrop : undefined,
				handleAxisDragStart: handleUpdate ? handleAxisDragStart : undefined,
				handleAxisDragOver: handleUpdate ? handleAxisDragOver : undefined,
				handleAxisDrop: handleUpdate ? handleAxisDrop : undefined,
			}}
		>
			{!!handleUpdate && (
				<LinePointSettings
					show={!!edition}
					point={
						edition ?
							(line.columns[edition[0]][edition[1]] as LinePoint)
						:	undefined
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
	nested?: boolean;
}
const LineRow: React.FC<RowProps> = ({ column, x, y, nested }) => {
	const {
		handleEdit,
		handleUpdate,
		reorder,
		handleAxisDragStart,
		handleAxisDragOver,
		handleAxisDrop,
		handleDragEnd,
	} = useContext(GridContext);
	const reorderable = !nested && !!handleAxisDragStart;
	const columnReorder = reorder?.axis === 'column' ? reorder : null;

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
		<Row
			className={makeClassName(
				'line-row',
				!nested && columnReorder?.from === x && 'dragging',
				!nested &&
					columnReorder?.over === x &&
					columnReorder.from !== x &&
					'drop-target'
			)}
			onDragOver={
				reorderable && handleAxisDragOver ?
					e => handleAxisDragOver(e, 'column', x)
				:	undefined
			}
			onDrop={
				reorderable && handleAxisDrop ?
					e => handleAxisDrop(e, 'column', x)
				:	undefined
			}
		>
			{!!handleEdit && (
				<div className="action-btns">
					<Button
						variant="primary"
						className="add"
						title="insert column"
						onClick={handleAdd}
					>
						<Icon name="plus-lg" />
					</Button>
					{reorderable && (
						<Button
							variant="secondary"
							className="grip"
							title="drag to move column"
							draggable
							onDragStart={e => handleAxisDragStart!(e, 'column', x)}
							onDragEnd={handleDragEnd}
						>
							<Icon name="grip-vertical" />
						</Button>
					)}
					<Button variant="danger" title="remove column" onClick={handleRemove}>
						<Icon name="trash3-fill" />
					</Button>
				</div>
			)}
			{column.map((point, i) => {
				if (Array.isArray(point)) {
					return (
						<Fragment key={i}>
							<LineRow x={x} column={point} nested />
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
