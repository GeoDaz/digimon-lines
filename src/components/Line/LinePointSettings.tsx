import React, { useContext, useRef, useEffect, MouseEventHandler } from 'react';
import { Button, ButtonGroup, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import Icon from '@/components/Icon';
import { LineColor, LineFrom, LinePoint } from '@/types/Line';
import { GridContext } from '@/context/grid';
import { setLinePoint } from '@/reducers/lineReducer';
import SearchBar from '@/components/SearchBar';
import LineImage from './LineImage';
import colors, { legend } from '@/consts/colors';
import UploadImage from '../UploadImage';
import InputMono from '../InputMono';
import { LicenseContext } from '@/context/license';
import { makeClassName } from '@/functions';

interface Props {
	handleClose: () => void;
	point?: LinePoint;
	coord?: number[];
	show: boolean;
}
const LinePointSettings: React.FC<Props> = ({
	handleClose,
	point,
	coord,
	show = false,
}) => {
	const ref = useRef<HTMLInputElement>(null);
	const { handleUpdate } = useContext(GridContext);
	const licenceName = useContext(LicenseContext).name;

	useEffect(() => {
		if (show) {
			ref.current?.focus();
		}
	}, [show]);

	const handleChoose = (search: string) => {
		if (handleUpdate) {
			if (point?.image) {
				URL.revokeObjectURL(point.image);
			}
			const nextPoint: LinePoint = point
				? { ...point, name: search }
				: { name: search, from: null };
			handleUpdate(setLinePoint, coord, nextPoint);
			handleClose();
		}
	};

	const handleImage = (name: string, value: string) => {
		if (handleUpdate) {
			const newPoint: LinePoint = { name: 'url', from: null, image: value };
			handleUpdate(setLinePoint, coord, newPoint);
			handleClose();
		}
	};

	const handleUpload = (file: string) => {
		if (handleUpdate) {
			const newPoint: LinePoint = { name: 'upload', from: null, image: file };
			handleUpdate(setLinePoint, coord, newPoint);
			handleClose();
		}
	};

	const handleRemove = () => {
		if (point?.image) {
			URL.revokeObjectURL(point.image);
		}
		if (handleUpdate) {
			handleUpdate(setLinePoint, coord, null);
			handleClose();
		}
	};

	const handleSelectColor = (color: string, i: number) => {
		if (handleUpdate && point) {
			let colors: LineColor | undefined = point.color;
			if (Array.isArray(colors)) {
				colors = colors.slice();
			} else if (typeof colors === 'string' && point.from) {
				colors = point.from.map(() => colors as string);
			} else {
				colors = [];
			}
			colors[i] = color;
			const nextPoint: LinePoint = { ...point, color: colors };
			handleUpdate(setLinePoint, coord, nextPoint);
		}
	};

	const handleRemoveFrom = (i: number) => {
		if (handleUpdate && point?.from) {
			let froms: LineFrom = point.from.slice();
			let colors: LineColor | undefined = point.color;
			if (Array.isArray(froms)) {
				froms.splice(i, 1);
				if (Array.isArray(colors)) {
					colors = colors.slice();
					colors.splice(i, 1);
				}
				if (!froms.length) {
					froms = null;
					colors = undefined;
				}
			} else {
				froms = null;
				colors = undefined;
			}
			const nextPoint: LinePoint = { ...point, from: froms, color: colors };
			handleUpdate(setLinePoint, coord, nextPoint);
		}
	};

	const handleChooseSkin = (search: string) => {
		if (handleUpdate && point) {
			const nextPoint: LinePoint = {
				...point,
				skins: point.skins ? [...point.skins, search] : [search],
			};
			handleUpdate(setLinePoint, coord, nextPoint);
		}
	};

	const handleRemoveSkin = (i: number) => {
		if (handleUpdate && point) {
			const skins = (point.skins as string[]).slice();
			skins.splice(i, 1);
			const nextPoint: LinePoint = { ...point, skins };
			handleUpdate(setLinePoint, coord, nextPoint);
		}
	};

	return (
		<Modal show={show} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>
					<Icon name="sliders2" /> Element Options
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<SearchBar
					label={`Research a ${licenceName}`}
					onSubmit={handleChoose}
					forwardRef={ref}
				/>
				<InputMono
					name="image"
					onSubmit={handleImage}
					placeholder="Image URL"
					defaultValue={(point && point.name == 'url' && point.image) || ''}
				/>
				<UploadImage handleUpload={handleUpload} className="mb-3" />
				{point ? (
					<SettingPoint
						className="mb-3"
						point={point}
						handleRemove={handleRemove}
					/>
				) : null}
				{!!point?.from &&
					point.from.map((from, i) => (
						<SettingFrom
							key={i}
							number={i}
							color={
								Array.isArray(point.color) ? point.color[i] : point.color
							}
							handleSelect={handleSelectColor}
							handleRemove={handleRemoveFrom}
						/>
					))}
				{!!point?.name && (
					<>
						<h4
							className={makeClassName(
								'mt-4',
								point.skins &&
									point.skins.length > 2 &&
									'text-decoration-line-through'
							)}
						>
							Add a skin (max 3)
						</h4>
						<SearchBar
							label={`Research a ${licenceName}`}
							onSubmit={handleChooseSkin}
							disabled={point.skins ? point.skins.length > 2 : false}
						/>
						<div className="d-flex flex-wrap gap-3">
							{point.skins?.map((skin, i) => (
								<h5 key={i} className="text-capitalize break-word">
									{skin}{' '}
									<Button
										variant="danger"
										onClick={() => handleRemoveSkin(i)}
										title="remove digimon"
									>
										<Icon name="trash3-fill" />
									</Button>
								</h5>
							))}
						</div>
					</>
				)}
			</Modal.Body>
		</Modal>
	);
};

const SettingPoint: React.FC<{
	className?: string;
	point: LinePoint;
	handleRemove: MouseEventHandler<HTMLElement>;
	imgClassName?: string;
}> = ({ className, point, handleRemove, imgClassName }) => (
	<div className={className}>
		<h4 className="text-capitalize break-word mb-3">
			{point.name}{' '}
			<Button variant="danger" onClick={handleRemove} title="remove digimon">
				<Icon name="trash3-fill" />
			</Button>
		</h4>
		<div className="line-point width-min-content">
			<LineImage name={point.name} path={point.image} className={imgClassName} />
			{point.skins?.map((skin, i) => (
				<LineImage
					key={i}
					name={skin}
					className="line-skin"
					loadable={false}
					style={{ bottom: 3.3 * i + 'em' }}
				/>
			))}
		</div>
	</div>
);

const SettingFrom: React.FC<{
	number: number;
	color?: string;
	handleSelect: CallableFunction;
	handleRemove: CallableFunction;
}> = ({ number, color, handleSelect, handleRemove }) => (
	<div className="mt-4">
		Line {number + 1}&nbsp;:{' '}
		<DropdownButton
			as={ButtonGroup}
			id="line-point-settings_point-from"
			variant="secondary"
			title={
				<>
					<Icon
						name="circle-fill"
						style={{
							color: color ? colors[color] : 'white',
						}}
					/>{' '}
					{color || 'default'}
				</>
			}
		>
			{legend.map(legend => (
				<Dropdown.Item
					key={legend.key}
					eventKey={legend.key}
					active={legend.key === color}
					onClick={e => handleSelect(legend.key, number)}
				>
					<Icon name="circle-fill" style={{ color: legend.color }} />{' '}
					{legend.key}
				</Dropdown.Item>
			))}
		</DropdownButton>{' '}
		<Button variant="danger" onClick={e => handleRemove(number)} title="remove line">
			<Icon name="trash3-fill" />
		</Button>
	</div>
);

export default LinePointSettings;
