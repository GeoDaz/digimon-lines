import Line, {
	LineColumn,
	LineFound,
	LinePoint,
	LineSkin,
	LineThumb,
} from '@/types/Line';
import { levels as defaultLevels } from '@/consts/levels';
import { getSearchPriority } from './search';
import { byteSize, isUploadedImage } from './images';
import { StringArrayObject } from '@/types/Ui';

export const skinName = (skin: LineSkin): string =>
	typeof skin === 'string' ? skin : skin.name;

export const skinImage = (skin: LineSkin): string | undefined =>
	typeof skin === 'string' ? undefined : skin.image;

export const transformLine = (line: Line | undefined): Line | undefined => {
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
					return point;
				}
				if (point.from?.[0] && !Array.isArray(point.from[0])) {
					point = { ...point, from: [point.from] } as LinePoint;
				}
				if (point.color && !Array.isArray(point.color)) {
					if (!point.from || point.from.length === 0) {
						point.from = [[0, -1]];
					}
					point = {
						...point,
						color: Array.from(
							{ length: point.from?.length },
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

export const getLineLevels = (line: Line): string[] =>
	Array.from(
		{ length: line.size },
		(_, i) => line.levels?.[i] ?? defaultLevels[i] ?? ''
	);

export const prepareLineExport = (line: Line): Line => {
	const cleanColumns = line.columns.map(col =>
		col.map((point: LinePoint | null) => {
			if (!point) return point;
			const { xCollapsable, yCollapsable, ...rest } = point;
			return { ...rest };
		})
	);
	return { ...line, columns: cleanColumns };
};

export interface LineUploadedImage {
	/** Nom du point, ou du skin, qui porte l'image. */
	name: string;
	/** Poids du data URI dans le JSON de la ligne. */
	bytes: number;
}

/**
 * Images uploadées (data URI) contenues dans une ligne, point principal et
 * skins confondus. Une ligne peut en avoir hérité d'un import de fichier JSON
 * ou d'une version antérieure aux limites de poids.
 */
export const getLineUploadedImages = (line: Line): LineUploadedImage[] => {
	const images: LineUploadedImage[] = [];
	line.columns.forEach((column: LineColumn) => {
		column.forEach((point: LinePoint | null) => {
			if (!point) return;
			if (isUploadedImage(point.image)) {
				images.push({ name: point.name, bytes: byteSize(point.image as string) });
			}
			point.skins?.forEach(skin => {
				const image = skinImage(skin);
				if (isUploadedImage(image)) {
					images.push({
						name: skinName(skin),
						bytes: byteSize(image as string),
					});
				}
			});
		});
	});
	return images;
};

/**
 * Poids du JSON de la ligne tel qu'il sera écrit en base, c'est-à-dire après la
 * même sérialisation que l'export.
 */
export const getLineDataBytes = (line: Line): number =>
	byteSize(JSON.stringify(prepareLineExport(line)));

/**
 * Retire les images uploadées (data URI) d'une ligne, sans toucher aux images
 * fournies par URL.
 *
 * Un base64 pèse des dizaines de Ko dans le JSON et saturerait vite le
 * stockage : on ne le garde pas en base. L'upload reste libre dans le builder,
 * car ces images sont les seules qui fonctionnent avec l'export « Save as
 * Image ». Un point dont l'image est retirée retombe simplement sur l'image du
 * Digimon correspondant.
 *
 * Purement fonctionnel : la ligne d'origine n'est pas modifiée, le builder
 * garde donc ses images à l'écran après la sauvegarde.
 */
export const stripUploadedImages = (line: Line): Line => {
	if (!getLineUploadedImages(line).length) return line;

	const cleanSkin = (skin: LineSkin): LineSkin => {
		if (typeof skin === 'string' || !isUploadedImage(skin.image)) return skin;
		const { image, ...rest } = skin;
		return rest;
	};

	return {
		...line,
		columns: line.columns.map(column =>
			column.map(point => {
				if (!point) return point;
				const cleaned: LinePoint = { ...point };
				if (isUploadedImage(cleaned.image)) delete cleaned.image;
				if (cleaned.skins) cleaned.skins = cleaned.skins.map(cleanSkin);
				return cleaned;
			})
		),
	};
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
