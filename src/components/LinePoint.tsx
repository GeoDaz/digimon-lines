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
	className,
	...props
}) => {
	if (available === false) {
		return (
			<div
				title={name}
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
			href={`/${type}s/${line}`}
			title={name}
			className={makeClassName(
				'line-point pictured',
				available && 'available',
				type === GROUP && 'group',
				className
			)}
			style={style}
		>
			<div className="line-point-safe-zone">
				<LineImage name={name} type={type} {...props} />
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

export const LineImage: React.FC<Props> = ({ name, title, className, style, type }) => {
	const [src, setSrc] = useState(
		`/images/${type === GROUP ? 'groups' : 'digimon'}/${name}.jpg`
	);
	const [loading, setLoading] = useState(true);
	const [ratioWidth, setRatioWidth] = useState(1);
	const [ratioHeight, setRatioHeight] = useState(1);
	const [loadingStyle, setLoadingStyle] = useState({ opacity: 1, zIndex: 2 });

	useEffect(() => {
		const nextSrc = `/images/${type === GROUP ? 'groups' : 'digimon'}/${name}.jpg`;
		if (src != nextSrc) {
			setLoading(true);
			setLoadingStyle({ opacity: 1, zIndex: 5 });
			setSrc(nextSrc);
		}
	}, [name]);

	return (
		<>
			{loading && (
				<div className="spinner-wrapper" style={loadingStyle}>
					<Spinner animation="border" />
				</div>
			)}
			<Image
				src={src}
				onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
					setSrc('/images/digimon/unknown.jpg');
					setLoading(false);
				}}
				onLoad={e => {
					setTimeout(() => {
						setLoading(false);
						setLoadingStyle({ opacity: 0, zIndex: 2 });
					}, 300);
					setLoadingStyle({ zIndex: loadingStyle.zIndex, opacity: 0 });
				}}
				onLoadingComplete={({ naturalWidth, naturalHeight }) => {
					if (naturalWidth > naturalHeight) {
						setRatioHeight(naturalWidth / naturalHeight);
					} else {
						setRatioWidth(naturalHeight / naturalWidth);
					}
				}}
				alt={name}
				className={makeClassName('line-img rounded', className)}
				width={150 / ratioWidth}
				height={150 / ratioHeight}
				title={title}
				style={style}
			/>
			<span className="sr-only">{name}</span>
		</>
	);
};

export default LinePoint;
