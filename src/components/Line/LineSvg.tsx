import React from 'react';
import { colors } from '@/consts/colors';

// const xMargin = 22.5;
// const yMargin = 30;
export const xUnit: number = 174; // 150 + xMargin
export const yUnit: number = 180; // 150 + yMargin
export const pointWidth: number = 150;
export const pointHeight: number = 150;

const defaultFrom = [0, -1];
interface Props {
	from?: number[] | null;
	color?: string;
	xSize?: number;
	ySize?: number;
	baseWidth?: number;
	baseHeight?: number;
}
const LineSvg: React.FC<Props> = ({
	from = defaultFrom,
	color,
	xSize = 0,
	ySize = 0,
	baseWidth = pointWidth,
	baseHeight = pointHeight,
}) => {
	if (!from) return null;

	const left: boolean = from[0] < 0;
	const halfHeight: number = baseHeight / 2;
	const halfWidth: number = baseWidth / 2;
	let x: number = 0;
	let y: number = 0;
	const xGap = Math.abs(from[0]); // x distance to target
	const yGap = Math.abs(from[1]); // y distance to target 	>>> -0.5
	x = xUnit * xGap; // used for SVG width  => doesn't incur xDest changes
	y = yUnit * yGap; // used for SVG height => doesn't incur yDest changes
	if (xSize > 1 && xGap > 1) {
		x -= pointWidth / 2;
	}
	// if (ySize > 1 && yGap > 1) {
	// 	y -= pointHeight / 2;
	// }
	let xOrigin: number = halfWidth;
	let yOrigin: number = halfHeight;
	let xDest = x;
	let yDest = y;
	const strokeWidth = 12;
	const svgStyle: React.CSSProperties = {};
	if ((xGap > 1 && yGap > 0 && from[1] != -0.5) || (xGap > 0 && yGap > 1)) {
		xDest += (xSize ? xSize - 1 : 0) * (pointWidth / 2 + strokeWidth);
		yDest += (ySize ? ySize - 1 : 0) * (pointHeight / 2 + strokeWidth);

		xOrigin = pointWidth - strokeWidth / 2;
		yOrigin = pointHeight - strokeWidth / 2;
		if (from[0] < 0) {
			svgStyle.zIndex = Math.floor(from[0]);
		} else {
			if (xSize > 1) {
				xOrigin += pointWidth / 2;
			}
			if (ySize > 1) {
				yOrigin += pointHeight / 2;
			}
		}
		xDest -= pointWidth - strokeWidth;
		yDest -= pointHeight - strokeWidth;
	}
	if (xGap == 0.5 && yGap > 0) {
		if (yGap <= 1.5 && ySize <= 1) {
			yOrigin = pointHeight - strokeWidth / 2;
			yDest -= pointHeight - strokeWidth;
		}
	}
	if (yGap == 0.5) {
		if (xGap <= 1.5 && xSize <= 1) {
			xOrigin = pointHeight - strokeWidth / 2;
			xDest -= pointHeight - strokeWidth;
		}
	}

	return (
		<svg
			className={'line-svg ' + (left ? 'left' : 'right')}
			width={baseWidth + x}
			height={baseHeight + y}
			style={svgStyle}
		>
			<line
				x1={xOrigin}
				y1={left ? yOrigin : yOrigin + yDest}
				x2={xOrigin + xDest}
				y2={left ? yOrigin + yDest : yOrigin}
				style={{
					stroke: (color && colors[color]) || colors.default,
					strokeWidth,
					strokeLinecap: 'round',
				}}
			/>
		</svg>
	);
};

export default React.memo(LineSvg);
