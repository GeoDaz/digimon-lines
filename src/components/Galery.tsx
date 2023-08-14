import React from 'react';
import { Col, Row } from 'react-bootstrap';
import LinePoint, { LineImage } from './LinePoint';

interface Props {
	title: string;
	list: any[];
}
const Galery: React.FC<Props> = ({ title, list }) => (
	<div className="line-wrapper pb-0 pt-0">
		<h2>{title}&nbsp;:</h2>
		<Row className="line-row">
			{list.map((element, i) => {
				if (typeof element == 'string') {
					return (
						<Col key={i}>
							<LinePoint name={element} />
						</Col>
					);
				}
				return (
					<Col key={i}>
						<LinePoint name={element.name}>
							{element.skins?.length &&
								element.skins.map((skin: string, i: number) => (
									<LineImage
										key={i}
										className="line-skin"
										name={skin}
									/>
								))}
						</LinePoint>
					</Col>
				);
			})}
		</Row>
	</div>
);

export default Galery;
