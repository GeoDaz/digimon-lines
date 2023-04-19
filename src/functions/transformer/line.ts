import Line from '@/types/Line';

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
export default transformLine;
