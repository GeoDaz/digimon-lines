import React, { useState, useEffect, useContext, useRef } from 'react';
import { Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Icon from './Icon';
import { SearchContext } from '@/context/search';
import { capitalize, makeClassName, unCapitalize } from '@/functions';
import { Option } from '@/types/Ui';
import { getSearchPriority } from '@/functions/search';

interface Props {
	onSubmit: Function;
	voidOnSubmit?: boolean;
	label?: string;
	defaultValue?: string;
	width?: number;
	forwardRef?: React.Ref<HTMLInputElement>;
	disabled?: boolean;
}
const SearchBar: React.FC<Props> = ({
	onSubmit,
	voidOnSubmit = false,
	label = 'Research',
	defaultValue = '',
	width,
	forwardRef,
	disabled = false,
}) => {
	const searchList = useContext(SearchContext);
	const [search, setSearch] = useState<string | undefined>(defaultValue);
	const [previews, setPreviews] = useState<Option[]>([]);
	const [selection, setSelection] = useState<number | null>(null);
	// Texte tapé avant que la liste de recherche soit disponible.
	const waitingListRef = useRef(false);

	const resetSelection = () => setSelection(0);

	useEffect(() => {
		if (!search && defaultValue) {
			setSearch(defaultValue);
		}
	}, [defaultValue]);

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key != 'Enter' && e.key != 'ArrowDown' && e.key != 'ArrowUp') return; // 13 = enter
		e.preventDefault();
		e.stopPropagation();
		if (e.key == 'Enter') {
			handleSubmit((selection !== null && previews[selection]?.value) || undefined);
		} else if (previews.length > 0) {
			if (e.key == 'ArrowDown') {
				setSelection(
					selection === null ? 0
					: selection == previews.length - 1 ? null
					: selection + 1
				);
			} else if (e.key == 'ArrowUp') {
				setSelection(
					selection === null ? previews.length - 1
					: selection === 0 ? null
					: selection - 1
				);
			}
		}
	};

	const updatePreviews = (value: string) => {
		if (!searchList || searchList.values.length === 0) {
			waitingListRef.current = true;
			return;
		}
		waitingListRef.current = false;
		let result = searchList.keys.reduce((result, name) => {
			const priority = getSearchPriority(value, name);
			if (priority != null) {
				result.push({
					key: priority,
					value: searchList.mapped[name],
					text: name,
				} as Option);
			}
			return result;
		}, [] as any[]);
		result.sort((a, b) => b.key - a.key);
		setPreviews(result.slice(0, value.length > 3 ? 50 : 10));
		resetSelection();
	};

	// La liste de recherche peut arriver après la frappe (données digimons
	// chargées à part, voir useSharedDigimonData) : on affiche alors les
	// suggestions de ce qui est déjà tapé.
	useEffect(() => {
		if (waitingListRef.current && search) updatePreviews(search);
	}, [searchList]);

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearch(value);
		if (value) {
			updatePreviews(value);
		} else {
			waitingListRef.current = false;
			if (previews.length > 0) {
				setPreviews([]);
				resetSelection();
			}
		}
	};

	const handleSubmit = (value: string | number | undefined = undefined) => {
		waitingListRef.current = false;
		setPreviews([]);
		onSubmit(value || (search && unCapitalize(search)));
		if (voidOnSubmit) {
			setSearch('');
		}
	};

	return (
		<div className="form search d-flex mb-3">
			<Form.Label htmlFor="lines-search" visuallyHidden>
				Research
			</Form.Label>
			<Form.Control
				ref={forwardRef}
				type="text"
				id="lines-search"
				placeholder={label}
				style={{ width, maxWidth: '100%' }}
				onChange={handleSearch}
				value={search || ''}
				onKeyDown={onKeyDown}
				autoComplete="off"
				className="research"
				disabled={disabled}
			/>
			{previews.length > 0 && (
				<div className="previews" role="listbox" aria-expanded tabIndex={0}>
					{previews.map((preview, i) => (
						<span
							key={i}
							className={makeClassName(
								'preview',
								selection == i && 'selected'
							)}
							onClick={e => {
								e.preventDefault();
								e.stopPropagation();
								if (disabled) return;
								setSearch(preview.value as string);
								handleSubmit(preview.value);
							}}
						>
							{capitalize((preview.text || preview.value) as string)}
						</span>
					))}
				</div>
			)}
			<Button
				color="primary"
				type="submit"
				disabled={disabled}
				onClick={e => handleSubmit()}
			>
				<Icon name="search" />
			</Button>
		</div>
	);
};

export default SearchBar;
