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
	size?: number;
	baseWidth?: number;
	baseHeight?: number;
}
const LineSvg: React.FC<Props> = ({
	from = defaultFrom,
	color,
	size = 0,
	baseWidth = pointWidth,
	baseHeight = pointHeight,
}) => {
	if (!from) return null;

	const left: boolean = from[0] < 0;
	const halfHeight: number = baseHeight / 2;
	const halfWidth: number = baseWidth / 2;
	let x: number = 0;
	let y: number = 0;
	const xGap = Math.abs(from[0]);
	const yGap = Math.abs(from[1]);
	x = xUnit * xGap; // 150 + 12 * 2
	if (size > 1 && xGap >= 1) {
		x -= pointWidth / 2;
	}
	y = yUnit * yGap; // 150 + 15 * 2
	let yOrigin: number = halfHeight; // halfHeight;
	let xOrigin: number = halfWidth;
	let xDest = x;
	let yDest = y;
	const strokeWidth = 12;
	const svgStyle: React.CSSProperties = {};
	if (xGap > 1 && yGap > 0) {
		// prettier-ignore
		xDest += (size ? size - 1 : 0)
		* (pointWidth / 2 + strokeWidth);

		xOrigin = pointWidth - strokeWidth / 2;
		yOrigin = pointHeight - strokeWidth / 2;
		if (from[0] < 0) {
			svgStyle.zIndex = Math.floor(from[0]);
		} else if (size > 1) {
			xOrigin += pointWidth / 2;
		}
		xDest -= pointWidth - strokeWidth;
		yDest -= pointHeight - strokeWidth;
	}
	if (xGap == 0.5 && yGap > 0) {
		yOrigin = pointHeight - strokeWidth / 2;
		yDest -= pointHeight - strokeWidth;
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
