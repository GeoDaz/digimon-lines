import React from 'react';
import { Col } from 'react-bootstrap';
import LinePoint from '@/components/Line/LinePoint';
import LineImage from '@/components/Line/LineImage';
import ButtonRemove from '@/components/Button/ButtonRemove';
import { GroupPoint } from '@/types/Group';

interface Props {
	point: GroupPoint;
	type?: string;
	onRemove?: () => void;
}

/** A group Digimon in its column, with its line skin and its remove button. */
const GroupPointCol: React.FC<Props> = ({ point, type, onRemove }) => (
	<Col className={onRemove ? 'position-relative' : undefined}>
		{!!onRemove && (
			<ButtonRemove size="sm" overlay title="Remove" onClick={onRemove} />
		)}
		<LinePoint name={point.name} line={point.redirect || point.line} type={type}>
			{!!point.line && (
				<LineImage className="line-skin" name={point.line} loadable={false} />
			)}
		</LinePoint>
	</Col>
);

export default GroupPointCol;
