import React, { useEffect } from 'react';
import { Row, Col, Image, Spinner } from 'react-bootstrap';
import { Line, LinePoint as LinePointInterface } from '../types/Line';
import useFetch from '../hooks/useFetch';
import { digicolors } from '../consts/digivolutions';

interface GridProps {
	line: Line;
}
const LineGrid: React.FC<GridProps> = ({ line }) => {
	return (
		<div className="line-wrapper">
			<LineRow list={line.supra} />
			<LineRow list={line.ultra} />
			<LineRow list={line.mega} />
			<LineRow list={line.ultimate} />
			<LineRow list={line.champion} />
			<LineRow list={line.rookie} />
			<LineRow list={line.baby2} />
			<LineRow list={line.baby1} />
		</div>
	);
};

interface RowProps {
	list: Array<LinePointInterface | null> | undefined;
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
				return (
					<Col key={i}>
						<LinePoint point={point} />
					</Col>
				);
			})}
		</Row>
	);
};

const xUnit: number = 174; // 150 + 12 * 2
const yUnit: number = 180; // 150 + 15 * 2
const pointWidth: number = 150;
const pointHeight: number = 150;
const LinePoint: React.FC<{ point: LinePointInterface }> = ({ point }) => {
	const { ref, from, from2, size, color, color2 } = point;
	const style: React.CSSProperties = {};
	let width = pointWidth;
	if (size) {
		width += (size ? size - 1 : 0) * xUnit; // 150 + 12 * 2
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
			{!!from && <SvgLine from={from} color={color} baseWidth={width} />}
			{!!from2 && <SvgLine from={from2} color={color2} baseWidth={width} />}
		</div>
	);
};

// TODO retravailler pour que les lignes s'arretent en haut des images avec pour coord, top left, top center ou top right
interface SvgLineProps {
	from: Array<number>;
	color?: string;
	baseWidth?: number;
	baseHeight?: number;
}
const SvgLine: React.FC<SvgLineProps> = ({
	from,
	color,
	baseWidth = pointWidth,
	baseHeight = pointHeight,
}) => {
	const svgStyle: React.CSSProperties = {};
	let x: number = 0;
	let y: number = 0;
	let left: boolean = false;
	if (from) {
		x = xUnit * Math.abs(from[0]); // 150 + 12 * 2
		y = yUnit * Math.abs(from[1]); // 150 + 15 * 2
		left = from[0] < 0;
	}
	const halfHeight: number = baseHeight / 2;
	const halfWidth: number = baseWidth / 2;
	let yOrigin: number = halfHeight;
	let xOrigin: number = halfWidth;
	const strokeWidth = 12;
	if (from && Math.abs(from[0]) >= 2 && from[1] < 0) {
		if (from[0] < 0) {
			svgStyle.zIndex = Math.floor(from[0]);
		}
		yOrigin = baseHeight;
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
					stroke: color
						? digicolors[color]
						: '#fff' /* digicolors['default'] */,
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
export default LineGrid;
