import React from 'react';

const Data = ({ color = '#fff' }: { color: string }) => (
	<svg viewBox="0 0 34 39" xmlns="http://www.w3.org/2000/svg">
		<g>
			<path
				d="M15.12,37.073l16.72,-8.187l0.08,-17.28l-14,-9.92l-16.56,8.08l-0.16,17.708l13.92,9.599Z"
				style={{ fill: color }}
			/>
			<path
				d="M6.633,26.467l2.5,1.5l0,2l-2.5,-1.5l0,-2Z"
				style={{ fill: '#000' }}
			/>
			<path d="M11.133,22.967l3.5,2l0,3l-3.5,-2l0,-3Z" style={{ fill: '#000' }} />
			<path
				d="M16.56,33.838l13.073,-5.871l0,-15l-13.073,6.618l0,14.253Z"
				style={{ fill: '#000' }}
			/>
			<path
				d="M2.633,21.467l3.5,1.935l0,-2.935l-3.5,-2l0,3Z"
				style={{ fill: '#000' }}
			/>
		</g>
	</svg>
);

export default Data;
