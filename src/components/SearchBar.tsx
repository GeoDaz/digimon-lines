import React, { useState, useEffect, useContext } from 'react';
import { Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Icon from './Icon';
import { SearchContext } from '@/context/search';
import { getSearchPriority, makeClassName, stringToKey } from '@/functions';
import { Option } from '@/types/Ui';

const NB_PREVIEW = 10;
interface Props {
	onSubmit: Function;
	defaultValue?: string;
	width?: number;
    forwardRef?: React.Ref<HTMLInputElement>;
}
const SearchBar: React.FC<Props> = ({
	onSubmit,
	defaultValue,
	width = 300,
	forwardRef,
}) => {
	const searchList = useContext(SearchContext);
	const [search, setSearch] = useState<string | undefined>(defaultValue);
	const [previews, setPreviews] = useState<Option[]>([]);
	const [selection, setSelection] = useState<number | null>(null);

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
			handleSubmit(selection !== null ? previews[selection].value : undefined);
		} else if (previews.length > 0) {
			if (e.key == 'ArrowDown') {
				setSelection(
					selection === null ? 0 : selection == 4 ? null : selection + 1
				);
			} else if (e.key == 'ArrowUp') {
				setSelection(
					selection === null ? 4 : selection === 0 ? null : selection - 1
				);
			}
		}
	};

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value);
		let search = stringToKey(e.target.value);
		if (search) {
			if (searchList && searchList.length > 0) {
				let result = searchList.reduce((result, name) => {
					const priority = getSearchPriority(search, name);
					if (priority != null) {
						result.push({ key: priority, value: name } as Option);
					}
					return result;
				}, [] as any[]);
				result.sort((a, b) => b.key - a.key);
				setPreviews(result.slice(0, NB_PREVIEW));
			}
		}
	};

	const handleSubmit = (value: string | number | undefined = search) => {
		setPreviews([]);
		onSubmit(value);
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
				placeholder="Research a Digimon"
				style={{ width, maxWidth: '100%' }}
				onChange={handleSearch}
				value={search || ''}
				onKeyDown={onKeyDown}
				autoComplete="off"
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
								setSearch(preview.value as string);
								handleSubmit(preview.value);
							}}
						>
							{preview.value}
						</span>
					))}
				</div>
			)}
			<Button color="primary" type="submit" onClick={e => handleSubmit()}>
				<Icon name="search" />
			</Button>
		</div>
	);
};

export default SearchBar;
