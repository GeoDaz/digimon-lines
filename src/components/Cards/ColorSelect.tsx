import React, { useRef } from 'react';
import { Form } from 'react-bootstrap';
import { CARD_COLORS, resolveColor } from '@/functions/cardCanvas';

const CUSTOM = '__custom';
const COLOR_NAMES = Object.keys(CARD_COLORS);

interface Props {
	value: string | null | undefined;
	onChange: (value: string | null) => void;
	options?: string[];
	emptyLabel?: string;
	size?: 'sm' | 'lg';
	className?: string;
	ariaLabel?: string;
}

const ColorSelect: React.FC<Props> = ({
	value,
	onChange,
	options = COLOR_NAMES,
	emptyLabel,
	size,
	className,
	ariaLabel = 'Color',
}) => {
	const pickerRef = useRef<HTMLInputElement>(null);
	const hex = resolveColor(value);
	const custom = !!value && !CARD_COLORS[value] && !!hex;
	const named = options.filter(option => CARD_COLORS[option]);

	return (
		<div className={className ? `card-maker-color-field ${className}` : 'card-maker-color-field'}>
			<label
				className={hex ? 'card-maker-swatch' : 'card-maker-swatch card-maker-swatch-empty'}
				style={hex ? { background: hex } : undefined}
				title="Custom color"
			>
				<input
					ref={pickerRef}
					type="color"
					value={hex || '#ffffff'}
					onChange={e => onChange(e.target.value)}
					aria-label="Custom color"
				/>
			</label>
			<Form.Select
				size={size}
				value={custom ? CUSTOM : value && named.includes(value) ? value : ''}
				onChange={e => {
					if (e.target.value === CUSTOM) pickerRef.current?.click();
					else onChange(e.target.value || null);
				}}
				aria-label={ariaLabel}
			>
				{(emptyLabel !== undefined || !value || (!custom && !named.includes(value))) && (
					<option value="">{emptyLabel ?? '-'}</option>
				)}
				{named.map(option => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
				<option value={CUSTOM}>{custom && value ? value.toUpperCase() : 'Custom…'}</option>
			</Form.Select>
		</div>
	);
};

export default ColorSelect;
