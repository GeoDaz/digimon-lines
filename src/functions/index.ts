export const makeClassName = (...classList: any[]): string =>
	classList.reduce((classList, className) => {
		if (!className) return classList;
		if (Array.isArray(className)) className = makeClassName(className);
		if (!classList) return className;
		return classList + ' ' + className;
	}, '');

export const capitalize = (string: string): string =>
	string[0].toUpperCase() + string.slice(1);

export const objectToGETparams = (
	object: object,
	baseParams: string = '',
	parentKey: string
): string => {
	return Object.entries(object).reduce((params, [key, value]) => {
		if (value === undefined) return params;
		if (typeof value === 'object' && !Array.isArray(value)) {
			return objectToGETparams(value, params, key);
		}
		if (parentKey) {
			key = `${parentKey}[${key}]`;
		}
		return `${params}${params ? '&' : '?'}${key}=${encodeURIComponent(value)}`;
	}, baseParams);
};
