import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Icon from '@/components/Icon';
import { makeClassName } from '@/functions';

interface Props {
	levels: string[];
	value: string;
	onChange: (level: string) => void;
	label?: string;
	width?: number | string;
}

const LevelFilter: React.FC<Props> = ({
	levels,
	value,
	onChange,
	label = 'Filter by level',
	width = 300,
}) => {
	const [query, setQuery] = useState<string>(value);
	const [open, setOpen] = useState(false);
	const [selection, setSelection] = useState<number | null>(null);
	const blurTimeout = useRef<ReturnType<typeof setTimeout>>();

	// Keep the input in sync when the filter is changed from outside.
	useEffect(() => {
		setQuery(value);
	}, [value]);

	// All matching levels, without any count limit.
	const previews =
		query ?
			levels.filter(level => level.toLowerCase().includes(query.toLowerCase()))
		:	levels;

	const select = (level: string) => {
		onChange(level);
		setQuery(level);
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
		<div className="form search d-flex mb-3" style={{ width, maxWidth: '100%' }}>
			<Form.Label htmlFor="level-filter" visuallyHidden>
				{label}
			</Form.Label>
			<Form.Control
				type="text"
				id="level-filter"
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
						All levels
					</span>
					{previews.map((level, i) => (
						<span
							key={level}
							className={makeClassName(
								'preview',
								selection === i && 'selected',
								value === level && 'fw-bold'
							)}
							onClick={() => select(level)}
						>
							{level}
						</span>
					))}
				</div>
			)}
			<Button
				variant="secondary"
				type="button"
				title={value ? 'Clear level filter' : 'Show levels'}
				onClick={() => (value ? clear() : setOpen(o => !o))}
			>
				<Icon name={value ? 'x-lg' : 'chevron-down'} />
			</Button>
		</div>
	);
};

export default LevelFilter;
