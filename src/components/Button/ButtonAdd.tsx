import React from 'react';
import { Button, ButtonProps } from 'react-bootstrap';
import Icon from '../Icon';
import { makeClassName } from '@/functions';
import { BASE_IMG_SIZE } from '@/consts/grid';

// `ButtonProps.as` n'accepte qu'une balise HTML dans cette version de
// react-bootstrap, alors que le composant sait en rendre un autre. On l'élargit
// pour pouvoir en faire un lien Next (`as={Link} href="…"`).
interface Props extends Omit<ButtonProps, 'as'> {
	as?: React.ElementType;
	href?: string;
}

/** Square "+" button, sized like a line point, used to add an item to a row. */
const ButtonAdd = ({ className, style, ...props }: Props) => (
	<Button
		variant="outline-secondary"
		className={makeClassName(
			'd-flex align-items-center justify-content-center rounded',
			className
		)}
		style={{ width: BASE_IMG_SIZE, height: BASE_IMG_SIZE, ...style }}
		{...(props as ButtonProps)}
	>
		<Icon name="plus" style={{ fontSize: '3rem' }} />
	</Button>
);

export default ButtonAdd;
