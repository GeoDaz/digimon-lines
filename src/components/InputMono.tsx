import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Icon from './Icon';
import { makeClassName } from '@/functions';

interface Props {
	name: string;
	defaultValue?: string;
	placeholder: string;
	type?: string;
	onSubmit: Function;
	width?: number;
	forwardRef?: React.Ref<HTMLInputElement>;
	className?: string;
}

const InputMono: React.FC<Props> = ({
	name,
	defaultValue,
	placeholder,
	onSubmit,
	width = 300,
	forwardRef,
	type = 'text',
	className,
}) => {
	const [value, setValue] = useState<string | undefined>(defaultValue);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key != 'Enter') return; // 13 = enter
		e.preventDefault();
		e.stopPropagation();
		onSubmit(name, value);
	};

	return (
		<div className={makeClassName('form d-flex mb-3', className)}>
			<Form.Label htmlFor={name} visuallyHidden>
				{placeholder}
			</Form.Label>
			<Form.Control
				id={name}
				ref={forwardRef}
				type={type}
				placeholder={placeholder}
				style={{ width, maxWidth: '100%' }}
				onChange={handleChange}
				value={value}
				onKeyDown={onKeyDown}
				autoComplete="off"
				className="research"
			/>
			<Button color="primary" type="submit" onClick={e => onSubmit(name, value)}>
				<Icon name="check-lg" />
			</Button>
		</div>
	);
};

export default InputMono;
