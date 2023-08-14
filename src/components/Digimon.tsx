import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { Digimon as DigimonInterface } from '@/types/Digimon';
import { levels } from '@/consts/levels';
import { LineImage } from './LinePoint';

interface Props {
	digimon: DigimonInterface;
}
const Digimon: React.FC<Props> = ({ digimon }) => {
	return (
		<div className="d-flex mb-4">
			<LineImage name={digimon.name} width={300} height={300} />
			<ListGroup className="text-capitalize" variant="dark">
				<ListGroup.Item>
					<b>Level&nbsp;:</b> {levels[digimon.level]}
				</ListGroup.Item>
				<ListGroup.Item>
					<b>Attribute&nbsp;:</b> {digimon.attribute}
				</ListGroup.Item>
				<ListGroup.Item>
					<b>Elements&nbsp;:</b> {digimon.elements.join(', ')}
				</ListGroup.Item>
				<ListGroup.Item>
					<b>Types&nbsp;:</b> {digimon.types.join(', ')}
				</ListGroup.Item>
				{digimon.tags && (
					<ListGroup.Item>
						<b>Tags&nbsp;:</b> {digimon.tags.join(', ')}
					</ListGroup.Item>
				)}
			</ListGroup>
		</div>
	);
};
export default Digimon;
