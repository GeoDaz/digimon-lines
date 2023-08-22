import { makeClassName } from '@/functions';
import React, { MouseEventHandler, ReactNode } from 'react';

interface Props {
	checked: boolean;
	toggle: MouseEventHandler<HTMLInputElement>;
	label?: string | ReactNode;
	labelOn?: string | ReactNode;
	labelOff?: string | ReactNode;
}
const BoostrapSwitch: React.FC<Props> = ({
	checked,
	toggle,
	label,
	labelOn = 'On',
	labelOff = 'Off',
}) => {
	return (
		<div
			className={makeClassName(
				'switch btn',
				checked ? 'on btn-primary' : 'off btn-secondary'
			)}
			onClick={toggle}
		>
			{label}{' '}
			<div className="switch-group">
				<span className="switch-on btn-primary">{labelOn}</span>
				<span className="switch-off btn-secondary">{labelOff}</span>
				<span className="switch-handle btn btn-light" />
			</div>
		</div>
	);
};

export default BoostrapSwitch;
