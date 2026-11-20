export type CardPattern = 'none' | 'hexagons' | 'sparkles' | 'bubbles' | 'diamonds';

export interface CardCanvasOptions {
	colors: string[];
	pattern: CardPattern;
	seed: number;
	width: number;
	background?: HTMLImageElement | null;
}

export const CARD_COLORS: Record<string, string> = {
	Red: '#e8243a',
	Blue: '#1e90e6',
	Yellow: '#f5c400',
	Green: '#13a86b',
	Black: '#121218',
	Purple: '#8a4fd0',
	White: '#d9dce4',
};

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export const isColorValue = (value: unknown): value is string =>
	typeof value === 'string' && (!!CARD_COLORS[value] || HEX_COLOR.test(value));

export const resolveColor = (value?: string | null): string | null =>
	!value ? null
	: CARD_COLORS[value] ? CARD_COLORS[value]
	: HEX_COLOR.test(value) ? value.toLowerCase()
	: null;

const MAX_CARD_WIDTH = 640;
const MIN_CARD_WIDTH = 400;
const CARD_RATIO = 600 / 430;
const PADDING = 70;
const GAP = 36;
const VERTICAL_MARGIN = 110;
const MIN_COLUMNS = 3;
const REFERENCE_AREA = 2000 * 660;

export const PREVIEW_SCALE = 320 / MAX_CARD_WIDTH;

export const cardLayout = (count: number, availableWidth: number) => {
	const total = Math.max(count, 1);
	const span = (n: number, width: number) => n * width + GAP * (n - 1);
	const canvasWidth = Math.round(
		Math.max(availableWidth, span(MIN_COLUMNS, MIN_CARD_WIDTH) + PADDING * 2)
	);
	const inner = canvasWidth - PADDING * 2;
	const columns = Math.min(total, Math.max(1, Math.floor((inner + GAP) / (MIN_CARD_WIDTH + GAP))));
	const width = Math.min(MAX_CARD_WIDTH, (inner - GAP * (columns - 1)) / columns);
	const height = width * CARD_RATIO;
	const rows = Math.ceil(total / columns);
	const canvasHeight = Math.round(rows * height + GAP * (rows - 1) + VERTICAL_MARGIN * 2);
	const left = (canvasWidth - span(columns, width)) / 2;
	return {
		canvasWidth,
		canvasHeight,
		width,
		height,
		positions: Array.from({ length: total }, (_, i) => ({
			x: left + (i % columns) * (width + GAP),
			y: VERTICAL_MARGIN + Math.floor(i / columns) * (height + GAP),
		})),
	};
};

const random = (seed: number) => {
	let state = seed >>> 0 || 1;
	return () => {
		state = (state * 1664525 + 1013904223) >>> 0;
		return state / 4294967296;
	};
};

const hexToRgb = (hex: string) => {
	const value = parseInt(hex.replace('#', ''), 16);
	return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const mix = (hex: string, target: string, amount: number) => {
	const a = hexToRgb(hex);
	const b = hexToRgb(target);
	return `#${a
		.map((v, i) => Math.round(v + (b[i] - v) * amount).toString(16).padStart(2, '0'))
		.join('')}`;
};

const rgba = (hex: string, alpha: number) => {
	const [r, g, b] = hexToRgb(hex);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const luminance = (hex: string) => {
	const [r, g, b] = hexToRgb(hex);
	return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

const lightening = (color: string) => (luminance(color) < 0.12 ? 0.04 : 0.28);

const drawGradient = (
	ctx: CanvasRenderingContext2D,
	colors: string[],
	width: number,
	height: number
) => {
	const gradient = ctx.createLinearGradient(0, 0, width, 0);
	const stops = colors.length > 1 ? colors : [colors[0], colors[0]];
	stops.forEach((color, i) => {
		gradient.addColorStop(i / (stops.length - 1), mix(color, '#ffffff', lightening(color)));
	});
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, width, height);

	const depth = ctx.createLinearGradient(0, 0, 0, height);
	depth.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
	depth.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
	depth.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
	ctx.fillStyle = depth;
	ctx.fillRect(0, 0, width, height);
};

const hexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
	ctx.beginPath();
	for (let i = 0; i < 6; i++) {
		const angle = (Math.PI / 3) * i + Math.PI / 6;
		const px = x + r * Math.cos(angle);
		const py = y + r * Math.sin(angle);
		if (i === 0) ctx.moveTo(px, py);
		else ctx.lineTo(px, py);
	}
	ctx.closePath();
};

const sparkle = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
	ctx.beginPath();
	for (let i = 0; i < 8; i++) {
		const radius = i % 2 === 0 ? r : r * 0.22;
		const angle = (Math.PI / 4) * i - Math.PI / 2;
		const px = x + radius * Math.cos(angle);
		const py = y + radius * Math.sin(angle);
		if (i === 0) ctx.moveTo(px, py);
		else ctx.lineTo(px, py);
	}
	ctx.closePath();
};

