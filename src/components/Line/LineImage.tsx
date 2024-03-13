import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { makeClassName } from '@/functions';
import { Spinner } from 'react-bootstrap';
import { DIGIEGG, GROUP, LINE } from '@/consts/ui';

const DIRS = [GROUP, DIGIEGG];

const makeImgPath = (name: string, type: string) => {
	return `/images/${DIRS.includes(type) ? type : 'digimon'}/${name}.jpg`;
};

interface Props extends React.ImgHTMLAttributes<any> {
	name: string;
	path?: string;
	title?: string;
	type?: string;
	className?: string;
	style?: object;
	loadable?: boolean;
}
const LineImage: React.FC<Props> = ({
	name,
	title = name,
	className,
	style,
	type = LINE,
	path,
	loadable = true,
}) => {
	const [src, setSrc] = useState(() => path || makeImgPath(name, type));
	const [loading, setLoading] = useState(true);
	const [ratioWidth, setRatioWidth] = useState(1);
	const [ratioHeight, setRatioHeight] = useState(1);
	const [loadingStyle, setLoadingStyle] = useState({ opacity: 1, zIndex: 2 });

	useEffect(() => {
		if (path) {
			if (path != src) {
				setLoading(true);
				setLoadingStyle({ opacity: 1, zIndex: 5 });
				setSrc(path);
			}
		} else {
			const nextSrc = makeImgPath(name, type);
			if (src != nextSrc) {
				setLoading(true);
				setLoadingStyle({ opacity: 1, zIndex: 5 });
				setSrc(nextSrc);
			}
		}
	}, [name, path]);

	return (
		<>
			{loadable && loading && (
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
						setRatioHeight(naturalWidth / naturalHeight || 1);
					} else {
						setRatioWidth(naturalHeight / naturalWidth || 1);
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

export default LineImage;
