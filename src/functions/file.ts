import fs from 'fs';

export const getDirPaths = (dir: string): string[] => {
	return fs.readdirSync(`./public/json/${dir}/`).map(path => path.split('.')[0]);
};
