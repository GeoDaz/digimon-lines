import Line, { LineFound, LinePoint, LineThumb } from '@/types/Line';

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
				if (Array.isArray(first)) {
					col[0] = first.map(point => point && { ...point, from: null });
				} else {
					col[0] = { ...first, from: null };
				}
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
		line.columns.forEach((column: Array<LinePoint | LinePoint[] | null>) => {
			column.forEach((point: LinePoint | LinePoint[] | null) => {
				if (Array.isArray(point)) {
					point.forEach((subPoint: LinePoint | null) => {
						if (subPoint) {
							result.push(subPoint.name);
						}
					});
				} else if (point) {
					result.push(point.name);
				}
			});
		});
	}
	return result;
};

export const foundLines = (
	search: string,
	searchList: { [key: string]: string[] }
): LineFound[] =>
	Object.entries(searchList).reduce((result, [digimon, lines]) => {
		let index = digimon.indexOf(search);
		if (index > -1) {
			let priority: number = index * -1;
			priority -= Math.abs(digimon.length - search.length);
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

export default transformLine;
