import React from 'react';
import { Row, Col, Image, Spinner } from 'react-bootstrap';
import { Line, LinePoint as LinePointInterface } from '../types/Line';
import { colors } from '../consts/colors';

interface GridProps {
	line: Line;
	zoom?: number;
}
const LineGrid: React.FC<GridProps> = ({ line, zoom = 100 }) => {
	return (
		<div className="frame">
			<div className="line-wrapper line-grid" style={{ zoom: `${zoom}%` }}>
				{line.columns.map((column, i) => (
					<LineRow key={i} list={column} />
				))}
			</div>
		</div>
	);
};

interface RowProps {
	list: Array<LinePointInterface | LinePointInterface[] | null> | undefined;
}
const LineRow: React.FC<RowProps> = ({ list }) => {
	if (!list) return null;
	return (
		<Row className="line-row">
			{list.map((point, i) => {
				if (!point) {
					return (
						<Col key={i}>
							<div className="line-point" />
						</Col>
					);
				}
				if (Array.isArray(point)) {
					return <LineRow key={i} list={point} />;
				}
				return (
					<Col key={i}>
						<LinePoint point={point} />
					</Col>
				);
			})}
		</Row>
	);
};

const xMargin = 22.5;
const yMargin = 30;
const xUnit: number = 174; // 150 + xMargin
const yUnit: number = 180; // 150 + yMargin
const pointWidth: number = 150;
const pointHeight: number = 150;
const LinePoint: React.FC<{ point: LinePointInterface }> = ({ point }) => {
	const { name, from, from2, fusionFrom, size, color, color2, skins = [] } = point;
	const style: React.CSSProperties = {};
	let width = pointWidth;
	if (size) {
		width += (size ? size - 1 : 0) * xUnit; // 150 + xMargin
		style.width = width + 'px';
	}
	return (
		<div className="line-point pictured" style={style}>
			<div className="line-point-safe-zone">
				<Image
					src={`/images/digimon/${name}.jpg`}
					title={name}
					rounded
					className="line-img"
				/>
				{skins.map((skin, i) => (
					<Image
						key={i}
						src={`/images/digimon/${skin}.jpg`}
						title={skin}
						rounded
						className="line-skin"
						style={{ bottom: 3.3 * i + 'em' }}
					/>
				))}
			</div>
			<SvgLine from={from} color={color} baseWidth={width} size={size} />
			{!!from2 && (
				<SvgLine from={from2} color={color2} baseWidth={width} size={size} />
			)}
			{!!fusionFrom &&
				fusionFrom.map((coord, i) => (
					<SvgLine
						key={i}
						from={coord}
						color={color}
						baseWidth={width}
						size={size}
					/>
				))}
		</div>
	);
};

// TODO retravailler pour que les lignes s'arretent en haut des images avec pour coord, top left, top center ou top right
const white = '#fff';
interface SvgLineProps {
	from?: Array<number> | null;
	color?: string;
	size?: number;
	baseWidth?: number;
	baseHeight?: number;
}
const SvgLine: React.FC<SvgLineProps> = ({
	from = [0, -1],
	color,
	size = 0,
	baseWidth = pointWidth,
	baseHeight = pointHeight,
}) => {
	if (!from) {
		return null;
	}
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
		}else if(size > 1){
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
					stroke: (color && colors[color]) || white,
					strokeWidth,
					strokeLinecap: 'round',
				}}
			/>
		</svg>
	);
};

export const LineLoading: React.FC = () => (
	<div className="line-wrapper">
		<Row className="line-row">
			<Col>
				<div className="line-point">
					<Spinner animation="border" />
				</div>
			</Col>
			<Col>
				<div className="line-point">
					<Spinner animation="border" />
				</div>
			</Col>
		</Row>
		<Row className="line-row">
			<Col>
				<div className="line-point">
					<Spinner animation="border" />
				</div>
			</Col>
			<Col>
				<div className="line-point">
					<Spinner animation="border" />
				</div>
			</Col>
		</Row>
		<Row className="line-row">
			<Col>
				<div className="line-point">
					<Spinner animation="border" />
				</div>
			</Col>
		</Row>
		<Row className="line-row">
			<Col>
				<div className="line-point">
					<Spinner animation="border" />
				</div>
			</Col>
		</Row>
	</div>
);
export default React.memo(LineGrid);
