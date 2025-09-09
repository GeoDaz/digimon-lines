import React from 'react';

const Virus = ({ color = '#fff' }: { color: string }) => (
	<svg viewBox="0 0 41 40" xmlns="http://www.w3.org/2000/svg">
		<g>
			<path
				d="M20.333,1.667l5,6l8,-1l-1,9l6.46,4.539l-6.46,4.461l1,9l-9,-1l-4,6l-5,-6l-9,1l1.5,-8l-6.5,-5l6.5,-6l-1.5,-8l9,1l5,-6Z"
				style={{ fill: color }}
			/>
			<path
				d="M13.333,26.667l6,1.406l0,3.04l-6,-1.446l0,-3Z"
				style={{ fill: '#000' }}
			/>
			<path d="M19.785,25.667l3.548,1l-1,-5l-2.548,4Z" style={{ fill: '#000' }} />
			<path
				d="M12.333,24.667l-3.408,-1.517l1.872,-4.483l1.536,6Z"
				style={{ fill: '#000' }}
			/>
		</g>
	</svg>
);

export default Virus;
