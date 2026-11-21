import { makeClassName } from '@/functions';
import { useMemo } from 'react';
import { Form } from 'react-bootstrap';

export type RangeOption = {
	text: string;
	disabled: boolean;
};

export type RangeOptions = Record<number, RangeOption>;

type RangeProps = {
	id: string;
	label: string;
	value: number;
	min?: number;
	max?: number;
	onChange: (value: number) => void;
	options: RangeOptions;
	className?: string;
	style?: React.CSSProperties;
};

const Range: React.FC<RangeProps> = ({
	id,
	value,
	label,
	onChange,
	options,
	className,
	style,
}) => {
	const entries = useMemo(() => Object.entries(options), [options]);
	return (
		<div className="d-inline-block">
			{!!label && <Form.Label htmlFor={id}>{label}&nbsp;:</Form.Label>}
			<div className={makeClassName('inline-radio', className)} style={style}>
				{entries.map(([key, option]) => (
					<Form.Check
						inline
						label={option.text}
						name="group1"
						type="radio"
						id={`inline-radio-${key}`}
						key={key}
						checked={value === Number(key)}
						onChange={() => onChange(Number(key))}
						disabled={option.disabled}
						title={option.disabled ? 'Unavailable for now' : ''}
					/>
				))}
			</div>
		</div>
	);
};

export default Range;
