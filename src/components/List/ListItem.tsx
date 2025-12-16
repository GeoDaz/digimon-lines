import { DigimonContext } from '@/context/digimon';
import { capitalize, makeClassName } from '@/functions';
import { DigimonItem } from '@/types/Digimon';
import React, { useContext } from 'react';
import { Card, CardBody, CardHeader } from 'react-bootstrap';
import LineImage from '../Line/LineImage';
import AnchorLink from '../AnchorLink';

interface Props {
	digimon: DigimonItem;
	hash?: string;
}
const ListItem: React.FC<Props> = ({ digimon, hash }) => {
	const { dubNames } = useContext(DigimonContext);
	const dubName = dubNames[digimon.name];
	return (
		<div
			id={digimon.name}
			className="d-flex flex-column"
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
						'flex-grow-1',
						hash == digimon.name || (hash == dubName && 'active-outline')
					)}
					style={{ minWidth: '21rem', maxWidth: '21rem' }}
				>
					<CardHeader>
						<div className="text-center">
							<div className="d-inline-block position-relative">
								<LineImage name={digimon.name} width={90} height={90} />
							</div>
						</div>
						<h3 className="text-center mt-2">
							{capitalize(digimon.name)}{' '}
							{dubName && `/ ${capitalize(dubName)}`}
						</h3>
					</CardHeader>
					<CardBody className="d-flex flex-wrap gap-2 align-items-start">
						<RelationList title="Variants" relations={digimon.variants} />
						<RelationList title="Modes" relations={digimon.modes} />
						<RelationList title="From" relations={digimon.from} />
						<RelationList
							title="Fusion from"
							relations={digimon.fusionFrom}
						/>
						<RelationList title="To" relations={digimon.to} />
					</CardBody>
				</Card>
			</div>
		</div>
	);
};

const RelationList: React.FC<{ title: string; relations: string[] | undefined }> = ({
	title,
	relations,
}) => {
	if (!relations?.length) return null;
	return (
		<div
			className="rounded p-2 pt-1"
			style={{
				backgroundColor: 'var(--bs-card-cap-bg)',
				border: 'var(--bs-card-border-width) solid var(--bs-card-border-color)',
			}}
		>
			<strong className="d-block mb-1">{title}&nbsp;:</strong>
			<div className="d-flex flex-wrap gap-2">
				{relations.map(name => (
					<RelationItem name={name} key={name} />
				))}
			</div>
		</div>
	);
};

const RelationItem: React.FC<{ name: string }> = ({ name }) => {
	const { dubNames } = useContext(DigimonContext);
	const dubName = dubNames[name];
	return (
		<AnchorLink hash={name} key={name}>
			<div className="d-inline-block position-relative">
				<LineImage name={name} width={60} height={60} />
			</div>
			<span className="sr-only">
				{capitalize(name)} {dubName && `/ ${capitalize(dubName)}`}
			</span>
		</AnchorLink>
	);
};

export default ListItem;
