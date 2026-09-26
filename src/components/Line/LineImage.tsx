import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
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
	const { zoomFactor } = useContext(ZoomContext);
	const getImgPath = imgPathByLicence[licence] || imgPathByLicence[DIGIMON];
	const [src, setSrc] = useState(() => path || getImgPath(name, type));
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [loadingStyle, setLoadingStyle] = useState({ opacity: 1, zIndex: 2 });

	const zoomedWidth = zoomable ? Number(width) * zoomFactor : Number(width);
	const zoomedHeight = zoomable ? Number(height) * zoomFactor : Number(height);

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

	const handleError = useCallback(() => {
		setSrc('/images/digimon/unknown.jpg');
		setLoading(false);
	}, []);

	const handleLoad = () => {
		setTimeout(() => {
			setLoading(false);
			setLoadingStyle({ opacity: 0, zIndex: 2 });
		}, 300);
		setLoadingStyle(prev => ({ zIndex: prev.zIndex, opacity: 0 }));
	};

	const imgRef = useRef<HTMLImageElement>(null);
	useEffect(() => {
		const img = imgRef.current;
		if (!img?.complete) return;
		if (img.naturalWidth) handleLoad();
		else handleError();
	}, []);

	const capitalizedName = capitalize(name);
	return (
		<>
			{loadable && loading && (
				<div className="spinner-wrapper" style={loadingStyle}>
					<Spinner animation="border" />
				</div>
			)}
			<img
				ref={imgRef}
				src={src}
				loading="lazy"
				decoding="async"
				onError={handleError}
				onLoad={handleLoad}
				width={zoomedWidth}
				height={zoomedHeight}
				alt={capitalizedName}
				title={title || capitalizedName}
				className={makeClassName(
					'line-img rounded',
					expandable && 'click',
					mirror && 'mirror',
					className
				)}
				style={{ color: 'transparent', ...style }}
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
