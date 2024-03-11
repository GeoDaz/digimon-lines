import Group, { GroupPoint } from '@/types/Group';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import LineImage from '../Line/LineImage';
import LinePoint from '../Line/LinePoint';

const GroupGrid: React.FC<{ group: Group }> = ({ group }) => {
	// TODO ajouter le zoom
	return (
		<div className="frame">
			<div className="line-grid ps-4">
				{Object.entries(group.main).map(([key, points]) => (
					<Row className="line-row" key={key}>
						<Col>
							<div title={key} className="line-point pictured">
								<div className="line-point-safe-zone">
									<LineImage name={key} type={group.type} />
								</div>
							</div>
						</Col>
						{(points as Array<GroupPoint | null>).map((point, i) => (
							<Col key={i}>
								{point ? (
									<LinePoint name={point.name} line={point.line}>
										{!!point.line && (
											<LineImage
												className="line-skin"
												name={point.line}
												title={point.line}
											/>
										)}
									</LinePoint>
								) : (
									<div className="line-point" />
								)}
							</Col>
						))}
					</Row>
				))}
			</div>
		</div>
	);
};
export default GroupGrid;
