import React, { MouseEventHandler } from 'react';
import { makeClassName } from '../functions';

interface Props {
	name: string;
	className?: string;
	onClick?: MouseEventHandler<HTMLElement> | undefined;
}
const Icon: React.FC<Props> = ({ name, className, onClick }) => (
	<i className={makeClassName(`bi bi-${name}`, className)} onClick={onClick}></i>
);
export default Icon;
