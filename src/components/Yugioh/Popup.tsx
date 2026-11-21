import React, { useState } from 'react';
import { OverlayTrigger, OverlayTriggerProps, Popover } from 'react-bootstrap';

export type PopupProps = {
	children: (
		onMouseEnter: () => void,
		onMouseLeave: () => void
	) => OverlayTriggerProps['children'];
	header: React.ReactNode | string;
	body: React.ReactNode | string;
	placement?: OverlayTriggerProps['placement'];
	className?: string;
};
const Popup: React.FC<PopupProps> = ({
	children,
	header,
	body,
	placement = 'bottom',
	className,
}) => {
	const [show, setShow] = useState(false);

	const onMouseEnter = () => setShow(true);
	const onMouseLeave = () => setShow(false);

	return (
		<OverlayTrigger
			placement={placement}
			show={show}
			overlay={
				<Popover
					className={className}
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
				>
					<Popover.Header>{header}</Popover.Header>
					<Popover.Body>{body}</Popover.Body>
				</Popover>
			}
		>
			{children(onMouseEnter, onMouseLeave)}
		</OverlayTrigger>
	);
};

export default Popup;
