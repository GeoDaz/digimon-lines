import { DigimonContext } from '@/context/digimon';
import { capitalize, makeClassName } from '@/functions';
import { DigimonItem } from '@/types/Digimon';
import React, { useContext } from 'react';
import { Button, Card, CardBody, CardHeader } from 'react-bootstrap';
import LineImage from '../Line/LineImage';
import Icon from '../Icon';
import RelationList from './RelationList';

interface Props {
	digimon: DigimonItem;
	hash?: string;
	onEdit?: (digimon: DigimonItem) => void;
}
const ListItem: React.FC<Props> = ({ digimon, hash, onEdit }) => {
	const { dubNames } = useContext(DigimonContext);
	const dubName = dubNames[digimon.name];
	return (
		<div
			id={digimon.name}
			className="d-flex flex-column list-item"
			style={{
				scrollMarginTop: '72px',
			}}
		>
			<div
				id={dubName}
				className="d-flex flex-column flex-grow-1"
				style={{
					scrollMarginTop: '72px',
				}}
			>
				<Card
					className={makeClassName(
						'flex-grow-1 position-relative',
						hash == digimon.name || (hash == dubName && 'active-outline')
					)}
					style={{ width: '18.5rem' }}
				>
					<CardHeader>
						{onEdit && (
							<Button
								variant="secondary"
								size="sm"
								className="position-absolute top-0 end-0 m-2"
								onClick={() => onEdit(digimon)}
								title="Edit"
							>
								<Icon name="pencil-fill" />
							</Button>
						)}
						<div className="text-center">
							<div className="d-inline-block position-relative">
								<LineImage
									name={digimon.name}
									width={90}
									height={90}
									zoomable={false}
									expandable={true}
								/>
							</div>
						</div>
						<h3 className="text-center mt-2">{capitalize(digimon.name)} </h3>
						{dubName && (
							<h4 className="text-center">{capitalize(dubName)}</h4>
						)}
					</CardHeader>
					<CardBody>
						<div className="d-flex flex-wrap gap-2 align-items-start flex-grow-0">
							<RelationList title="Variants" relations={digimon.variants} />
							<RelationList title="Modes" relations={digimon.modes} />
							<RelationList title="X" relations={digimon.x} />
							<RelationList title="From" relations={digimon.from} />
							<RelationList
								title="Fusion from"
								relations={digimon.fusionFrom}
							/>
							<RelationList title="To" relations={digimon.to} />
							<RelationList title="Armors" relations={digimon.armors} />
						</div>
					</CardBody>
				</Card>
			</div>
		</div>
	);
};

export default ListItem;
