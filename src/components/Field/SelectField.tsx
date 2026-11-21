import { FloatingLabel, Form } from 'react-bootstrap';
import { StringObject } from '@/types/Ui';

export type SelectFieldProps = {
	id: string;
	value?: string;
	label?: string;
	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	options?: StringObject;
	children?: React.ReactNode;
	disabled?: boolean;
	className?: string;
	style?: React.CSSProperties;
} & ({ options: StringObject } | { children: React.ReactNode });

const SelectField = ({
	id,
	label,
	value,
	onChange,
	options,
	children,
	className,
	style,
	disabled = false,
}: SelectFieldProps) => (
	<FloatingLabel label={label} controlId={id} className={className} style={style}>
		<Form.Select
			id={id}
			value={value}
			onChange={onChange}
			disabled={disabled}
			aria-label={`${label} select`}
		>
			{children ||
				Object.entries(options!).map(([key, value]) => (
					<option key={key} value={key}>
						{value}
					</option>
				))}
		</Form.Select>
	</FloatingLabel>
);

export default SelectField;
