import { useState } from 'react';

const zooms: { [key: string]: string | number } = {
	'-3': 25,
	'-2': 5,
	'-1': 75,
	'0': 100,
	'1': 125,
	2: 150,
};

const useZoom = () => {
	const [zoom, setZoom] = useState(0);
	return [zooms, zooms[zoom], setZoom];
};
export default useZoom;
