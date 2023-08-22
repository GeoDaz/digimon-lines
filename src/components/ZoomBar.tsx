// modules
import React, { useState, useEffect } from 'react';
import ProgressBarSteps from '@/components/ProgressBarSteps';
import Icon from '@/components/Icon';
import { zooms, zoomOptions } from '@/consts/zooms';

export const ZoomBar: React.FC<{
	defaultZoom?: number;
	handleZoom: CallableFunction;
}> = ({ defaultZoom = 0, handleZoom }) => {
	const [zoom, setZoom] = useState<number | string>(
		Object.keys(zooms).find(key => zooms[key] == defaultZoom) || 0
	);

	useEffect(() => {
		if (window.innerWidth < 576) {
			setZoom(-2);
		} else if (window.innerWidth < 992) {
			setZoom(-1);
		}
	}, []);

	useEffect(() => {
		if (zoom !== undefined) {
			handleZoom(zooms[zoom]);
		}
	}, [zoom]);

	return (
		<div className="zoom-bar d-flex">
			<Icon
				name="zoom-in"
				className="lead d-inline-block d-max-xs-none"
				title="zoom"
			/>
			<ProgressBarSteps
				title="zoom"
				steps={zoomOptions}
				selected={zoom}
				progress={zooms[zoom] / 1.5}
				onChange={setZoom}
				className="progress-zoom me-4"
			/>
		</div>
	);
};

export default ZoomBar;
