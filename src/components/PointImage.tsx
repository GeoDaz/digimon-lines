import React from 'react';
import { Link } from 'react-router-dom';
import { Image } from 'react-bootstrap';

interface Props {
	name: string;
	className?: string;
	style?: React.CSSProperties;
}
const PointImage: React.FC<Props> = ({ name, className, style }) => {
	return (
		<Link
			to={`/lines/${name}`}
			title={name}
			className="line-point pictured"
			style={style}
		>
			<div className="line-point-safe-zone">
				<Image
					src={`/images/digimon/${name}.jpg`}
					alt={name}
					rounded
					className="line-img"
				/>
			</div>
		</Link>
	);
};
export default PointImage;
