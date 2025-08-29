import React, { MouseEventHandler, useMemo, useContext } from 'react';
import { LinePoint as LinePointInterface } from '@/types/Line';
import LineImage from '@/components/Line/LineImage';
import { makeClassName } from '@/functions';
import Icon from '@/components/Icon';
import { GridContext } from '@/context/grid';
import LineSvg, { pointHeight, pointWidth, xUnit, yUnit } from './LineSvg';

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
	const { drawing, handleDraw, handleTarget, handleXCollapse, handleYCollapse } =
		React.useContext(GridContext);
	const isDrawing: boolean =
		!!drawing && drawing[0] == coord[0] && drawing[1] == coord[1];

	const handleClickBuffer = (e: any) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleClickDraw = (e: any) => {
		handleClickBuffer(e);
		if (handleDraw) {
			handleDraw(coord);
		}
	};

	const handleClickTarget = (e: any) => {
		handleClickBuffer(e);
		if (handleTarget) {
			handleTarget(coord);
		}
	};

	const handleClickXCollapse = (e: any) => {
		handleClickBuffer(e);
		if (handleXCollapse) {
			handleXCollapse(coord);
		}
	};

	const handleClickYCollapse = (e: any) => {
		handleClickBuffer(e);
		if (handleYCollapse) {
			handleYCollapse(coord);
		}
	};

	const {
		name,
		from,
		color,
		skins = [],
		image,
		xSize,
		ySize,
		xCollapsable,
		yCollapsable,
	} = point;

	const width: number = useMemo(() => {
		if (xSize) {
			return pointWidth + (xSize ? xSize - 1 : 0) * xUnit; // 150 + xMargin
		}
		return pointWidth;
	}, [xSize]);

	const height: number = useMemo(() => {
		if (ySize) {
			return pointHeight + (ySize ? ySize - 1 : 0) * yUnit; // 150 + xMargin
		}
		return pointHeight;
	}, [ySize]);

	return (
		<div
			className={makeClassName(
				'line-point pictured',
				xSize == 2 && 'x-double',
				ySize == 2 && 'y-double',
				handleEdit && 'editable'
			)}
			style={{ width: width + 'px', height: height + 'px' }}
			data-coord={coord}
			onClick={handleEdit ? handleEdit : undefined}
		>
			<div className="line-point-safe-zone">
				<LineImage name={name} path={image} mirror={point.mirror} expandable={!handleEdit}/>
				{skins.map((skin, i) => (
					<LineImage
						key={i}
						name={skin}
						className="line-skin"
						loadable={false}
						style={{ bottom: 3.3 * i + 'em' }}
						expandable={!handleEdit}
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
					{xCollapsable ? (
						<Icon
							name="arrows-collapse-vertical"
							className="action collapse-point collapse-col-point"
							onClick={handleClickXCollapse}
							title="collapse 2 cells in 2 columns"
						/>
					) : (
						xSize == 2 && (
							<Icon
								name="arrows-expand-vertical"
								className="action collapse-point"
								onClick={handleClickXCollapse}
								title="uncollapse 2 cells"
							/>
						)
					)}
					{drawing ? (
						<Icon
							name="bullseye"
							className="action target"
							onClick={handleClickTarget}
							title="be the target of the link"
						/>
					) : yCollapsable ? (
						<Icon
							name="arrows-collapse"
							className="action collapse-point collapse-row-point"
							onClick={handleClickYCollapse}
							title="collapse 2 cells"
						/>
					) : (
						ySize == 2 && (
							<Icon
								name="arrows-expand"
								className="action collapse-point"
								onClick={handleClickYCollapse}
								title="uncollapse 2 cells in 2 rows"
							/>
						)
					)}
				</div>
			)}
			{from && Array.isArray(from[0]) ? (
				from.map((ifrom, i) => (
					<LineSvg
						key={i}
						from={ifrom as number[]}
						color={color && (Array.isArray(color) ? color[i] : color)}
						baseWidth={width}
						baseHeight={height}
						xSize={xSize}
						ySize={ySize}
					/>
				))
			) : (
				<LineSvg
					from={from as number[] | null | undefined}
					color={color as string}
					baseWidth={width}
					baseHeight={height}
					xSize={xSize}
					ySize={ySize}
				/>
			)}
		</div>
	);
};

export default LineGridPoint;
