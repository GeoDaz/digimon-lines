import React, { useRef } from 'react';
import { Dropdown } from 'react-bootstrap';
import { ColorPalette, resolveColor } from '@/functions/cardCanvas';

const ColorDot: React.FC<{ color: string | null }> = ({ color }) => (
	<span
		className={color ? 'card-maker-color-dot' : 'card-maker-color-dot card-maker-color-dot-empty'}
		style={color ? { background: color } : undefined}
	/>
);

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

	const label =
		custom && value ? value.toUpperCase()
		: value && named.includes(value) ? value
		: (emptyLabel ?? '-');

	return (
		<Dropdown className={className ? `card-maker-color-field ${className}` : 'card-maker-color-field'}>
			<Dropdown.Toggle
				as="button"
				type="button"
				className={`form-select${size ? ` form-select-${size}` : ''} card-maker-color-toggle`}
				aria-label={ariaLabel}
			>
				<ColorDot color={hex} />
				<span>{label}</span>
			</Dropdown.Toggle>
			<Dropdown.Menu className="card-maker-color-menu">
				{emptyLabel !== undefined && (
					<Dropdown.Item as="button" type="button" active={!value} onClick={() => onChange(null)}>
						<ColorDot color={null} />
						{emptyLabel}
					</Dropdown.Item>
				)}
				{named.map(option => (
					<Dropdown.Item
						key={option}
						as="button"
						type="button"
						active={value === option}
						onClick={() => onChange(option)}
					>
						<ColorDot color={palette[option]} />
						{option}
					</Dropdown.Item>
				))}
				<Dropdown.Item
					as="button"
					type="button"
					active={custom}
					onClick={() => pickerRef.current?.click()}
				>
					<ColorDot color={custom ? hex : null} />
					{custom && value ? value.toUpperCase() : 'Custom…'}
				</Dropdown.Item>
			</Dropdown.Menu>
			<input
				ref={pickerRef}
				type="color"
				className="card-maker-color-input"
				value={hex || '#ffffff'}
				onChange={e => onChange(e.target.value)}
				tabIndex={-1}
				aria-label="Custom color"
			/>
		</Dropdown>
	);
};

export default ColorSelect;
