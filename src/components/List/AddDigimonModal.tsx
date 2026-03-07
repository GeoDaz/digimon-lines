import React, { useState, useContext, useEffect } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import Icon from '@/components/Icon';
import SearchBar from '@/components/SearchBar';
import { DigimonItem } from '@/types/Digimon';
import { capitalize } from '@/functions';
import { DigimonContext } from '@/context/digimon';
import ButtonRemove from '../Button/ButtonRemove';
import LineImage from '../Line/LineImage';

export interface EditData {
	level: string;
	digimon: DigimonItem;
}

interface Props {
	show: boolean;
	handleClose: () => void;
	onSubmit: (level: string, item: DigimonItem, originalName?: string) => void;
	levels: string[];
	editData?: EditData | null;
}

const DigimonModal: React.FC<Props> = ({
	show,
	handleClose,
	onSubmit,
	levels,
	editData,
}) => {
	const { dubNames } = useContext(DigimonContext);
	const [level, setLevel] = useState<string>('');
	const [name, setName] = useState<string>('');
	const [variants, setVariants] = useState<string[]>([]);
	const [modes, setModes] = useState<string[]>([]);
	const [from, setFrom] = useState<string[]>([]);
	const [fusionFrom, setFusionFrom] = useState<string[]>([]);
	const [to, setTo] = useState<string[]>([]);

	const isEditMode = !!editData;

	useEffect(() => {
		if (editData) {
			setLevel(editData.level);
			setName(editData.digimon.name);
			setVariants(editData.digimon.variants || []);
			setModes(editData.digimon.modes || []);
			setFrom(editData.digimon.from || []);
			setFusionFrom(editData.digimon.fusionFrom || []);
			setTo(editData.digimon.to || []);
		} else {
			resetForm();
		}
	}, [editData, show]);

	const resetForm = () => {
		setLevel('');
		setName('');
		setVariants([]);
		setModes([]);
		setFrom([]);
		setFusionFrom([]);
		setTo([]);
	};

	const handleSubmit = () => {
		if (!name || !level) return;

		const item: DigimonItem = { name };
		if (variants.length) item.variants = variants;
		if (modes.length) item.modes = modes;
		if (from.length) item.from = from;
		if (fusionFrom.length) item.fusionFrom = fusionFrom;
		if (to.length) item.to = to;

		const originalName = isEditMode ? editData.digimon.name : undefined;
		onSubmit(level, item, originalName);
		resetForm();
		handleClose();
	};

	const handleCancel = () => {
		resetForm();
		handleClose();
	};

	const handleSelectName = (search: string) => {
		setName(search);
	};

	const handleAddToArray = (
		setter: React.Dispatch<React.SetStateAction<string[]>>,
		current: string[]
	) => {
		return (search: string) => {
			if (!current.includes(search)) {
				setter([...current, search]);
			}
		};
	};

	const handleRemoveFromArray = (
		setter: React.Dispatch<React.SetStateAction<string[]>>,
		current: string[],
		index: number
	) => {
		const updated = current.slice();
		updated.splice(index, 1);
		setter(updated);
	};

	return (
		<Modal show={show} onHide={handleCancel} size="lg">
			<Modal.Header closeButton>
				<Modal.Title>
					{isEditMode ? 'Edit Digimon' : 'Add a Digimon to the list'}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Row style={{ rowGap: '1em' }}>
						<Col md={12} className="gap-2">
							<h5>Level</h5>
							<Form.Select
								value={level}
								onChange={e => setLevel(e.target.value)}
								className="mb-3"
							>
								<option value="">Select a level</option>
								{levels.map(lvl => (
									<option key={lvl} value={lvl}>
										{lvl}
									</option>
								))}
							</Form.Select>
						</Col>
						<Col md={6} className="gap-2">
							<h5>Name</h5>
							<SearchBar
								label="Search a Digimon"
								onSubmit={handleSelectName}
							/>
							{name && (
								<div className="d-flex flex-wrap gap-2">
									<SelectedDigimon
										name={name}
										dubNames={dubNames}
										onRemove={() => setName('')}
									/>
								</div>
							)}
						</Col>
						<Col md={6} className="gap-2">
							<ArrayField
								title="Variants"
								items={variants}
								dubNames={dubNames}
								onAdd={handleAddToArray(setVariants, variants)}
								onRemove={i =>
									handleRemoveFromArray(setVariants, variants, i)
								}
							/>
						</Col>
						<Col md={6} className="gap-2">
							<ArrayField
								title="Modes"
								items={modes}
								dubNames={dubNames}
								onAdd={handleAddToArray(setModes, modes)}
								onRemove={i => handleRemoveFromArray(setModes, modes, i)}
							/>
						</Col>
						<Col md={6} className="gap-2">
							<ArrayField
								title="From"
								items={from}
								dubNames={dubNames}
								onAdd={handleAddToArray(setFrom, from)}
								onRemove={i => handleRemoveFromArray(setFrom, from, i)}
							/>
						</Col>
						<Col md={6} className="gap-2">
							<ArrayField
								title="To"
								items={to}
								dubNames={dubNames}
								onAdd={handleAddToArray(setTo, to)}
								onRemove={i => handleRemoveFromArray(setTo, to, i)}
							/>
						</Col>
						<Col md={6} className="gap-2">
							<ArrayField
								title="Fusion From"
								items={fusionFrom}
								dubNames={dubNames}
								onAdd={handleAddToArray(setFusionFrom, fusionFrom)}
								onRemove={i =>
									handleRemoveFromArray(setFusionFrom, fusionFrom, i)
								}
							/>
						</Col>
					</Row>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleCancel}>
					Cancel
				</Button>
				<Button
					variant="primary"
					onClick={handleSubmit}
					disabled={!name || !level}
				>
					Submit
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

const SelectedDigimon: React.FC<{
	name: string;
	dubNames: Record<string, string>;
	onRemove: () => void;
}> = ({ name, dubNames, onRemove }) => {
	const dubName = dubNames[name];
	return (
		<div className="d-flex align-items-center gap-2 p-2 rounded position-relative border">
			<LineImage name={name} width={40} height={40} zoomable={false} />
			<span className="text-capitalize">
				{capitalize(name)}
				{dubName && ` / ${capitalize(dubName)}`}
			</span>
			<ButtonRemove onClick={onRemove} title="Remove" />
		</div>
	);
};

const ArrayField: React.FC<{
	title: string;
	items: string[];
	dubNames: Record<string, string>;
	onAdd: (name: string) => void;
	onRemove: (index: number) => void;
}> = ({ title, items, dubNames, onAdd, onRemove }) => (
	<div>
		<h5>{title}</h5>
		<SearchBar label="Search a Digimon" onSubmit={onAdd} voidOnSubmit />
		{items.length > 0 && (
			<div className="d-flex flex-wrap gap-2">
				{items.map((item, i) => (
					<SelectedDigimon
						key={i}
						name={item}
						dubNames={dubNames}
						onRemove={() => onRemove(i)}
					/>
				))}
			</div>
		)}
	</div>
);

export default DigimonModal;
