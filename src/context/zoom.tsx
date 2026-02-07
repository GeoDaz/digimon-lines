import React from 'react';
import { createContext, useMemo, useState } from 'react';
import { DEFAULT_ZOOM } from '@/consts/zooms';
import { BASE_IMG_SIZE, BASE_GRID_SPACING } from '@/consts/grid';

export interface ZoomContextInterface {
	zoom: number;
	zoomFactor: number;
	imgSize: number;
	gridSpacing: number;
	unit: number;
}

export const defaultZoomContext: ZoomContextInterface = {
	zoom: DEFAULT_ZOOM,
	zoomFactor: 1,
	imgSize: BASE_IMG_SIZE,
	gridSpacing: BASE_GRID_SPACING,
	unit: BASE_IMG_SIZE + BASE_GRID_SPACING,
};

export const ZoomContext = createContext<ZoomContextInterface>(defaultZoomContext);

export const makeZoomContext = (zoom: number = DEFAULT_ZOOM) => {
	const zoomFactor = zoom / 100;
	const gridSpacing = BASE_GRID_SPACING * zoomFactor;
	const imgSize = BASE_IMG_SIZE * zoomFactor;
	return {
		zoom,
		zoomFactor,
		imgSize,
		gridSpacing,
		unit: imgSize + gridSpacing,
	};
};

export const ZoomProvider = ({
	zoom = DEFAULT_ZOOM,
	children,
}: {
	zoom?: number;
	children: React.ReactNode;
}) => {
	const zoomContext = useMemo(() => makeZoomContext(zoom), [zoom]);

	return <ZoomContext.Provider value={zoomContext}>{children}</ZoomContext.Provider>;
};
