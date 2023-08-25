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

export const download = (blob: Blob | File, filename: string) => {
	filename = formatFileName(filename);
	if (window.navigator && window.navigator.msSaveBlob !== undefined) {
		window.navigator.msSaveBlob(blob, filename);
	} else {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}
};

export const createFile = (
	content: string,
	contentType: string = 'application/json'
): Blob => new Blob([content], { type: contentType });

// Not working
// export const screenshot = async () => {
// 	const el = document.body;
// 	html2canvas(el).then(canvas => {
// 		canvas.toBlob(blob => {
// 			if (!blob) return;
// 			download(blob, 'screenshot.png');
// 		});
// 	});
// };

// make a hook to set a loader
// should ask for permission to record screen...
// export const capture = async () => {
// 	const canvas = document.createElement('canvas');
// 	const context = canvas.getContext('2d');
// 	const video = document.createElement('video');
// 	if (context === null) return;
// 	try {
// 		const captureStream = await navigator.mediaDevices.getDisplayMedia();
// 		video.srcObject = captureStream;
// 		context.drawImage(video, 0, 0, window.innerWidth, window.innerHeight);
// 		const frame = canvas.toDataURL('image/png');
// 		captureStream.getTracks().forEach(track => track.stop());
// 		const blob = await (await fetch(frame)).blob();
// 		download(blob, 'screenshot.png');
// 	} catch (err) {
// 		console.error('Error: ' + err);
// 	}
// };
