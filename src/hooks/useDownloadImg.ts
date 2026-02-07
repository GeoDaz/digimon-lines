import { useState } from 'react';
import { downloadFromUrl, formatFileName } from '@/functions/file';
import Line from '@/types/Line';
import { DEFAULT_ZOOM } from '@/consts/zooms';
import { makeZoomContext } from '@/context/zoom';

const useDownloadImg = (name: string | undefined) => {
	const [downloading, setDownloading] = useState<boolean>(false);
	const [error, setError] = useState<string | undefined>();

	const downloadImage = async (line: Line, zoom: number = DEFAULT_ZOOM) => {
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
			await waitForNextPaint();

			const xCases = line.columns.length;
			const yCases = line.size;
			const { zoomFactor, gridSpacing, unit } = makeZoomContext(zoom);

			const dataUrl = await domtoimage.toPng(node, {
				quality: 1,
				width: 66 * zoomFactor + gridSpacing * 1.5 + unit * xCases,
				height: gridSpacing * 1.5 + unit * yCases,
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

	await Promise.all(
		imgs.map(async img => {
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
					await img.decode();
				} catch (err) {
					console.error({ err });
				}
			} else {
				try {
					await img.decode();
				} catch {
					// image déjà chargée ou non décodable
				}
			}
		})
	);
};

/** Attend le prochain cycle de peinture du navigateur */
const waitForNextPaint = (): Promise<void> =>
	new Promise(resolve =>
		requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
	);

export default useDownloadImg;