const diamond = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
	ctx.beginPath();
	ctx.moveTo(x, y - r);
	ctx.lineTo(x + r * 0.7, y);
	ctx.lineTo(x, y + r);
	ctx.lineTo(x - r * 0.7, y);
	ctx.closePath();
};

const drawPattern = (
	ctx: CanvasRenderingContext2D,
	pattern: CardPattern,
	colors: string[],
	width: number,
	height: number,
	seed: number
) => {
	if (pattern === 'none') return;
	const next = random(seed);
	const base = pattern === 'bubbles' ? 26 : 34;
	const count = Math.max(Math.round(base / 2), Math.round((base * width * height) / REFERENCE_AREA));
	ctx.save();
	for (let i = 0; i < count; i++) {
		const x = next() * width;
		const y = next() * height;
		const color = colors[Math.min(colors.length - 1, Math.floor((x / width) * colors.length))];
		const size = 18 + next() * (pattern === 'bubbles' ? 70 : 42);
		const alpha = 0.25 + next() * 0.35;
		if (pattern === 'hexagons') {
			hexagon(ctx, x, y, size);
			ctx.lineWidth = 4 + next() * 5;
			ctx.shadowColor = rgba(color, 0.9);
			ctx.shadowBlur = 12;
			ctx.strokeStyle = rgba(mix(color, '#ffffff', 0.55), alpha + 0.3);
			ctx.stroke();
		} else if (pattern === 'sparkles') {
			sparkle(ctx, x, y, size * 0.8);
			ctx.fillStyle = `rgba(255, 255, 255, ${alpha + 0.2})`;
			ctx.fill();
		} else if (pattern === 'bubbles') {
			ctx.beginPath();
			ctx.arc(x, y, size, 0, Math.PI * 2);
			ctx.fillStyle = rgba(color, alpha * 0.35);
			ctx.fill();
			ctx.lineWidth = 2;
			ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
			ctx.stroke();
		} else {
			diamond(ctx, x, y, size);
			ctx.lineWidth = 3;
			ctx.strokeStyle = rgba(color, alpha + 0.15);
			ctx.stroke();
		}
	}
	ctx.restore();
};

const drawVignette = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
	const gradient = ctx.createRadialGradient(
		width / 2,
		height / 2,
		Math.min(width, height) * 0.4,
		width / 2,
		height / 2,
		Math.max(width, height) * 0.62
	);
	gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
	gradient.addColorStop(1, 'rgba(255, 255, 255, 0.4)');
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, width, height);
};

const roundedRect = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number
) => {
	ctx.beginPath();
	ctx.roundRect(x, y, w, h, r);
};

const drawCover = (
	ctx: CanvasRenderingContext2D,
	image: HTMLImageElement,
	x: number,
	y: number,
	w: number,
	h: number
) => {
	const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
	const sw = w / scale;
	const sh = h / scale;
	ctx.drawImage(
		image,
		(image.naturalWidth - sw) / 2,
		(image.naturalHeight - sh) / 2,
		sw,
		sh,
		x,
		y,
		w,
		h
	);
};

const drawCard = (
	ctx: CanvasRenderingContext2D,
	image: HTMLImageElement | null,
	x: number,
	y: number,
	w: number,
	h: number
) => {
	const radius = w * 0.045;
	ctx.save();
	ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
	ctx.shadowBlur = 28;
	roundedRect(ctx, x, y, w, h, radius);
	ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
	ctx.fill();
	ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
	ctx.shadowBlur = 18;
	ctx.shadowOffsetY = 8;
	ctx.fill();
	ctx.restore();

	ctx.save();
	roundedRect(ctx, x, y, w, h, radius);
	ctx.clip();
	if (image) {
		drawCover(ctx, image, x, y, w, h);
	} else {
		ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
		ctx.fillRect(x, y, w, h);
	}
	ctx.restore();
};

export const drawCardLine = (
	canvas: HTMLCanvasElement,
	images: Array<HTMLImageElement | null>,
	options: CardCanvasOptions
) => {
	const layout = cardLayout(images.length, options.width);
	const width = layout.canvasWidth;
	const height = layout.canvasHeight;
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	if (!ctx) return;
	const colors = options.colors.length ? options.colors : [CARD_COLORS.White];

	ctx.clearRect(0, 0, width, height);
	if (options.background) drawCover(ctx, options.background, 0, 0, width, height);
	else drawGradient(ctx, colors, width, height);
	drawPattern(ctx, options.pattern, colors, width, height, options.seed);
	drawVignette(ctx, width, height);
	layout.positions.forEach((position, i) =>
		drawCard(ctx, images[i], position.x, position.y, layout.width, layout.height)
	);
};
