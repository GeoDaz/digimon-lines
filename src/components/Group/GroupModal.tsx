import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { capitalize } from '@/functions';

interface Props {
	show: boolean;
	onClose: () => void;
	onSubmit: (name: string) => void;
}

// Group files are named after a key : lowercase words joined by underscores.
export const toGroupKey = (value: string): string =>
	value
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '_')
		.replace(/[^a-z0-9_-]/g, '');

const GroupModal: React.FC<Props> = ({ show, onClose, onSubmit }) => {
	const [value, setValue] = useState('');
	const name = toGroupKey(value);

	// Reset the form each time the modal opens.
	useEffect(() => {
		if (show) setValue('');
	}, [show]);

	const submit = () => {
		if (!name) return;
		onSubmit(name);
		onClose();
	};

	return (
		<Modal show={show} onHide={onClose}>
			<Modal.Header closeButton>
				<Modal.Title>Add a group</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form.Label htmlFor="group-name">Group name</Form.Label>
				<Form.Control
					id="group-name"
					value={value}
					placeholder="Royal Knights"
					autoComplete="off"
					onChange={e => setValue(e.target.value)}
					onKeyDown={e => e.key == 'Enter' && submit()}
				/>
				{!!name && (
					<p className="mt-2 mb-0">
						File&nbsp;: <code>{name}.json</code> — displayed as{' '}
						{capitalize(name)}
					</p>
				)}
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

export default GroupModal;
