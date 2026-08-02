import { Button, ButtonProps } from 'react-bootstrap';
import Icon from '../Icon';
import { makeClassName } from '@/functions';

interface Props extends ButtonProps {
	/** Pin the button in the top right corner of a positioned parent. */
	overlay?: boolean;
}

const ButtonRemove = ({ overlay, className, style, ...props }: Props) => (
	<Button
		variant="secondary"
		className={makeClassName(overlay && 'position-absolute top-1', className)}
		style={
			overlay ?
				{ zIndex: 3, right: 'calc(var(--bs-gutter-x) * .5)', ...style }
			:	style
		}
		{...props}
	>
		<Icon name="trash3-fill" />
	</Button>
);

export default ButtonRemove;
