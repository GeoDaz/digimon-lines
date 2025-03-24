import React, { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import { makeClassName } from '@/functions';
import { Spinner } from 'react-bootstrap';
import { DIGIMON, LINE } from '@/consts/ui';
import { LicenseContext } from '@/context/license';
import imgPathByLicence from '@/functions/images';

interface Props extends React.ImgHTMLAttributes<any> {
	name: string;
	path?: string;
	title?: string;
	type?: string;
	className?: string;
	style?: object;
	loadable?: boolean;
	mirror?: boolean;
	width?: number | string;
	height?: number | string;
}
const LineImage: React.FC<Props> = ({
	name,
	title = name,
	className,
	style,
	type = LINE,
	path,
	loadable = true,
	mirror = false,
	width = 150,
	height = 150,
}) => {
	const getImgPath = imgPathByLicence[useContext(LicenseContext)?.key || DIGIMON];

	const [src, setSrc] = useState(() => path || getImgPath(name, type));
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
			const nextSrc = getImgPath(name, type);
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
				className={makeClassName(
					'line-img rounded',
					mirror && 'mirror',
					className
				)}
				width={Number(width) / ratioWidth}
				height={Number(height) / ratioHeight}
				title={title}
				style={style}
			/>
			<span className="sr-only">{name}</span>
		</>
	);
};

export default LineImage;
