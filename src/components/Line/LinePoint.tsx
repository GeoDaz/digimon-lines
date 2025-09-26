import React from 'react';
import Link from 'next/link';
import { capitalize, makeClassName } from '@/functions';
import Icon from '@/components/Icon';
import { GROUP, LINE } from '@/consts/ui';
import LineImage from './LineImage';

interface Props extends React.ImgHTMLAttributes<any> {
	name: string;
	line?: string;
	title?: string;
	type?: string;
	className?: string;
	style?: object;
	children?: React.ReactNode;
	available?: boolean;
	grid?: string[];
}
const LinePoint: React.FC<Props> = ({
	name,
	line = name,
	type = LINE,
	style,
	available,
	children,
	className,
	grid,
	...props
}) => {
	const capitalizedName = capitalize(name);
	if (available === false) {
		return (
			<div
				title={capitalizedName}
				className={makeClassName(
					'line-point pictured unavailable',
					type === GROUP && 'group',
					className
				)}
				style={style}
			>
				<div className="line-point-safe-zone">
					<LineImage name={name} type={type} {...props} />
				</div>
				<span className="absolute-legend hover-only text-warning fw-bold">
					<Icon name="exclamation-triangle-fill" /> Work in progress...
				</span>
				{children}
			</div>
		);
	}
	return (
		<Link
			href={`/${type}/${line}`}
			title={capitalizedName}
			className={makeClassName(
				'line-point pictured',
				available && 'available',
				type === GROUP && 'group',
				className
			)}
			style={style}
		>
			<div className={makeClassName('line-point-safe-zone', grid && 'gridded')}>
				<LineImage name={name} type={type} {...props} />
				<div className="d-flex">
					{!!grid &&
						grid.map(name => (
							<LineImage key={name} name={name} type={type} {...props} />
						))}
				</div>
			</div>
			{available && (
				<Icon
					name="arrow-right-circle-fill"
					className="text-primary hover-only circle"
				/>
			)}
			{children}
		</Link>
	);
};

export default LinePoint;
