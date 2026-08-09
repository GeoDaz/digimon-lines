import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

interface Props {
	show: boolean;
	onClose: () => void;
	onSubmit: (name: string, title: string, image?: File) => void;
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
	const [image, setImage] = useState<File | undefined>();
	const [preview, setPreview] = useState('');
	const name = toGroupKey(value);
	// The typed value keeps its casing, it becomes the title of the group.
	const title = value.trim();

	// Reset the form each time the modal opens.
	useEffect(() => {
		if (show) {
			setValue('');
			setImage(undefined);
		}
	}, [show]);

	useEffect(() => {
		if (!image) return setPreview('');
		const url = URL.createObjectURL(image);
		setPreview(url);
		return () => URL.revokeObjectURL(url);
	}, [image]);

	const submit = () => {
		if (!name) return;
		onSubmit(name, title, image);
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
						File&nbsp;: <code>{name}.json</code> — displayed as {title}
					</p>
				)}
				<Form.Label htmlFor="group-image" className="mt-3">
					Illustration <span className="text-muted">(optional)</span>
				</Form.Label>
				<Form.Control
					id="group-image"
					type="file"
					accept="image/*"
					onChange={e =>
						setImage((e.target as HTMLInputElement).files?.[0] || undefined)
					}
				/>
				{!!preview && (
					<div className="mt-2 d-flex align-items-center gap-2">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={preview} alt="" className="rounded" height={80} />
						<span>
							Saved as <code>images/groups/{name || '…'}.jpg</code>
						</span>
					</div>
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
