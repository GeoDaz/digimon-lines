import React, { useRef } from 'react';
import { Form } from 'react-bootstrap';
import { ColorPalette, resolveColor } from '@/functions/cardCanvas';

const CUSTOM = '__custom';

interface Props {
	value: string | null | undefined;
	onChange: (value: string | null) => void;
	palette: ColorPalette;
	options?: string[];
	emptyLabel?: string;
	size?: 'sm' | 'lg';
	className?: string;
	ariaLabel?: string;
}

const ColorSelect: React.FC<Props> = ({
	value,
	onChange,
	palette,
	options = Object.keys(palette),
	emptyLabel,
	size,
	className,
	ariaLabel = 'Color',
}) => {
	const pickerRef = useRef<HTMLInputElement>(null);
	const hex = resolveColor(value, palette);
	const custom = !!value && !palette[value] && !!hex;
	const named = options.filter(option => palette[option]);

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
