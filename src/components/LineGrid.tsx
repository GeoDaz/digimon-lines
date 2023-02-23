import React from 'react';
import { Row, Col, Image, Spinner } from 'react-bootstrap';
import { Line, LinePoint as LinePointInterface } from '../types/Line';
import { digicolors } from '../consts/digivolutions';

interface GridProps {
	line: Line;
	zoom?: number;
}
const LineGrid: React.FC<GridProps> = ({ line, zoom = 100 }) => {
	return (
		<div className="frame">
			<div className="line-wrapper line-grid" style={{ zoom: `${zoom}%` }}>
				{line.columns.map((column, i) => (
					<LineRow key={i} list={column.reverse()} />
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

const xMargin = 24;
const yMargin = 30;
const xUnit: number = 174; // 150 + xMargin
const yUnit: number = 180; // 150 + yMargin
const pointWidth: number = 150;
const pointHeight: number = 150;
const LinePoint: React.FC<{ point: LinePointInterface }> = ({ point }) => {
	const { ref, from, from2, size, color, color2 } = point;
	const style: React.CSSProperties = {};
	let width = pointWidth;
	if (size) {
		width += (size ? size - 1 : 0) * xUnit; // 150 + xMargin
		style.width = width + 'px';
	}
	return (
		<div className="line-point pictured" style={style}>
			<Image
				src={`/images/digimon/${ref}.jpg`}
				title={ref}
				rounded
				className="line-img"
			/>
			<SvgLine from={from} color={color} baseWidth={width} size={size} />
			{!!from2 && (
				<SvgLine from={from2} color={color2} baseWidth={width} size={size} />
			)}
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
	const svgStyle: React.CSSProperties = {};
	let x: number = 0;
	let y: number = 0;
	let left: boolean = false;
	x = xUnit * Math.abs(from[0]); // 150 + 12 * 2
	y = yUnit * Math.abs(from[1]); // 150 + 15 * 2
	left = from[0] < 0;
	const halfHeight: number = baseHeight / 2;
	const halfWidth: number = baseWidth / 2;
	let yOrigin: number = halfHeight;
	let xOrigin: number = halfWidth;
	const strokeWidth = 12;
	if (Math.abs(from[0]) > 1 && from[1] < 0) {
		if (from[0] < 0) {
			svgStyle.zIndex = Math.floor(from[0]);
		}
		xOrigin =
			(left ? strokeWidth : pointWidth - strokeWidth) + pointWidth * (size / 2);
		yOrigin = pointHeight - strokeWidth / 2;
		x -= pointWidth - xMargin - strokeWidth;
		// y -= halfHeight - strokeWidth / 2;
	}
	return (
		<svg
			className={'line-svg ' + (left ? 'left' : 'right')}
			width={baseWidth + x}
			height={baseWidth + y}
			style={svgStyle}
		>
			<line
				x1={xOrigin}
				y1={left ? halfHeight + y : yOrigin}
				x2={xOrigin + x}
				y2={left ? yOrigin : halfHeight + y}
				style={{
					stroke: color ? digicolors[color] : white /* digicolors['default'] */,
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
