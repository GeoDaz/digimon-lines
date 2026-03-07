import React, { useState, useContext } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import Icon from '@/components/Icon';
import SearchBar from '@/components/SearchBar';
import { DigimonItem } from '@/types/Digimon';
import { capitalize } from '@/functions';
import { DigimonContext } from '@/context/digimon';
import ButtonRemove from '../Button/ButtonRemove';
import LineImage from '../Line/LineImage';

interface Props {
	show: boolean;
	handleClose: () => void;
	onSubmit: (level: string, item: DigimonItem) => void;
	levels: string[];
}

const AddDigimonModal: React.FC<Props> = ({ show, handleClose, onSubmit, levels }) => {
	const { dubNames } = useContext(DigimonContext);
	const [level, setLevel] = useState<string>('');
	const [name, setName] = useState<string>('');
	const [variants, setVariants] = useState<string[]>([]);
	const [modes, setModes] = useState<string[]>([]);
	const [from, setFrom] = useState<string[]>([]);
	const [fusionFrom, setFusionFrom] = useState<string[]>([]);
	const [to, setTo] = useState<string[]>([]);

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

		onSubmit(level, item);
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
				<Modal.Title>Add a Digimon to the list</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Row>
						<Col md={12}>
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
						<Col md={6}>
							<h5>Name</h5>
							<SearchBar
								label="Search a Digimon"
								onSubmit={handleSelectName}
							/>
							{name && (
								<SelectedDigimon
									name={name}
									dubNames={dubNames}
									onRemove={() => setName('')}
								/>
							)}
						</Col>
						<Col md={6}>
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
						<Col md={6}>
							<ArrayField
								title="Modes"
								items={modes}
								dubNames={dubNames}
								onAdd={handleAddToArray(setModes, modes)}
								onRemove={i => handleRemoveFromArray(setModes, modes, i)}
							/>
						</Col>
						<Col md={6}>
							<ArrayField
								title="From"
								items={from}
								dubNames={dubNames}
								onAdd={handleAddToArray(setFrom, from)}
								onRemove={i => handleRemoveFromArray(setFrom, from, i)}
							/>
						</Col>
						<Col md={6}>
							<ArrayField
								title="To"
								items={to}
								dubNames={dubNames}
								onAdd={handleAddToArray(setTo, to)}
								onRemove={i => handleRemoveFromArray(setTo, to, i)}
							/>
						</Col>
						<Col md={6}>
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
		<div
			className="d-flex align-items-center gap-3 mb-3 p-2 rounded border position-relative"
		>
			<LineImage name={name} width={60} height={60} zoomable={false} />
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
}> = ({ title, items, dubNames, onAdd, onRemove }) => {
	return (
		<div>
			<h5>{title}</h5>
			<SearchBar label="Search a Digimon" onSubmit={onAdd} voidOnSubmit />
			{items.length > 0 && (
				<div className="d-flex flex-wrap gap-2 mt-2">
					{items.map((item, i) => (
						<div
							key={i}
							className="d-flex align-items-center gap-2 p-2 rounded position-relative"
							style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}
						>
							<LineImage
								name={item}
								width={40}
								height={40}
								zoomable={false}
							/>
							<span className="text-capitalize">
								{capitalize(item)}
								{dubNames[item] && ` / ${capitalize(dubNames[item])}`}
							</span>
							<ButtonRemove onClick={() => onRemove(i)} title="Retirer" />
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default AddDigimonModal;
