/**
 * Serialize `value` following the formatting of the file it is written to
 * (indentation, line endings, trailing new line), so a save from the site does
 * not rewrite the whole file. Used by the dev only APIs.
 */
export const formatJsonLike = (value: any, previous = ''): string => {
	const indent = previous.match(/\n([ \t]+)["{[]/)?.[1] || '\t';
	const eol = previous.includes('\r\n') ? '\r\n' : '\n';
	const content = JSON.stringify(value, null, indent).replace(/\n/g, eol);
	return previous && !previous.endsWith('\n') ? content : content + eol;
};
