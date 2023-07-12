import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { makeClassName } from '@/functions';
import { Spinner } from 'react-bootstrap';
import Icon from './Icon';
import { GROUP, LINE } from '@/consts/ui';

interface Props extends React.ImgHTMLAttributes<any> {
	name: string;
	line?: string;
	title?: string;
	type?: string;
	className?: string;
	style?: object;
	children?: React.ReactNode;
	available?: boolean;
}
const LinePoint: React.FC<Props> = ({
	name,
	line = name,
	type = LINE,
	style,
	available,
	children,
	...props
}) => {
	if (available === false) {
		return (
			<div title={name} className={'line-point pictured unavailable'} style={style}>
				<div className="line-point-safe-zone">
					<LineImage name={name} type={type} {...props} />
				</div>
				<span className="hover-only text-warning fw-bold">
					<Icon name="exclamation-triangle-fill" /> Work in progress...
				</span>
				{children}
			</div>
		);
	}
	return (
		<Link
			href={`/${type}s/${line}`}
			title={name}
			className={makeClassName('line-point pictured', available && 'available')}
			style={style}
		>
			<div className="line-point-safe-zone">
				<LineImage name={name} type={type} {...props} />
			</div>
			{available && (
				<Icon
					name="arrow-right-circle-fill"
					className="text-primary hover-only"
				/>
			)}
			{children}
		</Link>
	);
};

export const LineImage: React.FC<Props> = ({ name, title, className, style, type }) => {
	const [src, setSrc] = useState(`/images/${type === GROUP ? 'groups' : 'digimon'}/${name}.jpg`);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const nextSrc = `/images/${type === GROUP ? 'groups' : 'digimon'}/${name}.jpg`;
		if (src != nextSrc) {
			setLoading(true);
			setSrc(nextSrc);
		}
	}, [name]);

	return (
		<>
			{loading && (
				<div className="spinner-wrapper">
					<Spinner animation="border" />
				</div>
			)}
			<Image
				src={src}
				onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
					setSrc('/images/digimon/unknown.jpg');
					setLoading(false);
				}}
				onLoad={e => setLoading(false)}
				alt={name}
				className={makeClassName('line-img rounded', className)}
				width={150}
				height={150}
				title={title}
				style={style}
			/>
		</>
	);
};

export default LinePoint;
