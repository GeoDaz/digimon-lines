import Line, { LineColumn, LineFound, LinePoint, LineThumb } from '@/types/Line';
import { getSearchPriority } from '..';
import { StringArrayObject } from '@/types/Ui';

const transformLine = (line: Line | undefined): Line | undefined => {
	if (line) {
		let size = 6;
		line.columns.forEach(column => {
			if (column.length > size) {
				size = column.length;
			}
		});
		const columns = line.columns.map(col => {
			col = col.slice();
			let first = col[0];
			if (first) {
				col[0] = { ...first, from: null };
			}
			while (col.length < size) {
				col.push(null);
			}
			return col;
		});
		line = {
			...line,
			size,
			columns,
		};
	}
	return line;
};

export const lineToArray = (line: Line | undefined): string[] => {
	const result: string[] = [];
	if (line) {
		line.columns.forEach((column: LineColumn) => {
			column.forEach((point: LinePoint | null) => {
				if (point) {
					result.push(point.name);
				}
			});
		});
	}
	return result;
};

export const foundLines = (search: string, searchList: StringArrayObject): LineFound[] =>
	Object.entries(searchList).reduce((result, [digimon, lines]) => {
		const priority = getSearchPriority(search, digimon);
		if (priority != null) {
			result = result.concat(
				lines.map(
					line =>
						({
							name: line,
							found: digimon,
							priority,
						} as LineFound)
				)
			);
		}
		return result;
	}, [] as LineFound[]);

export const filterlinesFound = (
	lines: LineThumb[],
	foundList: LineFound[]
): LineThumb[] =>
	lines.reduce((result: LineThumb[], line: LineThumb) => {
		let found: boolean = false;
		foundList.forEach((el: LineFound) => {
			if (el.name === line.name) {
				if (!line.found || el.priority > line.found.priority) {
					line = { ...line, found: el };
					found = true;
				}
			}
		});
		if (found) result.push(line);
		return result;
	}, [] as LineThumb[]);

export const areCollapsablePoints = (line: Line): Line => {
	line.columns.forEach((col: LineColumn, i) => {
		col.forEach((point, j) => {
			if (!point) return;
			const nextCol = line.columns[i + 1];
			const nextPoint = nextCol && nextCol[j];
			point.collapsable = !!(
				point &&
				point.size != 2 &&
				nextCol &&
				(!nextPoint || nextPoint.size == 2)
			);
		});
	});
	return line;
};

export default transformLine;
