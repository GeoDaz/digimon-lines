import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import DigimonField from '@/components/Line/DigimonField';
import { GroupPoint } from '@/types/Group';

interface Props {
	show: boolean;
	onClose: () => void;
	onSubmit: (point: GroupPoint) => void;
	title?: string;
}

const GroupPointModal: React.FC<Props> = ({
	show,
	onClose,
	onSubmit,
	title = 'Add a related Digimon',
}) => {
	const [name, setName] = useState('');
	const [line, setLine] = useState('');

	// Reset the form each time the modal opens.
	useEffect(() => {
		if (show) {
			setName('');
			setLine('');
		}
	}, [show]);

	const submit = () => {
		if (!name) return;
		onSubmit({ name, ...(line ? { line } : {}) });
		onClose();
	};

	return (
		<Modal show={show} onHide={onClose}>
			<Modal.Header closeButton>
				<Modal.Title>{title}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<DigimonField
					title="Digimon"
					values={name ? [name] : []}
					onSelect={setName}
					onRemove={() => setName('')}
				/>
				<DigimonField
					title="Line"
					values={line ? [line] : []}
					onSelect={setLine}
					onRemove={() => setLine('')}
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

export default GroupPointModal;
