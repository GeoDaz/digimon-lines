import { DragEvent } from 'react';

type Direction = 'row' | 'column';

const MAX_GHOST_LENGTH = 240;
const GAP = 3;

export const pointMainImage = (point: Element | null): HTMLImageElement | null =>
	point?.querySelector<HTMLImageElement>(
		'.line-point-safe-zone img.line-img:not(.line-skin)'
	) || null;

const isDrawable = (img: HTMLImageElement | null): img is HTMLImageElement =>
	!!img && img.complete && img.naturalWidth > 0;

export const setDragGhost = (
	e: DragEvent,
	images: (HTMLImageElement | null)[],
	options: { size: number; direction?: Direction; offset?: [number, number] }
): boolean => {
	const drawable = images.filter(isDrawable);
	if (!drawable.length || typeof document === 'undefined') return false;
	const { direction = 'row' } = options;
	const count = drawable.length;
	const size = Math.max(
		16,
		Math.min(options.size, (MAX_GHOST_LENGTH - GAP * (count - 1)) / count)
	);
	const length = count * size + (count - 1) * GAP;
	const width = direction === 'row' ? length : size;
	const height = direction === 'row' ? size : length;
	const ratio = window.devicePixelRatio || 1;

	const canvas = document.createElement('canvas');
	canvas.width = Math.ceil(width * ratio);
	canvas.height = Math.ceil(height * ratio);
	Object.assign(canvas.style, {
		position: 'fixed',
		top: '-10000px',
		left: '-10000px',
		width: `${width}px`,
		height: `${height}px`,
		pointerEvents: 'none',
	});
	const ctx = canvas.getContext('2d');
	if (!ctx) return false;
	ctx.scale(ratio, ratio);

	drawable.forEach((img, i) => {
		const x = direction === 'row' ? i * (size + GAP) : 0;
		const y = direction === 'row' ? 0 : i * (size + GAP);
		ctx.save();
		ctx.beginPath();
		if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, size, size, size * 0.1);
		else ctx.rect(x, y, size, size);
		ctx.clip();
		if (img.classList.contains('mirror')) {
			ctx.translate(x + size, y);
			ctx.scale(-1, 1);
			ctx.drawImage(img, 0, 0, size, size);
		} else {
			ctx.drawImage(img, x, y, size, size);
		}
		ctx.restore();
	});

	document.body.appendChild(canvas);
	const [offsetX, offsetY] = options.offset
		? [
				Math.min(Math.max(options.offset[0], 0), width),
				Math.min(Math.max(options.offset[1], 0), height),
			]
		: [size / 2, size / 2];
	e.dataTransfer.setDragImage(canvas, offsetX, offsetY);
	setTimeout(() => canvas.remove(), 0);
	return true;
};
