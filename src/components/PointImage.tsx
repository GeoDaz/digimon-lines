import React from 'react';
import { Link } from 'react-router-dom';
import { Image } from 'react-bootstrap';

interface Props {}
const PointImage: React.FC<Props> = ({ ref, className, style }) => {
	return (
		<Link
			to={`/lines/${ref}`}
			title={ref}
			className="line-point pictured"
			style={style}
		>
			<div className="line-point-safe-zone">
				<Image
					src={`/images/digimon/${ref}.jpg`}
					alt={ref}
					rounded
					className="line-img"
				/>
			</div>
		</Link>
	);
};
export default PointImage;
