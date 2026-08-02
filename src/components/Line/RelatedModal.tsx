import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import DigimonField from '@/components/Line/DigimonField';
import { LineRelation } from '@/types/Line';

interface Props {
	show: boolean;
	onClose: () => void;
	onSubmit: (relation: string | LineRelation) => void;
	initial?: string | LineRelation | null;
}

interface RelationForm {
	name: string;
	for: string;
	from: string;
}

const emptyForm: RelationForm = { name: '', for: '', from: '' };

const toForm = (initial?: string | LineRelation | null): RelationForm => {
	if (!initial) return emptyForm;
	if (typeof initial == 'string') return { name: initial, for: '', from: '' };
	return { name: initial.name, for: initial.for || '', from: initial.from || '' };
};

const RelatedModal: React.FC<Props> = ({ show, onClose, onSubmit, initial }) => {
	const [form, setForm] = useState<RelationForm>(emptyForm);
	const isEdit = !!initial;

	// Reset the form to the edited relation (or empty) each time the modal opens.
	useEffect(() => {
		if (show) setForm(toForm(initial));
	}, [show, initial]);

	const close = () => {
		setForm(emptyForm);
		onClose();
	};

	const submit = () => {
		if (!form.name) return;
		const relation: string | LineRelation =
			form.for || form.from
				? {
						name: form.name,
						...(form.for ? { for: form.for } : {}),
						...(form.from ? { from: form.from } : {}),
				  }
				: form.name;
		onSubmit(relation);
		close();
	};

	return (
		<Modal show={show} onHide={close}>
			<Modal.Header closeButton>
				<Modal.Title>
					{isEdit ? 'Edit related line' : 'Add a related line'}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<DigimonField
					title="Line"
					values={form.name ? [form.name] : []}
					onSelect={name => setForm(f => ({ ...f, name }))}
					onRemove={() => setForm(f => ({ ...f, name: '' }))}
				/>
				<DigimonField
					title="For"
					values={form.for ? [form.for] : []}
					onSelect={value => setForm(f => ({ ...f, for: value }))}
					onRemove={() => setForm(f => ({ ...f, for: '' }))}
				/>
				<DigimonField
					title="From"
					values={form.from ? [form.from] : []}
					onSelect={value => setForm(f => ({ ...f, from: value }))}
					onRemove={() => setForm(f => ({ ...f, from: '' }))}
				/>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={close}>
					Cancel
				</Button>
				<Button variant="primary" onClick={submit} disabled={!form.name}>
					{isEdit ? 'Save' : 'Add'}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default RelatedModal;
