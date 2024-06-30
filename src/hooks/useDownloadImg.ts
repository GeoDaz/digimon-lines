import { download } from '@/functions/file';
import { clearLine } from '@/functions/transformer/line';
import Line from '@/types/Line';
import { useState } from 'react';

const useDownloadImg = (line: Line, name: string | undefined) => {
	const [downloading, setDownloading] = useState<boolean>(false);
	const [error, setError] = useState<string | undefined>();

	const downloadImage = () => {
		setDownloading(true);
		let type: string = 'blob';
		const cleared = clearLine(line);
		fetch(process.env.NEXT_PUBLIC_PUPPETEER_URL + '/digimon-lines/build', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(cleared),
		})
			.then(res => {
				if (res.headers.get('Content-Type') == 'application/json') {
					type = 'json';
					return res.json();
				}
				if (!res.ok) throw new Error(res.statusText);
				return res.blob();
			})
			.then(res => {
				if (type == 'json') throw res;

				download(res, (name || 'line') + '.png');
				setDownloading(false);
				setError(undefined);
			})
			.catch(e => {
				console.error(e);
				if (e.message) {
					setError(e.message);
				}
				setDownloading(false);
			});
	};

	return { downloadImage, downloading, error };
};

export default useDownloadImg;
