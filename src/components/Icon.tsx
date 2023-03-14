import React, { MouseEventHandler } from 'react';
import { makeClassName } from '@/functions';

interface Props {
	name: string;
	className?: string;
	onClick?: MouseEventHandler<HTMLElement> | undefined;
	style?: object;
}
const Icon: React.FC<Props> = ({ name, className, ...props }) => (
	<i className={makeClassName(`bi bi-${name}`, className)} {...props}></i>
);
export default Icon;
