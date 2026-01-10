import fs from 'fs';

declare global {
	interface Navigator {
		msSaveBlob?: (blob: any, defaultName?: string) => boolean;
	}
}

export const getDirPaths = (dir: string): string[] => {
	return fs.readdirSync(`./public/${dir}/`).map(path => path.split('.')[0]);
};

export const formatFileName = (string: string) =>
	string.replace(/\/+/g, '-').replace(/:+/g, '');

export const formatPokemonFileName = (string: string) =>
	string
		.normalize('NFD')
		.replace(/(\s+)/g, '-')
		.replace(/[.'’:?%\u0300-\u036f]|-(t|T)otem|-(a|A)ntique/g, '')
		.toLowerCase();

export const downloadFile = (blob: Blob | File, filename: string) => {
	filename = formatFileName(filename);
	if (window.navigator && window.navigator.msSaveBlob !== undefined) {
		window.navigator.msSaveBlob(blob, filename);
	} else {
		const url = URL.createObjectURL(blob);
		downloadFromUrl(url, filename);
		window.URL.revokeObjectURL(url);
	}
};

export const downloadFromUrl = (url: string, filename: string) => {
	const a = document.createElement('a');
	a.style.display = 'none';
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
};

export const createFile = (
	content: string,
	contentType: string = 'application/json'
): Blob => new Blob([content], { type: contentType });
