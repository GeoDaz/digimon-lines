import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { Digimon } from '@/types/Digimon';
import { capitalize } from '@/functions';

interface Props {
	show: boolean;
	name: string;
	datum?: Digimon;
	handleClose: () => void;
	onSubmit: (data: Partial<Digimon>) => void;
}

// Turn a string | string[] field into editable comma-separated text.
const toText = (value: string | string[] | undefined): string =>
	Array.isArray(value) ? value.join(', ') : value || '';

const toList = (text: string): string[] =>
	text
		.split(',')
		.map(part => part.trim())
		.filter(Boolean);

// Parse a field that may be a single value or a list: keep a lone value as a
// string, several as an array, matching the shape used across the data.
const parseField = (text: string): string | string[] => {
	const list = toList(text);
	if (list.length > 1) return list;
	return list[0] || '';
};

const DigimonDataModal: React.FC<Props> = ({
	show,
	name,
	datum,
	handleClose,
	onSubmit,
}) => {
	const [level, setLevel] = useState('');
	const [type, setType] = useState('');
	const [attribute, setAttribute] = useState('');
	const [field, setField] = useState('');
	const [year, setYear] = useState('');
	const [source, setSource] = useState('');

	useEffect(() => {
		setLevel(toText(datum?.level));
		setType(toText(datum?.type));
		setAttribute(toText(datum?.attribute));
		setField(toText(datum?.field));
		setYear(datum?.year || '');
		setSource(datum?.source || '');
	}, [datum, show]);

	const handleSubmit = () => {
		const trimmed = source.trim();
		onSubmit({
			level: parseField(level),
			type: parseField(type),
			attribute: parseField(attribute),
			field: parseField(field),
			year: year.trim(),
			// Most entries have a wikimon url instead, so only carry the key when it
			// says something: the update merges, it would add an empty one otherwise.
			...(trimmed || datum?.source ? { source: trimmed } : {}),
		});
		handleClose();
	};

	return (
		<Modal show={show} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title className="text-capitalize break-word">
					Edit data — {capitalize(name)}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Row style={{ rowGap: '1em' }}>
						<Col md={6}>
							<Form.Label>Level</Form.Label>
							<Form.Control
								value={level}
								onChange={e => setLevel(e.target.value)}
							/>
						</Col>
						<Col md={6}>
							<Form.Label>Year</Form.Label>
							<Form.Control
								value={year}
								onChange={e => setYear(e.target.value)}
							/>
						</Col>
						<Col md={6}>
							<Form.Label>Type</Form.Label>
							<Form.Control
								value={type}
								onChange={e => setType(e.target.value)}
							/>
						</Col>
						<Col md={6}>
							<Form.Label>Attribute</Form.Label>
							<Form.Control
								value={attribute}
								onChange={e => setAttribute(e.target.value)}
							/>
						</Col>
						<Col md={6}>
							<Form.Label>Field</Form.Label>
							<Form.Control
								value={field}
								onChange={e => setField(e.target.value)}
							/>
						</Col>
						<Col md={6}>
							<Form.Label>Source</Form.Label>
							<Form.Control
								value={source}
								onChange={e => setSource(e.target.value)}
							/>
						</Col>
					</Row>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>
					Cancel
				</Button>
				<Button variant="primary" onClick={handleSubmit}>
					Submit
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default DigimonDataModal;
