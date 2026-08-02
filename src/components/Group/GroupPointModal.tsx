import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import DigimonField from '@/components/Line/DigimonField';
import { GroupPoint } from '@/types/Group';

interface Props {
	show: boolean;
	onClose: () => void;
	onSubmit: (point: GroupPoint) => void;
	title?: string;
	/** Main points can point to another line than the one they are pictured in. */
	withRedirect?: boolean;
}

const GroupPointModal: React.FC<Props> = ({
	show,
	onClose,
	onSubmit,
	title = 'Add a related Digimon',
	withRedirect = false,
}) => {
	const [name, setName] = useState('');
	const [line, setLine] = useState('');
	const [redirect, setRedirect] = useState('');

	// Reset the form each time the modal opens.
	useEffect(() => {
		if (show) {
			setName('');
			setLine('');
			setRedirect('');
		}
	}, [show]);

	const submit = () => {
		if (!name) return;
		onSubmit({
			name,
			...(line ? { line } : {}),
			...(withRedirect && redirect ? { redirect } : {}),
		});
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
				{withRedirect && (
					<DigimonField
						title="Redirect"
						values={redirect ? [redirect] : []}
						onSelect={setRedirect}
						onRemove={() => setRedirect('')}
					/>
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

export default GroupPointModal;
