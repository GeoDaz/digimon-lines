import Line, { Axis, LineColumn, LineFrom, LinePoint, SizeAttr } from '@/types/Line';
import { levels as defaultLevels } from '@/consts/levels';
import { getLineLevels } from '@/functions/line';
// import { createSlice } from '@reduxjs/toolkit';

type CellShift = (pos: number[]) => number[];

/**
 * Recompute a point's `from` links so they keep pointing at the same absolute
 * cells, given how the point itself moves (deltaP) and how any linked cell
 * moves (targetShift). Shared by MOVE_LINE_POINT and column/row insert/remove.
 */
const centerOf = (point: LinePoint, pos: number[]): number[] => [
	pos[0] + (point.xSize == 2 ? 0.5 : 0),
	pos[1] + (point.ySize == 2 ? 0.5 : 0),
];

const samePos = (a: number[], b: number[]) =>
	Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9;

type CellOrigin = (center: number[]) => number[];

const remapPointFrom = (
	point: LinePoint,
	pointPos: number[],
	deltaP: number[],
	targetShift: CellShift,
	originOf: CellOrigin = center => center
): LinePoint => {
	const { from } = point;
	if (!from) return point;
	const pointCenter = centerOf(point, pointPos);
	const remap = (f: number[]): number[] => {
		const td = targetShift(originOf([pointCenter[0] + f[0], pointCenter[1] + f[1]]));
		return [f[0] + td[0] - deltaP[0], f[1] + td[1] - deltaP[1]];
	};
	const nextFrom =
		Array.isArray(from[0]) ?
			(from as number[][]).map(remap)
		:	remap(from as number[]);
	return { ...point, from: nextFrom as LineFrom };
};

/**
 * Apply a whole-grid shift (a column/row insertion or removal) to every point's
 * links, so links spanning the changed column/row stay anchored.
 */
const remapGridFrom = (columns: LineColumn[], shift: CellShift): LineColumn[] => {
	const cells: { center: number[]; origin: number[] }[] = [];
	columns.forEach((col, x) =>
		col.forEach((point, y) => {
			if (point && !Array.isArray(point)) {
				cells.push({ center: centerOf(point as LinePoint, [x, y]), origin: [x, y] });
			}
		})
	);
	const originOf: CellOrigin = center =>
		cells.find(cell => samePos(cell.center, center))?.origin || center;
	return columns.map((col, x) =>
		col.map((point, y) => {
			if (!point || Array.isArray(point)) return point;
			const pos = [x, y];
			return remapPointFrom(point as LinePoint, pos, shift(pos), shift, originOf);
		})
	);
};

const moveIndexShift = (from: number, to: number) => (pos: number): number => {
	const index = Math.floor(pos);
	if (index === from) return to - from;
	if (from < to && index > from && index <= to) return -1;
	if (to < from && index >= to && index < from) return 1;
	return 0;
};

const moveItem = <T>(items: T[], from: number, to: number): T[] => {
	const next = items.slice();
	const [item] = next.splice(from, 1);
	next.splice(to, 0, item);
	return next;
};

const insertedLevel =(levels: string[], at: number): string => {
	if (at === 0) return '';
	const index = defaultLevels.indexOf(levels[at - 1]);
	if (index < 0) return '';
	const next = defaultLevels[index + 1];
	return next && levels[at] !== next ? next : '';
};

export const SET_LINE = 'SET_LINE';
export const SET_LINE_VALUE = 'SET_LINE_VALUE';
export const SET_LINE_POINT = 'SET_LINE_POINT';
export const MOVE_LINE_POINT = 'MOVE_LINE_POINT';
export const SET_LINE_COLUMN = 'SET_LINE_COLUMN';
export const ADD_LINE_COLUMN = 'ADD_LINE_COLUMN';
export const REMOVE_LINE_COLUMN = 'REMOVE_LINE_COLUMN';
export const ADD_LINE_ROW = 'ADD_LINE_ROW';
export const REMOVE_LINE_ROW = 'REMOVE_LINE_ROW';
export const RESIZE_LINE_POINT = 'RESIZE_LINE_POINT';
export const MOVE_LINE_COLUMN = 'MOVE_LINE_COLUMN';
export const MOVE_LINE_ROW = 'MOVE_LINE_ROW';

