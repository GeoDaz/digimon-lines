import React, { Fragment, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Line, LinePoint } from '@/types/Line';
import { levels } from '@/consts/levels';
import { makeClassName } from '@/functions';
import { setLineColumn } from '@/reducers/lineReducer';
import { GridContext } from '@/context/grid';
import LinePointSettings from './LinePointSettings';
import LineGridPoint from './LineGridPoint';

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

	const handleTarget = (coord: number[]) => {
		if (!handleUpdate || !drawing) return;
		const from = [coord[0] - drawing[0], coord[1] - drawing[1]];
		const nextPoint = {
			...line.columns[drawing[0]][drawing[1]],
		} as LinePoint;
		if (nextPoint.from) {
			nextPoint.from2 = from;
		} else {
			nextPoint.from = from;
		}
		handleUpdate(setLineColumn, drawing, nextPoint);
		setDrawing(undefined);
	};

	return (
		<GridContext.Provider
			value={{
				drawing,
				handleUpdate,
				handleEdit: handleUpdate ? edit : undefined,
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
					handleVoid={() => edit(undefined)}
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
								line.size >= i + 1 && (
									<div key={i} className="level">
										<span>{level}</span>
									</div>
								)
						)}
					</div>
					{line.columns.map((column, i) => (
						<LineRow key={i} x={i} list={column} />
					))}
				</div>
			</div>
		</GridContext.Provider>
	);
};

interface RowProps {
	list: Array<LinePoint | LinePoint[] | null> | undefined;
	x: number;
}
const LineRow: React.FC<RowProps> = ({ list, x }) => {
	if (!list) return null;
	return (
		<Row className="line-row">
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
