import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import DigimonField from '@/components/Line/DigimonField';
import { LineThumb } from '@/types/Line';

interface Props {
	show: boolean;
	onClose: () => void;
	onSubmit: (thumb: LineThumb) => void;
}

const NewsModal: React.FC<Props> = ({ show, onClose, onSubmit }) => {
	const [name, setName] = useState('');
	const [grid, setGrid] = useState<string[]>([]);

	// Reset the form each time the modal opens.
	useEffect(() => {
		if (show) {
			setName('');
			setGrid([]);
		}
	}, [show]);

	const submit = () => {
		if (!name) return;
		onSubmit({ name, ...(grid.length ? { grid } : {}) });
		onClose();
	};

	return (
		<Modal show={show} onHide={onClose}>
			<Modal.Header closeButton>
				<Modal.Title>Add a news line</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<DigimonField
					title="Line"
					values={name ? [name] : []}
					onSelect={setName}
					onRemove={() => setName('')}
				/>
				<DigimonField
					title="Grid"
					values={grid}
					onSelect={value =>
						setGrid(g => (g.includes(value) ? g : [...g, value]))
					}
					onRemove={index => setGrid(g => g.filter((_, i) => i !== index))}
				/>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onClose}>
					Cancel
				</Button>
				<Button variant="primary" onClick={submit} disabled={!name}>
					Add
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default NewsModal;