export const defaultColumn = [null, null, null, null, null, null, null, null];
export const defaultLine: Line = {
	size: 8, // yLength ; xLength = line.columns.length
	columns: [
		defaultColumn,
		defaultColumn,
		defaultColumn,
		defaultColumn,
		defaultColumn,
		defaultColumn,
		defaultColumn,
		defaultColumn,
	],
};

export const setLineAction = (value: any) => ({ type: SET_LINE, value });
export const setLineValue = (name: string, value: any) => ({
	type: SET_LINE_VALUE,
	name,
	value,
});
export const setLinePoint = (coord: number[], value: any) => ({
	type: SET_LINE_POINT,
	coord,
	value,
});
export const moveLinePoint = (source: number[], target: number[]) => ({
	type: MOVE_LINE_POINT,
	source,
	target,
});
export const setLineColumn = (i: number, value: any) => ({
	type: SET_LINE_COLUMN,
	i,
	value,
});
export const addLineColumn = (x: number | undefined) => ({ type: ADD_LINE_COLUMN, i: x });
export const removeLineColumn = (x: number) => ({ type: REMOVE_LINE_COLUMN, i: x });
export const addLineRow = (y: number | undefined) => ({ type: ADD_LINE_ROW, i: y });
export const removeLineRow = (y: number) => ({ type: REMOVE_LINE_ROW, i: y });
export const moveLineColumn = (from: number, to: number) => ({
	type: MOVE_LINE_COLUMN,
	from,
	to,
});
export const moveLineRow = (from: number, to: number) => ({
	type: MOVE_LINE_ROW,
	from,
	to,
});
export const resizeLinePoint =(coord: number[], axis: Axis) => ({
	type: RESIZE_LINE_POINT,
	coord,
	axis,
});

