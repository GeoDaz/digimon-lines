import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, CardBody, Modal } from 'react-bootstrap';
import LineImage from './LineImage';
import LinePointData from './LinePointData';
import RelationList from '../List/RelationList';
import DigimonModal from '../List/AddDigimonModal';
import DigimonDataModal from '../List/DigimonDataModal';
import Icon from '../Icon';
import { DigimonContext } from '@/context/digimon';
import { capitalize } from '@/functions';
import { IS_DEV } from '@/consts/env';
import useEditDigimon from '@/hooks/useEditDigimon';
import { Digimon, DigimonItem } from '@/types/Digimon';

interface Props {
	name: string;
	path?: string;
	mirror?: boolean;
	open: boolean;
	handleClose: () => void;
}

const LineImageModal: React.FC<Props> = ({
	name,
	path,
	mirror,
	open = false,
	handleClose,
}) => {
	const { data, dubNames, items, itemLevels, levels } = useContext(DigimonContext);
	const { submitItem, submitData } = useEditDigimon();
	// The digimon currently shown; clicking a relation swaps it in place. Resets
	// to the clicked digimon whenever the modal is (re)opened for a new name.
	const [currentName, setCurrentName] = useState(name);
	// Local overrides so edits (dev) reflect live while the modal stays open.
	const [itemMap, setItemMap] = useState<{ [name: string]: DigimonItem }>({});
	const [dataMap, setDataMap] = useState<{ [name: string]: Digimon }>({});
	const [levelMap, setLevelMap] = useState<{ [name: string]: string }>({});
	const [showRelations, setShowRelations] = useState(false);
	const [showData, setShowData] = useState(false);
	useEffect(() => {
		setCurrentName(name);
	}, [name, open]);
	if (!name) return null;
	const activeName = currentName || name;
	const isOriginal = activeName === name;
	const dubName = dubNames[activeName];
	const dataKey =
		data[activeName] ? activeName
		: dubName && data[dubName] ? dubName
		: activeName;
	const item = itemMap[activeName] || items[activeName];
	const itemLevel = levelMap[activeName] || itemLevels[activeName];
	const datum: Digimon | undefined =
		dataMap[activeName] || data[activeName] || (dubName ? data[dubName] : undefined);
	const hasData = !!datum;
	const hasRelations = !!(
		item &&
		(item.variants?.length ||
			item.modes?.length ||
			item.x?.length ||
			item.from?.length ||
			item.fusionFrom?.length ||
			item.to?.length ||
			item.armors?.length)
	);

	const handleSubmitRelations = (
		level: string,
		newItem: DigimonItem,
		originalName?: string,
		originalLevel?: string
	) => {
		submitItem(level, newItem, originalName, originalLevel).then(ok => {
			if (!ok) return;
			setItemMap(prev => ({ ...prev, [newItem.name]: newItem }));
			setLevelMap(prev => ({ ...prev, [newItem.name]: level }));
			if (newItem.name !== activeName) setCurrentName(newItem.name);
		});
	};

	const handleSubmitData = (partial: Partial<Digimon>) => {
		const merged = { ...(datum as Digimon), ...partial, name: dataKey } as Digimon;
		submitData(dataKey, merged).then(ok => {
			if (ok) setDataMap(prev => ({ ...prev, [activeName]: merged }));
		});
	};

	return (
		<Modal show={open} onHide={handleClose} className="line-image-modal pt-4">
			<Modal.Header closeButton>
				<Modal.Title className="text-capitalize break-word">
					{capitalize(activeName)} {dubName && `/ ${capitalize(dubName)}`}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body className="text-center overflow-auto">
				<div className="line-point m-auto">
					<div className="line-point-safe-zone">
						<LineImage
							name={activeName}
							path={isOriginal ? path : undefined}
							mirror={isOriginal ? mirror : undefined}
							width={375}
							height={375}
							zoomable={false}
						/>
					</div>
				</div>
				{IS_DEV && (
					<div className="d-flex gap-2 justify-content-center mt-3">
						<Button
							size="sm"
							variant="outline-light"
							onClick={() => setShowRelations(true)}
						>
							<Icon name="pencil-fill" /> Relations
						</Button>
						<Button
							size="sm"
							variant="outline-light"
							onClick={() => setShowData(true)}
						>
							<Icon name="pencil-fill" /> Data
						</Button>
					</div>
				)}
				{hasData && (
					<Card className="mt-3">
						<CardBody>
							<LinePointData name={activeName} datum={datum} />
						</CardBody>
					</Card>
				)}
				{hasRelations && (
					<div className="d-flex flex-wrap mt-3 mb-2 gap-2 align-items-start justify-content-start">
						<RelationList
							title="Variants"
							relations={item.variants}
							onSelect={setCurrentName}
						/>
						<RelationList
							title="Modes"
							relations={item.modes}
							onSelect={setCurrentName}
						/>
						<RelationList
							title="X"
							relations={item.x}
							onSelect={setCurrentName}
						/>
						<RelationList
							title="From"
							relations={item.from}
							onSelect={setCurrentName}
						/>
						<RelationList
							title="Fusion from"
							relations={item.fusionFrom}
							onSelect={setCurrentName}
						/>
						<RelationList
							title="To"
							relations={item.to}
							onSelect={setCurrentName}
						/>
						<RelationList
							title="Armors"
							relations={item.armors}
							onSelect={setCurrentName}
						/>
					</div>
				)}
			</Modal.Body>
			{IS_DEV && showRelations && (
				<DigimonModal
					show={showRelations}
					handleClose={() => setShowRelations(false)}
					onSubmit={handleSubmitRelations}
					levels={levels}
					editData={
						item && itemLevel ? { level: itemLevel, digimon: item } : null
					}
					defaultName={activeName}
				/>
			)}
			{IS_DEV && showData && (
				<DigimonDataModal
					show={showData}
					name={activeName}
					datum={datum}
					handleClose={() => setShowData(false)}
					onSubmit={handleSubmitData}
				/>
			)}
		</Modal>
	);
};

export default LineImageModal;
