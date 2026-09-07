import React from 'react';

const Pokeball = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		viewBox="0 0 21 21"
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
		{...props}
	>
		<g transform="matrix(1.005332,0,0,1.004275,-2.822455,-2.01929)">
			<g transform="matrix(0.994697,0,0,0.995744,0.924503,0.104426)">
				<path d="M3,12C3,16.937 7.063,21 12,21C16.937,21 21,16.937 21,12C21,7.063 16.937,3 12,3C7.063,3 3,7.063 3,12" />
				<path d="M9,12C9,13.646 10.354,15 12,15C13.646,15 15,13.646 15,12C15,10.354 13.646,9 12,9C10.354,9 9,10.354 9,12" />
				<path d="M3,12L9,12" />
				<path d="M15,12L21,12" />
			</g>
		</g>
	</svg>
);

export default Pokeball;
