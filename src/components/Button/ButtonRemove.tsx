import { Button, ButtonProps } from 'react-bootstrap';
import Icon from '../Icon';

const ButtonRemove = (props: ButtonProps) => (
	<Button variant="secondary" {...props}>
		<Icon name="trash3-fill" />
	</Button>
);

export default ButtonRemove;
