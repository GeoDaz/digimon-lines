import React from 'react';
import { Col } from 'react-bootstrap';
import LinePoint from '@/components/Line/LinePoint';
import LineImage from '@/components/Line/LineImage';
import ButtonRemove from '@/components/Button/ButtonRemove';
import { makeClassName } from '@/functions';
import { GroupPoint } from '@/types/Group';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	point: GroupPoint;
	type?: string;
	onRemove?: () => void;
	/** Drag and drop props, see useDragReorder. */
	draggable?: boolean;
	dragging?: boolean;
}

/** A group Digimon in its column, with its line skin and its remove button. */
const GroupPointCol: React.FC<Props> = ({
	point,
	type,
	onRemove,
	dragging = false,
	className,
	...props
}) => (
	<Col
		{...props}
		className={makeClassName(
			'position-relative',
			props.draggable && 'reorderable',
			dragging && 'dragging',
			className
		)}
	>
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
