import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, ButtonGroup, Form, InputGroup } from 'react-bootstrap';
import Icon from '@/components/Icon';
import CardPickerModal from '@/components/Cards/CardPickerModal';
import ColorSelect from '@/components/Cards/ColorSelect';
import CustomImageInput from '@/components/Cards/CustomImageInput';
import {
	CARD_COLORS,
	CardPattern,
	PREVIEW_SCALE,
	drawCardLine,
	isColorValue,
	resolveColor,
} from '@/functions/cardCanvas';
import {
	CARD_LEVELS,
	DEFAULT_CARD_LEVELS,
	DcgCard,
	cardImageUrl,
	loadDcgCards,
} from '@/functions/dcgCards';
import { downloadFromUrl } from '@/functions/file';

interface Slot {
	level: number;
	id: string | null;
	image?: string;
	color?: string;
}

const MAX_SLOTS = 60;
const PATTERNS: Array<{ value: CardPattern; label: string }> = [
	{ value: 'hexagons', label: 'Hexagons' },
	{ value: 'sparkles', label: 'Sparkles' },
	{ value: 'bubbles', label: 'Bubbles' },
	{ value: 'diamonds', label: 'Diamonds' },
	{ value: 'none', label: 'None' },
];
const AUTO = 'auto';
const CUSTOM = 'custom';
const IMAGE = 'image';
const BACKGROUND_MAX_SIZE = 2400;
const MAX_COLORS = 3;
const MAX_AUTO_COLORS = 4;

const STORAGE_KEY = 'card-line';
const CARD_ID = /^[A-Z]{1,4}\d{0,2}-\d{1,3}(_P\d{1,2})?$/;
const DEFAULT_PATTERN: CardPattern = 'hexagons';
const DEFAULT_SEED = 7;
const DEFAULT_CUSTOM_COLORS = ['Purple', 'Blue'];

const defaultSlots = (): Slot[] => DEFAULT_CARD_LEVELS.map(level => ({ level, id: null }));

const isCustomImage = (value: unknown): value is string =>
	typeof value === 'string' && /^(data:image\/(png|jpeg|webp|gif);base64,|https?:\/\/)/.test(value);

const imageSource = (image?: string | null) =>
	!image ? null
	: image.startsWith('data:') ? image
	: `/api/proxy-image?url=${encodeURIComponent(image)}`;

const slotSource = (slot: Slot) => (slot.id ? cardImageUrl(slot.id) : imageSource(slot.image));

interface StoredCardLine {
	slots: Slot[];
	pattern: CardPattern;
	seed: number;
	colorMode: string;
	customColors: string[];
	backgroundImage: string;
}

const readStoredCardLine = (): Partial<StoredCardLine> | null => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const data = JSON.parse(raw);
		const result: Partial<StoredCardLine> = {};
		if (Array.isArray(data.slots) && data.slots.length) {
			result.slots = data.slots.slice(0, MAX_SLOTS).map((slot: Partial<Slot>) => {
				const id = typeof slot?.id === 'string' && CARD_ID.test(slot.id) ? slot.id : null;
				return {
					level: CARD_LEVELS[Number(slot?.level)] ? Number(slot?.level) : 0,
					id,
					image: !id && isCustomImage(slot?.image) ? slot.image : undefined,
					color: isColorValue(slot?.color) ? slot.color : undefined,
				};
			});
		}
		if (PATTERNS.some(item => item.value === data.pattern)) result.pattern = data.pattern;
		if (Number.isInteger(data.seed)) result.seed = data.seed;
		if ([AUTO, CUSTOM, IMAGE].includes(data.colorMode)) result.colorMode = data.colorMode;
		if (isCustomImage(data.backgroundImage)) result.backgroundImage = data.backgroundImage;
		if (Array.isArray(data.customColors)) {
			const colors = data.customColors.filter(isColorValue).slice(0, MAX_COLORS);
			if (colors.length) result.customColors = colors;
		}
		return result;
	} catch {
		return null;
	}
};

const loadImage = (src: string) =>
	new Promise<HTMLImageElement | null>(resolve => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => resolve(null);
		image.src = src;
	});

