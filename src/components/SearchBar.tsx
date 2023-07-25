import React, { useState, useEffect } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Icon from './Icon';

interface Props {
	onSubmit: Function;
	defaultValue?: string;
}
// TODO preview result
const SearchBar: React.FC<Props> = ({ onSubmit, defaultValue }) => {
	const [search, setSearch] = useState<string | undefined>(defaultValue);

	useEffect(() => {
		if (!search && defaultValue) {
			setSearch(defaultValue);
		}
	}, [defaultValue]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		onSubmit(search);
	};

	return (
		<Form onSubmit={handleSubmit} className="d-flex mb-3">
			<Form.Label htmlFor="lines-search" visuallyHidden>
				Research
			</Form.Label>
			<Form.Control
				type="text"
				id="lines-search"
				placeholder="Research a Digimon"
				style={{ width: 300, maxWidth: '100%' }}
				onChange={e => setSearch(e.target.value)}
				value={search || ''}
			/>
			<Button color="primary" type="submit">
				<Icon name="search" />
			</Button>
		</Form>
	);
};

export default SearchBar;
