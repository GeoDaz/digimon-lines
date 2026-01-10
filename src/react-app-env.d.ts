/// <reference types="react-scripts" />

declare module 'dom-to-image-more' {
	const domtoimage: {
		toPng: (node: Node, options?: object) => Promise<string>;
		toJpeg: (node: Node, options?: object) => Promise<string>;
		toBlob: (node: Node, options?: object) => Promise<Blob>;
		toSvg: (node: Node, options?: object) => Promise<string>;
		toPixelData: (node: Node, options?: object) => Promise<Uint8ClampedArray>;
	};
	export default domtoimage;
}