const CardLineMaker: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const previewRef = useRef<HTMLDivElement>(null);
	const [slots, setSlots] = useState<Slot[]>(defaultSlots);
	const [pattern, setPattern] = useState<CardPattern>(DEFAULT_PATTERN);
	const [seed, setSeed] = useState(DEFAULT_SEED);
	const [colorMode, setColorMode] = useState(AUTO);
	const [customColors, setCustomColors] = useState<string[]>(DEFAULT_CUSTOM_COLORS);
	const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
	const [restored, setRestored] = useState(false);
	const [cards, setCards] = useState<Record<string, DcgCard>>({});
	const [images, setImages] = useState<Record<string, HTMLImageElement | null>>({});
	const [picking, setPicking] = useState<number | null>(null);
	const [previewWidth, setPreviewWidth] = useState(1000);

	useEffect(() => {
		const stored = readStoredCardLine();
		if (stored?.slots) setSlots(stored.slots);
		if (stored?.pattern) setPattern(stored.pattern);
		if (stored?.seed !== undefined) setSeed(stored.seed);
		if (stored?.colorMode) setColorMode(stored.colorMode);
		if (stored?.customColors) setCustomColors(stored.customColors);
		if (stored?.backgroundImage) setBackgroundImage(stored.backgroundImage);
		setRestored(true);
	}, []);

	useEffect(() => {
		if (!restored) return;
		try {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({ slots, pattern, seed, colorMode, customColors, backgroundImage })
			);
		} catch {}
	}, [restored, slots, pattern, seed, colorMode, customColors, backgroundImage]);

	useEffect(() => {
		const element = previewRef.current;
		if (!element) return;
		const update = () => setPreviewWidth(element.clientWidth || 1000);
		update();
		const observer = new ResizeObserver(update);
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	const reset = () => {
		setSlots(defaultSlots());
		setPattern(DEFAULT_PATTERN);
		setSeed(DEFAULT_SEED);
		setColorMode(AUTO);
		setCustomColors(DEFAULT_CUSTOM_COLORS);
		setBackgroundImage(null);
	};

	useEffect(() => {
		loadDcgCards()
			.then(list => setCards(Object.fromEntries(list.map(card => [card.id, card]))))
			.catch(() => {});
	}, []);

	const sources = useMemo(() => slots.map(slotSource), [slots]);
	const backgroundSource = colorMode === IMAGE ? imageSource(backgroundImage) : null;

	useEffect(() => {
		const missing = Array.from(
			new Set(
				[...sources, backgroundSource].filter(
					(src): src is string => !!src && !(src in images)
				)
			)
		);
		if (!missing.length) return;
		let active = true;
		Promise.all(missing.map(src => loadImage(src).then(image => [src, image] as const))).then(
			loaded => {
				if (active) setImages(prev => ({ ...prev, ...Object.fromEntries(loaded) }));
			}
		);
		return () => {
			active = false;
		};
	}, [sources, backgroundSource, images]);

	const slotColor = useCallback(
		(slot: Slot) =>
			resolveColor(slot.color) || (slot.id ? resolveColor(cards[slot.id]?.colors[0]) : null),
		[cards]
	);

	const colors = useMemo(() => {
		if (colorMode === CUSTOM) {
			return customColors.map(resolveColor).filter((color): color is string => !!color);
		}
		const picked = slots
			.map(slotColor)
			.filter((color): color is string => !!color)
			.filter((color, i, list) => i === 0 || color !== list[i - 1]);
		if (!picked.length) return [CARD_COLORS.Yellow, CARD_COLORS.Purple];
		return picked.length > MAX_AUTO_COLORS ?
				Array.from(new Set(picked)).slice(0, MAX_COLORS)
			:	picked;
	}, [colorMode, customColors, slots, slotColor]);

	useEffect(() => {
		if (!canvasRef.current) return;
		drawCardLine(
			canvasRef.current,
			sources.map(src => (src ? images[src] || null : null)),
			{
				colors,
				pattern,
				seed,
				width: previewWidth / PREVIEW_SCALE,
				background: backgroundSource ? images[backgroundSource] || null : null,
			}
		);
	}, [sources, backgroundSource, images, colors, pattern, seed, previewWidth]);

	const updateSlot = useCallback(
		(index: number, change: Partial<Slot>) =>
			setSlots(prev => prev.map((slot, i) => (i === index ? { ...slot, ...change } : slot))),
		[]
	);

	const addSlot = () =>
		setSlots(prev =>
			prev.length >= MAX_SLOTS ? prev : (
				[...prev, { level: Math.min((prev[prev.length - 1]?.level || 1) + 1, 7), id: null }]
			)
		);

	const removeSlot = (index: number) =>
		setSlots(prev => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));

	const download = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const name =
			slots
				.map(slot => (slot.id ? cards[slot.id]?.name : null))
				.filter(Boolean)
				.pop() || 'digimon-cards';
		downloadFromUrl(
			canvas.toDataURL('image/png'),
			`${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-line.png`
		);
	};

	const chosen = slots.filter(slot => slot.id || slot.image).length;

	return (
		<div className="card-maker">
			<div className="card-maker-preview" ref={previewRef}>
				<canvas ref={canvasRef} aria-label="Card line preview" />
			</div>

			<div className="card-maker-slots">
				{slots.map((slot, index) => {
					const card = slot.id ? cards[slot.id] : undefined;
					const source = sources[index];
					const cardColors = card?.colors.filter(color => CARD_COLORS[color]) || [];
					const pickColor = !!slot.image || cardColors.length > 1;
					return (
						<div key={index} className="card-maker-slot">
							<Form.Select
								size="sm"
								value={slot.level}
								onChange={e => updateSlot(index, { level: Number(e.target.value) })}
								aria-label="Level"
							>
								<option value={0}>Any level</option>
								{Object.entries(CARD_LEVELS).map(([level, label]) => (
									<option key={level} value={level}>
										Lv.{level} {label}
									</option>
								))}
							</Form.Select>
							<button
								type="button"
								className="card-maker-slot-card"
								onClick={() => setPicking(index)}
								title={
									card ? `${card.name} ${card.id}`
									: slot.image ? 'Custom card'
									: 'Choose a card'
								}
							>
								{source ?
									<img src={source} alt={card?.name || slot.id || 'Custom card'} />
								:	<span>
										<Icon name="plus-lg" />
										{CARD_LEVELS[slot.level] || 'Card'}
									</span>
								}
							</button>
							{pickColor && (
								<ColorSelect
									size="sm"
									value={slot.color || (slot.image ? null : cardColors[0])}
									options={slot.image ? undefined : cardColors}
									emptyLabel={slot.image ? 'No color' : undefined}
									onChange={color => updateSlot(index, { color: color || undefined })}
									ariaLabel="Card color"
								/>
							)}
							<ButtonGroup size="sm">
								<Button
									variant="outline-secondary"
									onClick={() =>
										updateSlot(index, { id: null, image: undefined, color: undefined })
									}
									disabled={!slot.id && !slot.image}
									title="Clear"
								>
									<Icon name="eraser" />
								</Button>
								<Button
									variant="outline-secondary"
									onClick={() => removeSlot(index)}
									disabled={slots.length <= 1}
									title="Remove slot"
								>
									<Icon name="trash" />
								</Button>
							</ButtonGroup>
						</div>
					);
				})}
				{slots.length < MAX_SLOTS && (
					<div className="card-maker-slot">
						<Form.Select size="sm" className="invisible" aria-hidden tabIndex={-1} />
						<button type="button" className="card-maker-add" onClick={addSlot}>
							<Icon name="plus-lg" /> Add a card
						</button>
					</div>
				)}
			</div>

			<div className="card-maker-options">
				<Form.Group>
					<Form.Label>Background</Form.Label>
					<Form.Select value={colorMode} onChange={e => setColorMode(e.target.value)}>
						<option value={AUTO}>Card colors</option>
						<option value={CUSTOM}>Custom gradient</option>
						<option value={IMAGE}>Image</option>
					</Form.Select>
				</Form.Group>
				{colorMode === IMAGE && (
					<div className="card-maker-background">
						{backgroundImage && (
							<div className="card-maker-background-thumb">
								<img src={backgroundSource || undefined} alt="Background" />
								<Button
									variant="outline-secondary"
									size="sm"
									onClick={() => setBackgroundImage(null)}
									title="Remove the background image"
								>
									<Icon name="x-lg" />
								</Button>
							</div>
						)}
						<CustomImageInput
							id="card-maker-background"
							placeholder="Background image URL"
							maxWidth={BACKGROUND_MAX_SIZE}
							maxHeight={BACKGROUND_MAX_SIZE}
							onSelect={setBackgroundImage}
						/>
					</div>
				)}
				{colorMode === CUSTOM && (
					<div className="card-maker-gradient">
						{customColors.map((color, index) => (
							<Form.Group key={index}>
								<Form.Label>Color {index + 1}</Form.Label>
								<InputGroup className="card-maker-gradient-color">
									<ColorSelect
										value={color}
										onChange={value =>
											value &&
											setCustomColors(prev =>
												prev.map((item, i) => (i === index ? value : item))
											)
										}
										ariaLabel={`Color ${index + 1}`}
									/>
									{customColors.length > 1 && (
										<Button
											variant="outline-secondary"
											onClick={() =>
												setCustomColors(prev => prev.filter((_, i) => i !== index))
											}
											title="Remove this color"
										>
											<Icon name="x-lg" />
										</Button>
									)}
								</InputGroup>
							</Form.Group>
						))}
						{customColors.length < MAX_COLORS && (
							<Button
								variant="outline-secondary"
								onClick={() => setCustomColors(prev => [...prev, 'White'])}
							>
								<Icon name="plus-lg" /> Color
							</Button>
						)}
					</div>
				)}
				<Form.Group>
					<Form.Label>Pattern</Form.Label>
					<Form.Select value={pattern} onChange={e => setPattern(e.target.value as CardPattern)}>
						{PATTERNS.map(item => (
							<option key={item.value} value={item.value}>
								{item.label}
							</option>
						))}
					</Form.Select>
				</Form.Group>
				<Button
					variant="outline-secondary"
					onClick={() => setSeed(Math.floor(Math.random() * 1e9))}
					disabled={pattern === 'none'}
				>
					<Icon name="shuffle" /> Shuffle pattern
				</Button>
				<Button variant="outline-secondary" onClick={reset}>
					<Icon name="arrow-counterclockwise" /> Reset
				</Button>
				<Button variant="primary" onClick={download} disabled={!chosen}>
					<Icon name="download" /> Download PNG
				</Button>
			</div>

			<CardPickerModal
				show={picking !== null}
				level={picking !== null ? slots[picking]?.level || null : null}
				onClose={() => setPicking(null)}
				onSelect={card => {
					if (picking !== null) {
						updateSlot(picking, { id: card.id, image: undefined, color: undefined });
					}
					setPicking(null);
				}}
				onSelectImage={image => {
					if (picking !== null) updateSlot(picking, { id: null, image, color: undefined });
					setPicking(null);
				}}
			/>
		</div>
	);
};

export default CardLineMaker;
