/** Line width above which an array is written on several lines. */
const PRINT_WIDTH = 89;
/** A tab counts as 4 columns when measuring a line width. */
const TAB_WIDTH = 4;

const columnsOf = (indentation: string) =>
	indentation.replace(/\t/g, ' '.repeat(TAB_WIDTH)).length;

/**
 * Single line form of a value, or null when it has to be written on several
 * lines. Objects are only inlined when the file already writes them that way,
 * the same rule the formatter of the project follows.
 */
const inlineJson = (value: any, previous: string): string | null => {
	if (Array.isArray(value)) {
		const items = value.map(item => inlineJson(item, previous));
		if (items.some(item => item === null)) return null;
		return `[${items.join(', ')}]`;
	}

	if (value && typeof value == 'object') {
		const entries = Object.entries(value).filter(([, item]) => item !== undefined);
		if (!entries.length) return '{}';
		const fields = entries.map(([key, item]) => {
			const inlined = inlineJson(item, previous);
			return inlined === null ? null : `${JSON.stringify(key)}: ${inlined}`;
		});
		if (fields.some(field => field === null)) return null;
		const inlined = `{ ${fields.join(', ')} }`;
		return previous.includes(inlined) ? inlined : null;
	}

	return JSON.stringify(value) ?? 'null';
};

const writeJson = (
	value: any,
	indent: string,
	level: number,
	column: number,
	previous: string
): string => {
	const inlined = inlineJson(value, previous);
	if (inlined !== null) {
		// Primitives and inlined objects always fit, arrays have to be short enough.
		if (!value || typeof value != 'object' || column + inlined.length <= PRINT_WIDTH) {
			return inlined;
		}
	}

	const pad = indent.repeat(level);
	const padIn = indent.repeat(level + 1);
	const inColumn = columnsOf(padIn);

	if (Array.isArray(value)) {
		const items = value.map(
			item => padIn + writeJson(item, indent, level + 1, inColumn, previous)
		);
		return `[\n${items.join(',\n')}\n${pad}]`;
	}

	const entries = Object.entries(value).filter(([, item]) => item !== undefined);
	if (!entries.length) return '{}';
	const fields = entries.map(([key, item]) => {
		const prefix = `${JSON.stringify(key)}: `;
		const written = writeJson(
			item,
			indent,
			level + 1,
			inColumn + prefix.length,
			previous
		);
		return padIn + prefix + written;
	});
	return `{\n${fields.join(',\n')}\n${pad}}`;
};

/**
 * Serialize `value` following the formatting of the file it is written to
 * (indentation, line endings, inlined objects, trailing new line), so a save
 * from the site does not rewrite the whole file. Used by the dev only APIs.
 */
export const formatJsonLike = (value: any, previous = ''): string => {
	const indent = previous.match(/\n([ \t]+)["{[]/)?.[1] || '\t';
	const eol = previous.includes('\r\n') ? '\r\n' : '\n';
	const content = writeJson(value, indent, 0, 0, previous).replace(/\n/g, eol);
	return previous && !previous.endsWith('\n') ? content : content + eol;
};
