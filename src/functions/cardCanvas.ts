export type CardPattern = 'none' | 'hexagons' | 'sparkles' | 'bubbles' | 'diamonds';

export interface CardCanvasOptions {
	colors: string[];
	pattern: CardPattern;
	seed: number;
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

export const CANVAS_WIDTH = 2000;
const CARD_RATIO = 600 / 430;
const PADDING = 50;
const GAP = 32;
const MAX_CARD_WIDTH = 330;
const VERTICAL_MARGIN = 100;

export const cardLayout = (count: number) => {
	const slots = Math.max(count, 1);
	const width = Math.min(
		MAX_CARD_WIDTH,
		(CANVAS_WIDTH - PADDING * 2 - GAP * (slots - 1)) / slots
	);
	const height = width * CARD_RATIO;
	const canvasHeight = Math.round(Math.max(height, MAX_CARD_WIDTH * CARD_RATIO * 0.8) + VERTICAL_MARGIN * 2);
	const total = width * slots + GAP * (slots - 1);
	const left = (CANVAS_WIDTH - total) / 2;
	const top = (canvasHeight - height) / 2;
	return {
		canvasHeight,
		width,
		height,
		positions: Array.from({ length: slots }, (_, i) => ({ x: left + i * (width + GAP), y: top })),
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

const lightening = (color: string) => (color === CARD_COLORS.Black ? 0.04 : 0.28);

const drawGradient = (ctx: CanvasRenderingContext2D, colors: string[], height: number) => {
	const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, 0);
	const stops = colors.length > 1 ? colors : [colors[0], colors[0]];
	stops.forEach((color, i) => {
		gradient.addColorStop(i / (stops.length - 1), mix(color, '#ffffff', lightening(color)));
	});
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, CANVAS_WIDTH, height);

	const depth = ctx.createLinearGradient(0, 0, 0, height);
	depth.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
	depth.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
	depth.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
	ctx.fillStyle = depth;
	ctx.fillRect(0, 0, CANVAS_WIDTH, height);
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
	height: number,
	seed: number
) => {
	if (pattern === 'none') return;
	const next = random(seed);
	const count = pattern === 'bubbles' ? 26 : 34;
	ctx.save();
	for (let i = 0; i < count; i++) {
		const x = next() * CANVAS_WIDTH;
		const y = next() * height;
		const color = colors[Math.min(colors.length - 1, Math.floor((x / CANVAS_WIDTH) * colors.length))];
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

const drawVignette = (ctx: CanvasRenderingContext2D, height: number) => {
	const gradient = ctx.createRadialGradient(
		CANVAS_WIDTH / 2,
		height / 2,
		height * 0.4,
		CANVAS_WIDTH / 2,
		height / 2,
		CANVAS_WIDTH * 0.62
	);
	gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
	gradient.addColorStop(1, 'rgba(255, 255, 255, 0.4)');
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, CANVAS_WIDTH, height);
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
		ctx.drawImage(image, x, y, w, h);
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
	const layout = cardLayout(images.length);
	canvas.width = CANVAS_WIDTH;
	canvas.height = layout.canvasHeight;
	const ctx = canvas.getContext('2d');
	if (!ctx) return;
	const colors = options.colors.length ? options.colors : [CARD_COLORS.White];
	const height = layout.canvasHeight;

	ctx.clearRect(0, 0, CANVAS_WIDTH, height);
	drawGradient(ctx, colors, height);
	drawPattern(ctx, options.pattern, colors, height, options.seed);
	drawVignette(ctx, height);
	layout.positions.forEach((position, i) =>
		drawCard(ctx, images[i], position.x, position.y, layout.width, layout.height)
	);
};
