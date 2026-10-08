import React, { useEffect, useRef, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Icon from '@/components/Icon';
import { makeClassName } from '@/functions';

interface Props {
	id: string;
	options: string[];
	value: string;
	onChange: (value: string) => void;
	label?: string;
	allLabel?: string;
	width?: number | string;
	className?: string;
	disabled?: boolean;
}

const ComboBox: React.FC<Props> = ({
	id,
	options,
	value,
	onChange,
	label = 'Filter',
	allLabel = 'All',
	className,
	disabled,
}) => {
	const [query, setQuery] = useState<string>(value);
	const [open, setOpen] = useState(false);
	const [selection, setSelection] = useState<number | null>(null);
	const blurTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	// Keep the input in sync when the filter is changed from outside.
	useEffect(() => {
		setQuery(value);
	}, [value]);

	// All matching options, without any count limit.
	const previews =
		query ?
			options.filter(option => option.toLowerCase().includes(query.toLowerCase()))
		:	options;

	const select = (option: string) => {
		onChange(option);
		setQuery(option);
		setOpen(false);
		setSelection(null);
	};

	const clear = () => {
		onChange('');
		setQuery('');
		setOpen(false);
		setSelection(null);
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Escape') {
			if (open) e.stopPropagation();
			setOpen(false);
			setSelection(null);
			return;
		}
		if (e.key !== 'Enter' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
		e.preventDefault();
		if (e.key === 'Enter') {
			if (selection !== null && previews[selection]) {
				select(previews[selection]);
			} else if (previews.length === 1) {
				select(previews[0]);
			}
		} else if (previews.length > 0) {
			if (e.key === 'ArrowDown') {
				setSelection(
					selection === null || selection === previews.length - 1 ?
						0
					:	selection + 1
				);
			} else {
				setSelection(
					selection === null || selection === 0 ?
						previews.length - 1
					:	selection - 1
				);
			}
			setOpen(true);
		}
	};

	return (
		<div className={makeClassName('form search combobox', className)}>
			<Form.Label htmlFor={id} visuallyHidden>
				{label}
			</Form.Label>
			<Form.Control
				type="text"
				id={id}
				placeholder={label}
				onChange={e => {
					setQuery(e.target.value);
					setOpen(true);
					setSelection(null);
				}}
				onFocus={() => setOpen(true)}
				onBlur={() => {
					blurTimeout.current = setTimeout(() => setOpen(false), 150);
				}}
				value={query}
				onKeyDown={onKeyDown}
				autoComplete="off"
				className="research flex-grow-1 mw-100"
				disabled={disabled}
			/>
			{open && previews.length > 0 && (
				<div
					className="previews"
					role="listbox"
					onMouseDown={() => clearTimeout(blurTimeout.current)}
				>
					<span
						className="preview"
						onClick={clear}
						style={{ fontStyle: 'italic', opacity: 0.8 }}
					>
						{allLabel}
					</span>
					{previews.map((option, i) => (
						<span
							key={option}
							className={makeClassName(
								'preview',
								selection === i && 'selected',
								value === option && 'fw-bold'
							)}
							onClick={() => select(option)}
						>
							{option}
						</span>
					))}
				</div>
			)}
			<button
				type="button"
				title={value ? `Clear ${label.toLowerCase()}` : 'Show options'}
				className="combox-button"
				onClick={() => (value ? clear() : setOpen(o => !o))}
				disabled={disabled}
			>
				<Icon name={value ? 'x-lg' : 'chevron-down'} />
			</button>
		</div>
	);
};

export default ComboBox;
