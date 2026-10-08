import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import ComboBox from '@/components/ComboBox';
import Icon from '@/components/Icon';
import LineImage from './LineImage';
import { SearchContext } from '@/context/search';
import { DigimonContext } from '@/context/digimon';
import { capitalize, makeClassName, stringToKey, unCapitalize } from '@/functions';
import { getSearchPriority } from '@/functions/search';
import {
	DigimonFilters,
	emptyDigimonFilters,
	findDigimonData,
	getDigimonFilterOptions,
	hasDigimonFilters,
	matchDigimonFilters,
	toList,
} from '@/functions/digimonFilters';
import { Digimon } from '@/types/Digimon';

const PAGE_SIZE = 100;

interface Result {
	name: string;
	priority: number;
	prefix: boolean;
	official: boolean;
	digimon?: Digimon;
}

interface Props {
	onSelect: (name: string) => void;
	label?: string;
	forwardRef?: React.Ref<HTMLInputElement>;
	disabled?: boolean;
}

const DigimonFinder: React.FC<Props> = ({
	onSelect,
	label = 'Research',
	forwardRef,
	disabled,
}) => {
	const searchList = useContext(SearchContext);
	const { data, dubNames } = useContext(DigimonContext);
	const [query, setQuery] = useState('');
	const [filters, setFilters] = useState<DigimonFilters>(emptyDigimonFilters);
	const [selection, setSelection] = useState(0);
	const [limit, setLimit] = useState(PAGE_SIZE);
	const listRef = useRef<HTMLDivElement>(null);

	const options = useMemo(() => getDigimonFilterOptions(data), [data]);
	const hasOptions = options.levels.length > 0;
	const filtered = hasDigimonFilters(filters);
	const trimmedQuery = query.trim();

	const results = useMemo<Result[]>(() => {
		if (!searchList || (!trimmedQuery && !filtered)) return [];
		const names = trimmedQuery ? searchList.keys : searchList.values;
		const queryKey = stringToKey(trimmedQuery);
		const seen = new Map<string, Result>();
		names.forEach(key => {
			const priority = trimmedQuery ? getSearchPriority(trimmedQuery, key) : 0;
			if (priority == null) return;
			const prefix =
				!!queryKey &&
				stringToKey(
					queryKey.startsWith('app') ? key : key.replace(/^app_/, '')
				).startsWith(queryKey);
			const name = searchList.mapped[key] || key;
			const previous = seen.get(name);
			if (previous) {
				if (priority > previous.priority) previous.priority = priority;
				if (prefix) previous.prefix = true;
				return;
			}
			const digimon = findDigimonData(data, name, dubNames);
			if (!matchDigimonFilters(digimon, filters)) return;
			seen.set(name, {
				name,
				priority,
				prefix,
				official: !!data[name]?.year,
				digimon,
			});
		});
		return Array.from(seen.values()).sort(
			(a, b) =>
				Number(b.official) - Number(a.official) ||
				Number(b.prefix) - Number(a.prefix) ||
				b.priority - a.priority ||
				a.name.localeCompare(b.name)
		);
	}, [searchList, data, dubNames, trimmedQuery, filters, filtered]);

	useEffect(() => {
		setSelection(0);
		setLimit(PAGE_SIZE);
		listRef.current?.scrollTo({ top: 0 });
	}, [results]);

	useEffect(() => {
		listRef.current
			?.querySelector('.digimon-finder-item.selected')
			?.scrollIntoView({ block: 'nearest' });
	}, [selection]);

	const setFilter = (key: keyof DigimonFilters) => (value: string) =>
		setFilters(prev => ({ ...prev, [key]: value }));

	const handleSelect = (name: string) => {
		onSelect(name);
		setQuery('');
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== 'Enter' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
		e.preventDefault();
		e.stopPropagation();
		const visible = Math.min(results.length, limit);
		if (e.key === 'Enter') {
			if (results[selection]) {
				handleSelect(results[selection].name);
			} else if (trimmedQuery) {
				handleSelect(unCapitalize(trimmedQuery));
			}
		} else if (visible > 0) {
			setSelection(
				e.key === 'ArrowDown' ?
					(selection + 1) % visible
				:	(selection - 1 + visible) % visible
			);
		}
	};

	const visibleResults = results.slice(0, limit);

	return (
		<div className="digimon-finder mb-4">
			<Row style={{ rowGap: '1.5em' }}>
				<Col className={'col-xs-6'} sm={6} lg={3}>
					<div className="position-relative">
						<Form.Label htmlFor="digimon-finder-search" visuallyHidden>
							{label}
						</Form.Label>
						<Form.Control
							ref={forwardRef}
							type="text"
							id="digimon-finder-search"
							placeholder={label}
							value={query}
							onChange={e => setQuery(e.target.value)}
							onKeyDown={onKeyDown}
							autoComplete="off"
							className="research digimon-finder-search pe-4"
							disabled={disabled}
						/>
						<Icon
							name="search"
							className="position-absolute top-50 end-0 p-2 translate-middle-y translate-middle-x"
						/>
					</div>
				</Col>
				{hasOptions && (
					<>
						<Col className={'col-xs-6'} sm={6} lg={3}>
							<ComboBox
								id="digimon-finder-level"
								options={options.levels}
								value={filters.level}
								onChange={setFilter('level')}
								label="Level"
								allLabel="All levels"
								disabled={disabled}
							/>
						</Col>
						<Col className={'col-xs-6'} sm={6} lg={3}>
							<ComboBox
								id="digimon-finder-attribute"
								options={options.attributes}
								value={filters.attribute}
								onChange={setFilter('attribute')}
								label="Attribute"
								allLabel="All attributes"
								disabled={disabled}
							/>
						</Col>
						<Col className={'col-xs-6'} sm={6} lg={3}>
							<ComboBox
								id="digimon-finder-type"
								options={options.types}
								value={filters.type}
								onChange={setFilter('type')}
								label="Type"
								allLabel="All types"
								disabled={disabled}
							/>
						</Col>
					</>
				)}
			</Row>
			{(!!trimmedQuery || filtered) && (
				<>
					<div className="text-muted small mb-1">
						{results.length} result{results.length > 1 ? 's' : ''}
					</div>
					{results.length > 0 && (
						<div
							ref={listRef}
							className="digimon-finder-list list-group"
							role="listbox"
						>
							{visibleResults.map((result, i) => (
								<DigimonFinderItem
									key={result.name}
									result={result}
									dubName={dubNames[result.name]}
									selected={i === selection}
									onClick={() => handleSelect(result.name)}
								/>
							))}
							{results.length > limit && (
								<Button
									variant="link"
									className="list-group-item"
									onClick={() => setLimit(limit + PAGE_SIZE)}
								>
									Show more ({results.length - limit} left)
								</Button>
							)}
						</div>
					)}
				</>
			)}
		</div>
	);
};

const DigimonFinderItem: React.FC<{
	result: Result;
	dubName?: string;
	selected: boolean;
	onClick: () => void;
}> = ({ result, dubName, selected, onClick }) => {
	const { name, digimon } = result;
	const details = [
		toList(digimon?.level).join(' / '),
		toList(digimon?.attribute).join(' / '),
		toList(digimon?.type).join(' / '),
	].filter(Boolean);
	return (
		<button
			type="button"
			role="option"
			aria-selected={selected}
			className={makeClassName(
				'digimon-finder-item list-group-item list-group-item-action d-flex align-items-center gap-3',
				selected && 'selected active'
			)}
			onClick={onClick}
		>
			<LineImage
				name={name}
				width={48}
				height={48}
				zoomable={false}
				loadable={false}
			/>
			<span className="d-flex flex-column text-start">
				<span className="text-capitalize fw-bold">
					{capitalize(name)}
					{dubName && ` / ${capitalize(dubName)}`}
				</span>
				{details.length > 0 && (
					<small className="digimon-finder-details">
						{details.join(' · ')}
					</small>
				)}
			</span>
		</button>
	);
};

export default DigimonFinder;
