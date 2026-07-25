import { DigimonContext } from '@/context/digimon';
import { capitalize } from '@/functions';
import { Card, CardBody } from 'react-bootstrap';
import React, { useContext } from 'react';
import LineImage from '../Line/LineImage';
import AnchorLink from '../AnchorLink';

export const RelationList: React.FC<{
	title: string;
	relations: string[] | undefined;
	onSelect?: (name: string) => void;
}> = ({ title, relations, onSelect }) => {
	if (!relations?.length) return null;
	return (
		<Card className="p-2 pt-1">
			<strong className="d-block mb-1 text-start">{title}&nbsp;:</strong>
			<div className="d-flex flex-wrap gap-2">
				{relations.map(name => (
					<RelationItem name={name} key={name} onSelect={onSelect} />
				))}
			</div>
		</Card>
	);
};

const RelationItem: React.FC<{ name: string; onSelect?: (name: string) => void }> = ({
	name,
	onSelect,
}) => {
	const { dubNames } = useContext(DigimonContext);
	const dubName = dubNames[name];
	const label = (
		<>
			<div className="d-inline-block position-relative">
				<LineImage name={name} width={60} height={60} zoomable={false} />
			</div>
			<span className="sr-only">
				{capitalize(name)} {dubName && `/ ${capitalize(dubName)}`}
			</span>
		</>
	);
	// When onSelect is provided (e.g. inside the image modal), swap the displayed
	// digimon in place instead of navigating to its card via the hash.
	if (onSelect) {
		return (
			<button
				type="button"
				className="btn btn-link p-0 border-0"
				onClick={() => onSelect(name)}
			>
				{label}
			</button>
		);
	}
	return (
		<AnchorLink hash={name} key={name}>
			{label}
		</AnchorLink>
	);
};

export default RelationList;
