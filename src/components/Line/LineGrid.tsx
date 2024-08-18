import { Fragment, memo, useContext, useState } from 'react';
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
import { addLineColumn, removeLineColumn, setLinePoint } from '@/reducers/lineReducer';
import { GridContext } from '@/context/grid';
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
	zoom?: number;
	handleUpdate?: CallableFunction;
}
const LineGrid: React.FC<GridProps> = ({ line, zoom = 100, handleUpdate }) => {
	const [drawing, setDrawing] = useState<number[] | undefined>();
	const [edition, edit] = useState<number[]>();

	const handleTarget = (target: number[]) => {
		if (!handleUpdate || !drawing) return;
		let source = drawing;
		let sourcePoint: LinePoint | null = line.columns[source[0]][source[1]];
		let targetPoint: LinePoint | null = line.columns[target[0]][target[1]];
		// If the target is below the source, swap them
		if (
			target[1] > source[1] ||
			(target[1] == source[1] &&
				targetPoint?.ySize &&
				targetPoint.ySize > (sourcePoint?.ySize || 0))
		) {
			source = target;
			target = drawing;
			sourcePoint = line.columns[source[0]][source[1]];
			targetPoint = line.columns[target[0]][target[1]];
		}
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
		let from: LineFrom | undefined = point.from;
		const sizeAttr = (axis + 'Size') as SizeAttr;
		const collapsableAttr = (axis + 'Collapsable') as CollapseAttr;
		const uncollapse = point[sizeAttr] == 2;
		if (!point[collapsableAttr] && !uncollapse) return;
		if (from) {
			const axisKey: number = axis == 'x' ? 0 : 1;
			if (Array.isArray(from[0])) {
				from = (from as Array<number[]>).map(subFrom => {
					subFrom = subFrom.slice();
					subFrom[axisKey] += 0.5 * (uncollapse ? 1 : -1);
					return subFrom;
				}) as LineFrom;
			} else {
				from = (from as number[]).slice();
				from[axisKey] += 0.5 * (uncollapse ? 1 : -1);
			}
		}
		const nextPoint = {
			...point,
			from,
			[sizeAttr]: uncollapse ? undefined : 2,
		} as LinePoint;
		handleUpdate(setLinePoint, coord, nextPoint);
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
				handleUpdate,
				handleEdit: handleUpdate ? handleEdit : undefined,
				handleDraw: setDrawing,
				handleTarget,
				handleXCollapse,
				handleYCollapse,
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
					style={{ zoom: `${zoom}%` }}
				>
					<LineLevels size={line.size} />
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
