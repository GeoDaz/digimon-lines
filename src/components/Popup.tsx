import React from 'react';
import { OverlayTrigger } from 'react-bootstrap';
import Tooltip from 'react-bootstrap/Tooltip';

interface Props {
	trigger: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
	children: React.ReactNode | string;
}
const Popup: React.FC<Props> = ({ children, trigger }) => (
	<OverlayTrigger
		placement="bottom"
		overlay={<Tooltip>{children}</Tooltip>}
	>
		{trigger}
	</OverlayTrigger>
);

export default Popup;