const lineReducer = (line: Line = defaultLine, action: Record<string, any>): Line => {
	let columns;
	switch (action.type) {
		case SET_LINE:
			return action.value || line;

		case SET_LINE_VALUE:
			return { ...line, [action.name]: action.value };

		case SET_LINE_POINT:
			columns = line.columns.slice();
			columns[action.coord[0]] = columns[action.coord[0]].slice();
			columns[action.coord[0]][action.coord[1]] = action.value;
			return { ...line, columns };

		case MOVE_LINE_POINT: {
			const [sx, sy] = action.source;
			const [tx, ty] = action.target;
			if (sx === tx && sy === ty) return line;
			const sourcePoint = line.columns[sx]?.[sy] as LinePoint | null;
			if (!sourcePoint || Array.isArray(sourcePoint)) return line;
			const targetPoint = (line.columns[tx]?.[ty] as LinePoint | null) || null;
			if (Array.isArray(targetPoint)) return line;

			const dx = tx - sx;
			const dy = ty - sy;
			// Model the move as a grid shift where only the moved point (and the
			// swapped one, if any) move. remapGridFrom then fixes every point's
			// links: those leaving the moved point AND those targeting it.
			const displacement: CellShift = pos => {
				if (pos[0] === sx && pos[1] === sy) return [dx, dy];
				if (targetPoint && pos[0] === tx && pos[1] === ty) return [-dx, -dy];
				return [0, 0];
			};
			columns = remapGridFrom(line.columns, displacement);
			const movedSource = columns[sx][sy];
			const movedTarget = columns[tx][ty];
			columns[tx][ty] = movedSource;
			columns[sx][sy] = targetPoint ? movedTarget : null;
			return { ...line, columns };
		}

		case SET_LINE_COLUMN:
			columns = line.columns.slice();
			columns[action.i] = action.value;
			return { ...line, columns };

		case ADD_LINE_COLUMN: {
			if (action.i === undefined) {
				columns = line.columns.slice();
				columns.push(new Array(line.size).fill(null));
			} else {
				const at = action.i;
				// Cells at column >= at move one to the right.
				columns = remapGridFrom(line.columns, pos => [pos[0] >= at ? 1 : 0, 0]);
				columns.splice(at, 0, new Array(line.size).fill(null));
			}
			return { ...line, columns };
		}

		case REMOVE_LINE_COLUMN: {
			const at = action.i;
			// Cells at column > at move one to the left.
			columns = remapGridFrom(line.columns, pos => [pos[0] > at ? -1 : 0, 0]);
			columns.splice(at, 1);
			return { ...line, columns };
		}

		case ADD_LINE_ROW: {
			// Les libellés suivent leur ligne : on insère le libellé au même
			// rang que la ligne, sinon ceux du dessous décaleraient d'un cran.
			const levels = getLineLevels(line);
			const at = action.i === undefined ? line.size : action.i + 1;
			if (action.i === undefined) {
				columns = line.columns.map(col => {
					col = col.slice();
					col.push(null);
					return col;
				});
			} else {
				// Cells at row >= at move one down.
				columns = remapGridFrom(line.columns, pos => [0, pos[1] >= at ? 1 : 0]);
				columns.forEach((col: LineColumn) => col.splice(at, 0, null));
			}
			levels.splice(at, 0, insertedLevel(levels, at));
			return { ...line, columns, size: line.size + 1, levels };
		}

		case REMOVE_LINE_ROW: {
			const at = action.i;
			// Cells at row > at move one up.
			columns = remapGridFrom(line.columns, pos => [0, pos[1] > at ? -1 : 0]);
			columns.forEach((col: LineColumn) => col.splice(at, 1));
			const levels = getLineLevels(line).filter((level, i) => i !== at);
			return { ...line, columns, size: line.size - 1, levels };
		}

		case MOVE_LINE_COLUMN: {
			const { from, to } = action;
			if (from === to || !line.columns[from] || to < 0 || to >= line.columns.length) {
				return line;
			}
			const shift = moveIndexShift(from, to);
			columns = remapGridFrom(line.columns, pos => [shift(pos[0]), 0]);
			return { ...line, columns: moveItem(columns, from, to) };
		}

		case MOVE_LINE_ROW: {
			const { from, to } = action;
			if (from === to || from < 0 || to < 0 || from >= line.size || to >= line.size) {
				return line;
			}
			const shift = moveIndexShift(from, to);
			columns = remapGridFrom(line.columns, pos => [0, shift(pos[1])]).map(col =>
				moveItem(col, from, to)
			);
			const levels = moveItem(getLineLevels(line), from, to);
			return { ...line, columns, levels };
		}

		case RESIZE_LINE_POINT: {
			const [x, y] = action.coord;
			const point = line.columns[x]?.[y] as LinePoint | null;
			if (!point || Array.isArray(point)) return line;
			const axisKey = action.axis == 'x' ? 0 : 1;
			const sizeAttr = (action.axis + 'Size') as SizeAttr;
			const collapse = point[sizeAttr] == 2;
			const delta = [0, 0];
			delta[axisKey] = collapse ? -0.5 : 0.5;
			columns = remapGridFrom(line.columns, pos => (samePos(pos, [x, y]) ? delta : [0, 0]));
			columns[x][y] = {
				...(columns[x][y] as LinePoint),
				[sizeAttr]: collapse ? undefined : 2,
			};
			return { ...line, columns };
		}

		default:
			return line;
	}
};

// const lineSlice = createSlice({
// 	name: 'line',
// 	initialState: defaultLine,
// 	reducers: {
// 		setLine: (state: Line, { payload: line }) => line as Line,
// 		setLineValue: {
// 			reducer: (state: Line, { payload: { name, value } }) => {
// 				state[name as string] = value;
// 			},
// 			prepare: (name, value) => ({ payload: { name, value } }),
// 		},
// 	},
// });

export default lineReducer;
