import React, { useContext } from 'react';
import { colors } from '@/consts/colors';
import { ZoomContext } from '@/context/zoom';
import { BASE_STROKE_WIDTH } from '@/consts/grid';

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
	baseWidth,
	baseHeight,
}) => {
	const { zoomFactor, imgSize, gridSpacing, unit } = useContext(ZoomContext);
	if (!from) return null;

	// Apply zoom to all dimensions
	const strokeWidth = BASE_STROKE_WIDTH * zoomFactor;
	const strokeHalf = strokeWidth / 2;
	const pointWidth = imgSize;
	const pointHeight = imgSize;
	const xUnit = unit;
	const yUnit = unit;

	// Use provided baseWidth/baseHeight or default to zoomed values
	const zoomedBaseWidth = baseWidth ?? pointWidth;
	const zoomedBaseHeight = baseHeight ?? pointHeight;

	const x: number = from[0] || 0;
	const y: number = from[1] || 0;
	const xGap: number = Math.abs(x);
	const yGap: number = Math.abs(y);

	let top: number | undefined,
		left: number | undefined,
		right: number | undefined,
		bottom: number | undefined,
		translateX: string | undefined,
		translateY: string | undefined;

	if (x <= -1) {
		left = strokeWidth;
		translateX = '-100%';
		if (xSize > 1) {
			left += zoomedBaseWidth / 4 + strokeHalf;
		}
	} else if (x >= 1) {
		right = strokeWidth;
		translateX = '100%';
		if (xSize > 1 && xGap > 0.5) {
			right += zoomedBaseWidth / 4 + strokeHalf;
		}
	} else if (x == 0.5) {
		translateX = `calc(50% - ${strokeHalf}px)`;
	} else if (x == -0.5) {
		translateX = `calc(-50% + ${strokeHalf}px)`;
	}

	if (y <= -1) {
		top = strokeWidth;
		translateY = '-100%';
		if (ySize > 1 && yGap > 0) {
			top += zoomedBaseHeight / 4 + strokeHalf;
		}
	} else if (y >= 1) {
		bottom = strokeWidth;
		translateY = '100%';
		if (ySize > 1 && yGap > 0) {
			bottom += zoomedBaseHeight / 4 + strokeHalf;
		}
	} else if (y == 0.5) {
		translateY = `calc(50% - ${strokeHalf}px)`;
	} else if (y == -0.5) {
		translateY = `calc(-50% + ${strokeHalf}px)`;
	}

	let xDest: number;
	if (xGap >= 1) {
		xDest = xUnit * (xGap - 1) + gridSpacing + strokeWidth;
	} else if (xGap > 0) {
		xDest = xGap * xUnit;
	} else {
		xDest = 0;
	}
	xDest += strokeWidth;

	let yDest: number;
	if (yGap >= 1) {
		yDest = yUnit * (yGap - 1) + gridSpacing + strokeWidth;
	} else if (yGap > 0) {
		yDest = yGap * yUnit;
	} else {
		yDest = 0;
	}
	yDest += strokeWidth;

	const zIndex: number = Math.floor(Math.abs(from[0]) + Math.abs(from[1])) * -1 - 1;
	const hexColor = (color && colors[color]) || colors.default;

	const makeTranslate = (): string | undefined => {
		if (translateX && translateY) {
			return `translate(${translateX}, ${translateY})`;
		}
		if (translateX) {
			return `translateX(${translateX})`;
		}
		if (translateY) {
			return `translateY(${translateY})`;
		}
		return undefined;
	};

	return (
		<svg
			className="line-svg"
			width={Math.abs(xDest)}
			height={Math.abs(yDest)}
			style={{
				zIndex,
				top,
				left,
				right,
				bottom,
				transform: makeTranslate(),
			}}
		>
			<line
				x1={y < 0 ? strokeHalf : xDest - strokeHalf}
				y1={x < 0 ? strokeHalf : yDest - strokeHalf}
				x2={y < 0 ? xDest - strokeHalf : strokeHalf}
				y2={x < 0 ? yDest - strokeHalf : strokeHalf}
				style={{
					stroke: hexColor,
					strokeWidth,
					strokeLinecap: 'round',
				}}
			/>
		</svg>
	);
};

export default React.memo(LineSvg);
