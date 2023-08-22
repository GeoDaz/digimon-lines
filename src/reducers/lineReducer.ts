import Line from '@/types/Line';

export const SET_LINE = 'SET_LINE';
export const SET_VALUE = 'SET_VALUE';
export const SET_COLUMN = 'SET_COLUMN';
export const ADD_COLUMN = 'ADD_COLUMN';

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
	type: SET_VALUE,
	name,
	value,
});
export const setLineColumn = (coord: number[], value: any) => ({
	type: SET_COLUMN,
	coord,
	value,
});
export const addLineColumn = () => ({ type: ADD_COLUMN });

const lineReducer = (line: Line = defaultLine, action: Record<string, any>) => {
	let columns;
	switch (action.type) {
		case SET_LINE:
			return action.value || line;
		case SET_VALUE:
			return { ...line, [action.name]: action.value } || line;
		case SET_COLUMN:
			columns = line.columns.slice();
			columns[action.coord[0]] = columns[action.coord[0]].slice();
			columns[action.coord[0]][action.coord[1]] = action.value;
			return { ...line, columns } || line;
		case ADD_COLUMN:
			columns = line.columns.slice();
			columns.push(defaultColumn);
			return { ...line, columns } || line;
		default:
			return line;
	}
};
export default lineReducer;
