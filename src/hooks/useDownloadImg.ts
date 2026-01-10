import { useState } from 'react';
import { downloadFromUrl, formatFileName } from '@/functions/file';
import Line from '@/types/Line';
import { gridSpacing, xUnit, yUnit } from '@/components/Line/LineSvg';

const useDownloadImg = (
	name: string | undefined
): {
	downloadImage: (line: Line) => Promise<void>;
	downloading: boolean;
	error: string | undefined;
} => {
	const [downloading, setDownloading] = useState<boolean>(false);
	const [error, setError] = useState<string | undefined>();

	const downloadImage = async (line: Line) => {
		setDownloading(true);
		setError(undefined);

		try {
			const domtoimage = (await import('dom-to-image-more')).default;

			const node = document.querySelector('.line-wrapper') as HTMLElement | null;
			if (!node) {
				throw new Error('Element .frame non trouvé');
			}

			node.classList.add('captured');

			await preLoadImages(node);
			const xCases = line.columns.length;
			const yCases = line.size;

			const dataUrl = await domtoimage.toPng(node, {
				quality: 1,
				width: 66 + gridSpacing * 1.5 + xUnit * xCases,
				height: gridSpacing * 1.5 + yUnit * yCases,
				style: { overflow: 'visible' },
			});

			const filename = formatFileName((name || 'line') + '.png');
			downloadFromUrl(dataUrl, filename);

			node.classList.remove('captured');
			setDownloading(false);
		} catch (err) {
			console.error({ err });
			if (err instanceof Error) {
				setError(err.message);
			}
			setDownloading(false);
		}
	};

	return { downloadImage, downloading, error };
};

const preLoadImages = async (node: Element): Promise<void> => {
	const imgs = Array.from(node.querySelectorAll('img'));
	for (const img of imgs) {
		const src = img.src;
		if (!src.startsWith('data:')) {
			try {
				const response = await fetch(src);
				const blob = await response.blob();
				const dataUrl = await new Promise<string>(resolve => {
					const reader = new FileReader();
					reader.onloadend = () => resolve(reader.result as string);
					reader.readAsDataURL(blob);
				});
				img.src = dataUrl;
			} catch (err) {
				console.error({ err });
			}
		}
	}
};

export default useDownloadImg;
