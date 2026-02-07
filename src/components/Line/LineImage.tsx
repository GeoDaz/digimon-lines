import React, { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import { capitalize, makeClassName } from '@/functions';
import { Spinner } from 'react-bootstrap';
import { DIGIMON, LINE } from '@/consts/ui';
import { LicenseContext } from '@/context/license';
import { ZoomContext } from '@/context/zoom';
import { BASE_IMG_SIZE } from '@/consts/grid';
import imgPathByLicence from '@/functions/images';
import LineImageModal from './LineImageModal';

interface Props extends React.ImgHTMLAttributes<any> {
	name: string;
	path?: string;
	title?: string;
	type?: string;
	className?: string;
	style?: object;
	expandable?: boolean;
	loadable?: boolean;
	mirror?: boolean;
	zoomable?: boolean;
	width?: number | string;
	height?: number | string;
}
const LineImage: React.FC<Props> = ({
	name,
	title,
	className,
	style,
	type = LINE,
	path,
	expandable = false,
	loadable = true,
	mirror = false,
	zoomable = true,
	width = BASE_IMG_SIZE,
	height = BASE_IMG_SIZE,
}) => {
	const licence = useContext(LicenseContext)?.key || DIGIMON;
	const { imgSize } = useContext(ZoomContext);
	const getImgPath = imgPathByLicence[licence];
	const [src, setSrc] = useState(() => path || getImgPath(name, type));
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [ratioWidth, setRatioWidth] = useState(1);
	const [ratioHeight, setRatioHeight] = useState(1);
	const [loadingStyle, setLoadingStyle] = useState({ opacity: 1, zIndex: 2 });

	// Use zoomed dimensions only if default props are used (150)
	// Otherwise respect explicit width/height props (for modals)
	const zoomedWidth = zoomable ? imgSize : Number(width);
	const zoomedHeight = zoomable ? imgSize : Number(height);

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

	const capitalizedName = capitalize(name);
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
				width={zoomedWidth / ratioWidth}
				height={zoomedHeight / ratioHeight}
				alt={capitalizedName}
				title={title || capitalizedName}
				className={makeClassName(
					'line-img rounded',
					expandable && 'click',
					mirror && 'mirror',
					className
				)}
				style={style}
				onClick={() => expandable && setOpen(true)}
			/>
			<span className="sr-only">{capitalizedName}</span>
			{expandable && open && (
				<LineImageModal
					name={name}
					path={src}
					mirror={mirror}
					open={open}
					handleClose={() => setOpen(false)}
				/>
			)}
		</>
	);
};

export default LineImage;
