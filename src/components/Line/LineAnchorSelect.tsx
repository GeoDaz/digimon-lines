import React from 'react';
import { ButtonGroup, Dropdown, DropdownButton } from 'react-bootstrap';
import Icon from '@/components/Icon';
import { LineAnchor } from '@/types/Line';

const options: Array<{ key: LineAnchor; label: string; icon: string }> = [
	{ key: 'corner', label: 'Corners', icon: 'bounding-box' },
	{ key: 'x-center', label: 'Top / bottom center', icon: 'align-center' },
	{ key: 'y-center', label: 'Left / right center', icon: 'align-middle' },
];

const LineAnchorSelect: React.FC<{
	anchor?: LineAnchor;
	onChange: (anchor: LineAnchor) => void;
}> = ({ anchor = 'corner', onChange }) => {
	const current = options.find(option => option.key === anchor) || options[0];
	return (
		<DropdownButton
			as={ButtonGroup}
			id="line-anchor"
			variant="secondary"
			title={
				<span title="where the diagonal lines touch the images">
					<Icon name="bezier2" /> {current.label}
				</span>
			}
		>
			{options.map(option => (
				<Dropdown.Item
					key={option.key}
					active={option.key === current.key}
					onClick={() => onChange(option.key)}
				>
					<Icon name={option.icon} /> {option.label}
				</Dropdown.Item>
			))}
		</DropdownButton>
	);
};

export default LineAnchorSelect;
