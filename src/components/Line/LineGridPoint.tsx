import React, { MouseEventHandler, useMemo, useContext } from 'react';
import { LinePoint as LinePointInterface } from '@/types/Line';
import LineImage from '@/components/Line/LineImage';
import { makeClassName } from '@/functions';
import Icon from '@/components/Icon';
import { GridContext } from '@/context/grid';
import LineSvg, { pointWidth, xUnit } from './LineSvg';

const LineGridPoint: React.FC<{
	point?: LinePointInterface | null;
	coord: number[];
}> = ({ point, coord }) => {
	const { handleEdit } = useContext(GridContext);

	const handleEditBuffer = (e: any) => {
		handleEdit && handleEdit(coord);
	};

	const editable = !!handleEdit;
	if (!point) {
		return (
			<div
				className={makeClassName('line-point', editable && 'editable')}
				onClick={editable ? handleEditBuffer : undefined}
			/>
		);
	}
	return (
		<LinePoint
			point={point}
			handleEdit={editable ? handleEditBuffer : undefined}
			coord={coord}
		/>
	);
};

const LinePoint: React.FC<{
	point: LinePointInterface;
	coord: number[];
	handleEdit?: MouseEventHandler<HTMLElement>;
}> = ({ point, coord, handleEdit }) => {
	const { drawing, handleDraw, handleTarget } = React.useContext(GridContext);
	const isDrawing: boolean =
		!!drawing && drawing[0] == coord[0] && drawing[1] == coord[1];

	const handleClickDraw = (e: any) => {
		e.preventDefault();
		e.stopPropagation();
		if (handleDraw) {
			handleDraw(coord);
		}
	};

	const handleClickTarget = (e: any) => {
		e.preventDefault();
		e.stopPropagation();
		if (handleTarget) {
			handleTarget(coord);
		}
	};

	const { name, from, from2, fusionFrom, size, color, color2, skins = [] } = point;

	const width: number = useMemo(() => {
		if (size) {
			return pointWidth + (size ? size - 1 : 0) * xUnit; // 150 + xMargin
		}
		return pointWidth;
	}, [size]);

	return (
		<div
			className={makeClassName('line-point pictured', handleEdit && 'editable')}
			style={{ width: width + 'px' }}
			data-coord={coord}
			onClick={handleEdit ? handleEdit : undefined}
		>
			<div className="line-point-safe-zone">
				<LineImage name={name} title={name} />
				{skins.map((skin, i) => (
					<LineImage
						className="line-skin"
						key={i}
						name={skin}
						title={skin}
						style={{ bottom: 3.3 * i + 'em' }}
					/>
				))}
			</div>
			{!!handleEdit && (
				<div className="actions">
					<Icon
						name="bezier2"
						className={makeClassName('action draw', isDrawing && 'active')}
						onClick={handleClickDraw}
						title="link it to another digimon"
					/>
					{!!drawing && (
						<Icon
							name="bullseye"
							className="action target"
							onClick={handleClickTarget}
							title="be the target of the link"
						/>
					)}
				</div>
			)}
			<LineSvg from={from} color={color} baseWidth={width} size={size} />
			{!!from2 && (
				<LineSvg from={from2} color={color2} baseWidth={width} size={size} />
			)}
			{!!fusionFrom &&
				fusionFrom.map((coord, i) => (
					<LineSvg
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

export default LineGridPoint;
