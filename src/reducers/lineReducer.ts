import Line from '@/types/Line';

export const SET_LINE = 'SET_LINE';
export const SET_LINE_VALUE = 'SET_LINE_VALUE';
export const SET_LINE_POINT = 'SET_LINE_POINT';
export const SET_LINE_COLUMN = 'SET_LINE_COLUMN';
export const ADD_LINE_COLUMN = 'ADD_LINE_COLUMN';
export const REMOVE_LINE_COLUMN = 'REMOVE_LINE_COLUMN';

export const defaultColumn = [null, null, null, null, null, null, null, null];
export const defaultLine: Line = {
	title: undefined,
	size: 8,
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
export const setLineColumn = (i: number, value: any) => ({
	type: SET_LINE_COLUMN,
	i,
	value,
});
export const addLineColumn = (i: number | undefined) => ({ type: ADD_LINE_COLUMN, i });
export const removeLineColumn = (i: number) => ({ type: REMOVE_LINE_COLUMN, i });

const lineReducer = (line: Line = defaultLine, action: Record<string, any>) => {
	let columns;
	switch (action.type) {
		case SET_LINE:
			return action.value || line;
		case SET_LINE_VALUE:
			return { ...line, [action.name]: action.value } || line;
		case SET_LINE_POINT:
			columns = line.columns.slice();
			columns[action.coord[0]] = columns[action.coord[0]].slice();
			columns[action.coord[0]][action.coord[1]] = action.value;
			return { ...line, columns } || line;
		case SET_LINE_COLUMN:
			columns = line.columns.slice();
			columns[action.i] = action.value;
			return { ...line, columns } || line;
		case ADD_LINE_COLUMN:
			columns = line.columns.slice();
			if (action.i === undefined) {
				columns.push(defaultColumn);
			} else {
				columns.splice(action.i, 0, defaultColumn);
			}
			return { ...line, columns } || line;
		case REMOVE_LINE_COLUMN:
			columns = line.columns.slice();
			columns.splice(action.i, 1);
			return { ...line, columns } || line;
		default:
			return line;
	}
};
export default lineReducer;
