import Line, { LineColumn, LineFound, LinePoint, LineThumb } from '@/types/Line';
import { getSearchPriority } from './search';
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
			col = col.map((point: LinePoint | null, i) => {
				if (!point) return point;
				if (i === 0) {
					point = { ...point, from: null };
				}
				if (point.from?.[0] && !Array.isArray(point.from[0])) {
					point = { ...point, from: [point.from] } as LinePoint;
				}
				if (point.color && !Array.isArray(point.color)) {
					point = {
						...point,
						color: Array.from(
							{ length: point.from?.length || 1 },
							() => point!.color
						),
					} as LinePoint;
				}
				return point;
			});

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

export const clearLine = (line: Line): Line => {
	const columns = line.columns.map(col =>
		col.map(point => {
			if (point?.image) {
				return { ...point, image: undefined };
			}
			return point;
		})
	);
	return { ...line, columns };
};

export const thumbsToNames = (lines: Array<LineThumb | string>): string[] =>
	lines.map(line => (typeof line === 'string' ? line : line.name));

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
			const foundLine = lines.map(line => ({
				name: line,
				found: digimon,
				priority,
			})) as LineFound[];
			result = result.concat(foundLine);
		}
		return result;
	}, [] as LineFound[]);

export const filterlinesFound = (
	lines: LineThumb[],
	foundList: LineFound[]
): LineThumb[] =>
	lines.reduce((result: LineThumb[], line) => {
		let found: boolean = false;
		foundList.forEach(el => {
			if (el.name === line.name) {
				if (!line.found || el.priority > line.found.priority) {
					line = { ...line, found: el, for: el.name };
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
			const nextXPoint = nextCol && nextCol[j];
			point.xCollapsable = !!(
				point &&
				point.xSize != 2 &&
				nextCol &&
				(!nextXPoint || nextXPoint.xSize == 2)
			);
			const nextYPoint = col[j + 1];
			point.yCollapsable = !!(
				point &&
				point.ySize != 2 &&
				(!nextYPoint || nextYPoint.ySize == 2)
			);
		});
	});
	return line;
};

export default transformLine;
