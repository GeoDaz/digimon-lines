import React from 'react';
import LineImage from '@/components/Line/LineImage';
import ButtonRemove from '@/components/Button/ButtonRemove';
import SearchBar from '@/components/SearchBar';
import { capitalize } from '@/functions';

interface Props {
	title: string;
	// Selected digimons : a single one for simple fields, several for lists.
	values: string[];
	onSelect: (value: string) => void;
	onRemove: (index: number) => void;
}

const DigimonField: React.FC<Props> = ({ title, values, onSelect, onRemove }) => (
	<div className="mb-3">
		<h5>{title}</h5>
		<SearchBar
			label="Search a Digimon"
			onSubmit={(value?: string) => value && onSelect(value)}
			voidOnSubmit
		/>
		{values.map((value, i) => (
			<div
				key={`${value}-${i}`}
				className="d-flex align-items-center gap-2 p-2 mb-1 rounded border position-relative"
			>
				<LineImage name={value} width={40} height={40} zoomable={false} />
				<span className="text-capitalize">{capitalize(value)}</span>
				<ButtonRemove
					size="sm"
					className="ms-auto"
					title="Remove"
					onClick={() => onRemove(i)}
				/>
			</div>
		))}
	</div>
);

export default DigimonField;
