import React, { Fragment, useContext, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { Line, LinePoint } from '@/types/Line';
import { levels } from '@/consts/levels';
import { makeClassName } from '@/functions';
import { addLineColumn, removeLineColumn, setLineColumn } from '@/reducers/lineReducer';
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
		const from = [target[0] - source[0], target[1] - source[1]];
		const nextPoint = {
			...line.columns[source[0]][source[1]],
		} as LinePoint;
		if (!nextPoint.from) nextPoint.from = [];
		(nextPoint.from as Array<number[]>).push(from);
		handleUpdate(setLineColumn, source, nextPoint);
		setDrawing(undefined);
	};

	const handleEdit = (coord: number[]) => {
		edit(coord);
		if (drawing) setDrawing(undefined);
	};

	return (
		<GridContext.Provider
			value={{
				drawing,
				handleUpdate,
				handleEdit: handleUpdate ? handleEdit : undefined,
				handleDraw: setDrawing,
				handleTarget,
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
						<LineRow key={i} x={i} list={column} />
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
	list: Array<LinePoint | LinePoint[] | null> | undefined;
	x: number;
	y?: number; // for sub rows
}
const LineRow: React.FC<RowProps> = ({ list, x, y }) => {
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

	if (!list) return null;
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
			{list.map((point, i) => {
				if (Array.isArray(point)) {
					return (
						<Fragment key={i}>
							<LineRow
								x={x}
								// subX={i}
								list={point}
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
