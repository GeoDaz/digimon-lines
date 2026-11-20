import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, ButtonGroup, Form, InputGroup } from 'react-bootstrap';
import Icon from '@/components/Icon';
import CardPickerModal from '@/components/Cards/CardPickerModal';
import { CARD_COLORS, CardPattern, drawCardLine } from '@/functions/cardCanvas';
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
}

const MAX_SLOTS = 8;
const PATTERNS: Array<{ value: CardPattern; label: string }> = [
	{ value: 'hexagons', label: 'Hexagons' },
	{ value: 'sparkles', label: 'Sparkles' },
	{ value: 'bubbles', label: 'Bubbles' },
	{ value: 'diamonds', label: 'Diamonds' },
	{ value: 'none', label: 'None' },
];
const AUTO = 'auto';
const CUSTOM = 'custom';
const MAX_COLORS = 3;

const STORAGE_KEY = 'card-line';
const CARD_ID = /^[A-Z]{1,4}\d{0,2}-\d{1,3}(_P\d{1,2})?$/;
const DEFAULT_PATTERN: CardPattern = 'hexagons';
const DEFAULT_SEED = 7;
const DEFAULT_CUSTOM_COLORS = ['Purple', 'Blue'];

const defaultSlots = (): Slot[] => DEFAULT_CARD_LEVELS.map(level => ({ level, id: null }));

interface StoredCardLine {
	slots: Slot[];
	pattern: CardPattern;
	seed: number;
	colorMode: string;
	customColors: string[];
}

const readStoredCardLine = (): Partial<StoredCardLine> | null => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const data = JSON.parse(raw);
		const result: Partial<StoredCardLine> = {};
		if (Array.isArray(data.slots) && data.slots.length) {
			result.slots = data.slots.slice(0, MAX_SLOTS).map((slot: Partial<Slot>) => ({
				level: CARD_LEVELS[Number(slot?.level)] ? Number(slot?.level) : 0,
				id: typeof slot?.id === 'string' && CARD_ID.test(slot.id) ? slot.id : null,
			}));
		}
		if (PATTERNS.some(item => item.value === data.pattern)) result.pattern = data.pattern;
		if (Number.isInteger(data.seed)) result.seed = data.seed;
		if (data.colorMode === AUTO || data.colorMode === CUSTOM) result.colorMode = data.colorMode;
		if (Array.isArray(data.customColors)) {
			const colors = data.customColors
				.filter((color: unknown) => typeof color === 'string' && CARD_COLORS[color])
				.slice(0, MAX_COLORS);
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
	const [slots, setSlots] = useState<Slot[]>(defaultSlots);
	const [pattern, setPattern] = useState<CardPattern>(DEFAULT_PATTERN);
	const [seed, setSeed] = useState(DEFAULT_SEED);
	const [colorMode, setColorMode] = useState(AUTO);
	const [customColors, setCustomColors] = useState<string[]>(DEFAULT_CUSTOM_COLORS);
	const [restored, setRestored] = useState(false);
	const [cards, setCards] = useState<Record<string, DcgCard>>({});
	const [images, setImages] = useState<Record<string, HTMLImageElement | null>>({});
	const [picking, setPicking] = useState<number | null>(null);

	useEffect(() => {
		const stored = readStoredCardLine();
		if (stored?.slots) setSlots(stored.slots);
		if (stored?.pattern) setPattern(stored.pattern);
		if (stored?.seed !== undefined) setSeed(stored.seed);
		if (stored?.colorMode) setColorMode(stored.colorMode);
		if (stored?.customColors) setCustomColors(stored.customColors);
		setRestored(true);
	}, []);

	useEffect(() => {
		if (!restored) return;
		try {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({ slots, pattern, seed, colorMode, customColors })
			);
		} catch {}
	}, [restored, slots, pattern, seed, colorMode, customColors]);

	const reset = () => {
		setSlots(defaultSlots());
		setPattern(DEFAULT_PATTERN);
		setSeed(DEFAULT_SEED);
		setColorMode(AUTO);
		setCustomColors(DEFAULT_CUSTOM_COLORS);
	};

	useEffect(() => {
		loadDcgCards()
			.then(list => setCards(Object.fromEntries(list.map(card => [card.id, card]))))
			.catch(() => {});
	}, []);

	useEffect(() => {
		const missing = slots
			.map(slot => slot.id)
			.filter((id): id is string => !!id && !(id in images));
		if (!missing.length) return;
		let active = true;
		Promise.all(missing.map(id => loadImage(cardImageUrl(id)).then(image => [id, image] as const))).then(
			loaded => {
				if (active) setImages(prev => ({ ...prev, ...Object.fromEntries(loaded) }));
			}
		);
		return () => {
			active = false;
		};
	}, [slots, images]);

	const colors = useMemo(() => {
		if (colorMode === CUSTOM) return customColors.map(color => CARD_COLORS[color]);
		const picked = slots
			.map(slot => (slot.id ? cards[slot.id]?.colors[0] : undefined))
			.filter((color): color is string => !!color && !!CARD_COLORS[color])
			.map(color => CARD_COLORS[color])
			.filter((color, i, list) => i === 0 || color !== list[i - 1]);
		return picked.length ? picked : [CARD_COLORS.Yellow, CARD_COLORS.Purple];
	}, [colorMode, customColors, slots, cards]);

	useEffect(() => {
		if (!canvasRef.current) return;
		drawCardLine(
			canvasRef.current,
			slots.map(slot => (slot.id ? images[slot.id] || null : null)),
			{ colors, pattern, seed }
		);
	}, [slots, images, colors, pattern, seed]);

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

	const chosen = slots.filter(slot => slot.id).length;

	return (
		<div className="card-maker">
			<div className="card-maker-preview">
				<canvas ref={canvasRef} aria-label="Card line preview" />
			</div>

			<div className="card-maker-slots">
				{slots.map((slot, index) => {
					const card = slot.id ? cards[slot.id] : undefined;
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
								title={card ? `${card.name} ${card.id}` : 'Choose a card'}
							>
								{slot.id ?
									<img src={cardImageUrl(slot.id)} alt={card?.name || slot.id} />
								:	<span>
										<Icon name="plus-lg" />
										{CARD_LEVELS[slot.level] || 'Card'}
									</span>
								}
							</button>
							<ButtonGroup size="sm">
								<Button
									variant="outline-secondary"
									onClick={() => updateSlot(index, { id: null })}
									disabled={!slot.id}
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
					</Form.Select>
				</Form.Group>
				{colorMode === CUSTOM && (
					<div className="card-maker-gradient">
						{customColors.map((color, index) => (
							<Form.Group key={index}>
								<Form.Label>Color {index + 1}</Form.Label>
								<InputGroup className="card-maker-gradient-color">
									<div className="card-maker-color-field">
										<span
											className="card-maker-swatch"
											style={{ background: CARD_COLORS[color] }}
										/>
										<Form.Select
											value={color}
											onChange={e =>
												setCustomColors(prev =>
													prev.map((value, i) => (i === index ? e.target.value : value))
												)
											}
										>
											{Object.keys(CARD_COLORS).map(option => (
												<option key={option} value={option}>
													{option}
												</option>
											))}
										</Form.Select>
									</div>
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
					if (picking !== null) updateSlot(picking, { id: card.id });
					setPicking(null);
				}}
			/>
		</div>
	);
};

export default CardLineMaker;
