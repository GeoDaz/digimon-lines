import React from 'react';
import Link from 'next/link';
import { Image } from 'react-bootstrap';

interface Props extends React.ImgHTMLAttributes<any> {
	name: string;
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
export const LineImage: React.FC<Props> = ({ name, ...props }) => (
	<Image
		src={`/images/digimon/${name}.jpg`}
		onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
			console.log('img on error');
			e.currentTarget.onerror = null;
			e.currentTarget.src = '/images/digimon/unknown.jpg';
		}}
		alt={name}
		rounded
		className="line-img"
		width="150"
		height="150"
		{...props}
	/>
);

export default LinePoint;
