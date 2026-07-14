import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import LineImage from '@/components/Line/LineImage';
import ButtonRemove from '@/components/Button/ButtonRemove';
import SearchBar from '@/components/SearchBar';
import { capitalize } from '@/functions';
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
				<RelationField
					title="Line"
					value={form.name}
					onSelect={name => setForm(f => ({ ...f, name }))}
					onClear={() => setForm(f => ({ ...f, name: '' }))}
				/>
				<RelationField
					title="For"
					value={form.for}
					onSelect={value => setForm(f => ({ ...f, for: value }))}
					onClear={() => setForm(f => ({ ...f, for: '' }))}
				/>
				<RelationField
					title="From"
					value={form.from}
					onSelect={value => setForm(f => ({ ...f, from: value }))}
					onClear={() => setForm(f => ({ ...f, from: '' }))}
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

const RelationField: React.FC<{
	title: string;
	value: string;
	onSelect: (value: string) => void;
	onClear: () => void;
}> = ({ title, value, onSelect, onClear }) => (
	<div className="mb-3">
		<h5>{title}</h5>
		<SearchBar
			label="Search a Digimon"
			onSubmit={(v?: string) => v && onSelect(v)}
			voidOnSubmit
		/>
		{value && (
			<div className="d-flex align-items-center gap-2 p-2 rounded border position-relative">
				<LineImage name={value} width={40} height={40} zoomable={false} />
				<span className="text-capitalize">{capitalize(value)}</span>
				<ButtonRemove
					size="sm"
					className="ms-auto"
					title="Remove"
					onClick={onClear}
				/>
			</div>
		)}
	</div>
);

export default RelatedModal;
