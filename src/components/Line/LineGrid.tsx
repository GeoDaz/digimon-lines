import React, { Fragment, useContext, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { Line, LineColumn, LineFrom, LinePoint } from '@/types/Line';
import { levels } from '@/consts/levels';
import { makeClassName } from '@/functions';
import { addLineColumn, removeLineColumn, setLinePoint } from '@/reducers/lineReducer';
import { GridContext } from '@/context/grid';
import LinePointSettings from './LinePointSettings';
import LineGridPoint from './LineGridPoint';
import LineAddRow from './LineAddRow';
import Icon from '../Icon';

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
		if (target[1] > drawing[1]) {
			source = target;
			target = drawing;
		}
		const sourcePoint: LinePoint | null = line.columns[source[0]][source[1]];
		const targetPoint: LinePoint | null = line.columns[target[0]][target[1]];
		if (!sourcePoint || !targetPoint) return;
		const double = sourcePoint.size == 2;
		const doubleTarget = targetPoint.size == 2;
		const from: LineFrom = [
			target[0] - source[0] - (double ? 0.5 : 0) + (doubleTarget ? 0.5 : 0),
			target[1] - source[1],
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

	const handleCollapse = (coord: number[]) => {
		const point: LinePoint | null = line.columns[coord[0]][coord[1]];
		if (!handleUpdate || !point) return;
		let from: LineFrom | undefined = point.from;
		const uncollapse = point.size == 2;
		if (!point.collapsable && !uncollapse) return;
		if (from) {
			if (Array.isArray(from[0])) {
				from = (from as Array<number[]>).map(subFrom => {
					subFrom = subFrom.slice();
					subFrom[0] += 0.5 * (uncollapse ? 1 : -1);
					return subFrom;
				}) as LineFrom;
			} else {
				from = (from as number[]).slice();
				from[0] += 0.5 * (uncollapse ? 1 : -1);
			}
		}
		const nextPoint = {
			...point,
			from,
			size: uncollapse ? undefined : 2,
		} as LinePoint;
		handleUpdate(setLinePoint, coord, nextPoint);
	};

	return (
		<GridContext.Provider
			value={{
				drawing,
				handleUpdate,
				handleEdit: handleUpdate ? handleEdit : undefined,
				handleDraw: setDrawing,
				handleTarget,
				handleCollapse,
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
					<div className="levels">
						{levels.map(
							(level, i) =>
								!line.size ||
								(line.size >= i + 1 && (
									<div key={i} className="level">
										<span>{level}</span>
									</div>
								))
						)}
					</div>
					{line.columns.map((column, i) => (
						<LineRow key={i} x={i} column={column} />
					))}
					{!!handleUpdate && (
						<LineAddRow handleUpdate={handleUpdate} length={line.size} />
					)}
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
							<LineRow
								x={x}
								// subX={i}
								column={point}
							/>
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

export default React.memo(LineGrid);
