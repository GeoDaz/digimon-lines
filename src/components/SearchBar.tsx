import { Button, Col, Row } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Icon from './Icon';
import { useState } from 'react';

function SearchBar({ onSubmit }: { onSubmit: Function }) {
    // TODO preview
    const [search, setSearch] = useState<string>()

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
        onSubmit(search);
	};

	return (
		<Form onSubmit={handleSubmit} className="d-flex">
			<Form.Label htmlFor="lines-search" visuallyHidden>
				Rechercher
			</Form.Label>
			<Form.Control
				type="text"
				id="lines-search"
				placeholder="Rechercher un Digimon"
				style={{ width: 300, maxWidth: '100%' }}
                onChange={(e) => setSearch(e.target.value)}
			/>
			<Button color="primary" type="submit">
				<Icon name="search" />
			</Button>
		</Form>
	);
}

export default SearchBar;
