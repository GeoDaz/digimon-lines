import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { makeClassName } from '@/functions';
import { Spinner } from 'react-bootstrap';

interface Props extends React.ImgHTMLAttributes<any> {
	name: string;
	title?: string;
	className?: string;
	style?: object;
	children?: React.ReactNode;
}
const LinePoint: React.FC<Props> = ({ name, style, children, ...props }) => {
	return (
		<Link
			href={`/lines/${name}`}
			title={name}
			className="line-point pictured"
			style={style}
		>
			<div className="line-point-safe-zone">
				<LineImage name={name} {...props} />
			</div>
			{children}
		</Link>
	);
};

// TODO faire les images d'erreurs en CSS ?
export const LineImage: React.FC<Props> = ({ name, title, className, style }) => {
	const [src, setSrc] = useState(`/images/digimon/${name}.jpg`);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const nextSrc = `/images/digimon/${name}.jpg`;
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
