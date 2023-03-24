import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Props extends React.ImgHTMLAttributes<any> {
	name: string;
	title?: string;
	style?: object;
}
const LinePoint: React.FC<Props> = ({ name, style, ...props }) => {
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
		</Link>
	);
};

// TODO faire les images d'erreurs en CSS ?
export const LineImage: React.FC<Props> = ({ name, title, style }) => {
	const [src, setSrc] = useState(`/images/digimon/${name}.jpg`);
	return (
		<Image
			src={src}
			onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
				setSrc('/images/digimon/unknown.jpg');
			}}
			alt={name}
			className="line-img rounded"
			width={150}
			height={150}
			title={title}
			style={style}
		/>
	);
};

export default LinePoint;
