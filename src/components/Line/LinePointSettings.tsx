import React, { useContext, useRef, useEffect, useState, MouseEventHandler } from 'react';
import {
	Button,
	ButtonGroup,
	Collapse,
	Dropdown,
	DropdownButton,
	Modal,
} from 'react-bootstrap';
import Icon from '@/components/Icon';
import { LineColor, LineFrom, LinePoint, LineSkin } from '@/types/Line';
import { GridContext } from '@/context/grid';
import { setLinePoint } from '@/reducers/lineReducer';
import SearchBar from '@/components/SearchBar';
import DigimonFinder from './DigimonFinder';
import LineImage from './LineImage';
import colors, { legend } from '@/consts/colors';
import UploadImage from '../UploadImage';
import InputMono from '../InputMono';
import { LicenseContext } from '@/context/license';
import { DigimonContext } from '@/context/digimon';
import { capitalize, makeClassName } from '@/functions';
import { MAX_SKINS, skinImage, skinName, skinStyle } from '@/functions/line';
import ButtonRemove from '../Button/ButtonRemove';
import { BASE_IMG_SIZE } from '@/consts/grid';

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
	const searchRef = useRef<HTMLInputElement>(null);
	const [showSkinFields, setShowSkinFields] = useState(false);
	const { handleUpdate } = useContext(GridContext);
	const licenceName = useContext(LicenseContext).name;
	const { dubNames } = useContext(DigimonContext);
	const dubName = point && dubNames[point.name];

	useEffect(() => {
		if (show) {
			searchRef.current?.focus();
		}
	}, [show]);

	const handleChoose = (search: string) => {
		if (handleUpdate) {
			if (point?.image) {
				URL.revokeObjectURL(point.image);
			}
			const nextPoint: LinePoint =
				point ? { ...point, name: search } : { name: search, from: null };
			handleUpdate(setLinePoint, coord, nextPoint);
		}
	};

	const handleImage = (name: string, value: string) => {
		if (handleUpdate) {
			const newPoint: LinePoint = { name: 'url', from: null, image: value };
			handleUpdate(setLinePoint, coord, newPoint);
		}
	};

	const handleUpload = (file: string) => {
		if (handleUpdate) {
			const newPoint: LinePoint = { name: 'upload', from: null, image: file };
			handleUpdate(setLinePoint, coord, newPoint);
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

	const handleAddSkin = (skin: LineSkin) => {
		if (handleUpdate && point) {
			const nextPoint: LinePoint = {
				...point,
				skins: point.skins ? [...point.skins, skin] : [skin],
			};
			handleUpdate(setLinePoint, coord, nextPoint);
		}
	};

	const handleChooseSkin = (search: string) => {
		handleAddSkin(search);
	};

	const handleSkinImage = (name: string, value: string) => {
		if (value) {
			handleAddSkin({ name: 'url', image: value });
		}
	};

	const handleSkinUpload = (file: string) => {
		handleAddSkin({ name: 'upload', image: file });
	};

	const handleRemoveSkin = (i: number) => {
		if (handleUpdate && point?.skins) {
			const skins = point.skins.slice();
			const image = skinImage(skins[i]);
			if (image) {
				URL.revokeObjectURL(image);
			}
			skins.splice(i, 1);
			const nextPoint: LinePoint = { ...point, skins };
			handleUpdate(setLinePoint, coord, nextPoint);
		}
	};

	const handleMirror = () => {
		if (handleUpdate && point) {
			const nextPoint: LinePoint = { ...point, mirror: !point.mirror };
			handleUpdate(setLinePoint, coord, nextPoint);
		}
	};

	const skinsFull = point?.skins ? point.skins.length >= MAX_SKINS : false;

	return (
		<Modal show={show} onHide={handleClose} size="lg" className="line-point-settings">
			<Modal.Header closeButton>
				<Modal.Title>
					<Icon name="sliders2" /> Element Options
				</Modal.Title>
			</Modal.Header>
			<Modal.Body className="d-flex flex-column gap-3">
				<DigimonSelector
					licenceName={licenceName}
					point={point}
					handleChoose={handleChoose}
					handleImage={handleImage}
					handleUpload={handleUpload}
					searchRef={searchRef}
				/>
				{!!point && (
					<>
						<div className="d-flex flex-column flex-sm-row gap-4 align-items-center align-items-sm-start">
							<div className="line-point width-min-content">
								<div className="line-point-safe-zone">
									<LineImage
										name={point.name}
										path={point.image}
										mirror={point.mirror}
										expandable={true}
										width={225}
										height={225}
										zoomable={false}
									/>
									{point.skins?.map((skin, i) => (
										<LineImage
											key={i}
											name={skinName(skin)}
											path={skinImage(skin)}
											className="line-skin"
											loadable={false}
											expandable={true}
											width={225}
											height={225}
											style={skinStyle(i, 225 / BASE_IMG_SIZE)}
											zoomable={false}
										/>
									))}
								</div>
							</div>
							<div>
								<h4 className="text-capitalize break-word mb-3">
									{capitalize(point.name)}
									{dubName && ` / ${capitalize(dubName)}`}{' '}
									<ButtonRemove
										onClick={handleRemove}
										title="remove digimon"
									/>{' '}
									<Button title="mirror mode" onClick={handleMirror}>
										<Icon name="symmetry-vertical" />
									</Button>
								</h4>
								<SettingFroms
									point={point}
									handleSelectColor={handleSelectColor}
									handleRemoveFrom={handleRemoveFrom}
								/>
							</div>
						</div>
						{!!point.name && (
							<>
								<div className="separator mt-3 mb-2" />
								<div>
									<h4
										role="button"
										aria-expanded={showSkinFields}
										aria-controls="line-point-settings_skin-fields"
										onClick={() => setShowSkinFields(s => !s)}
										className={makeClassName(
											'user-select-none',
											skinsFull && 'text-decoration-line-through'
										)}
									>
										<Icon
											name={
												showSkinFields ? 'chevron-down' : (
													'chevron-right'
												)
											}
										/>{' '}
										Add a skin (max {MAX_SKINS})
									</h4>
									<Collapse in={showSkinFields}>
										<div id="line-point-settings_skin-fields">
											<DigimonSelector
												licenceName={licenceName}
												point={point}
												handleChoose={handleChooseSkin}
												handleImage={handleSkinImage}
												handleUpload={handleSkinUpload}
												disabled={skinsFull}
											/>
										</div>
									</Collapse>
									<div className="d-flex flex-wrap gap-3">
										{point.skins?.map((skin, i) => {
											const name = skinName(skin);
											return (
												<h5
													key={i}
													className="text-capitalize break-word"
												>
													{capitalize(name)}
													{dubNames[name] &&
														` / ${capitalize(dubNames[name])}`}{' '}
													<ButtonRemove
														onClick={() =>
															handleRemoveSkin(i)
														}
														title="remove skin"
													/>
												</h5>
											);
										})}
									</div>
								</div>
							</>
						)}
					</>
				)}
			</Modal.Body>
		</Modal>
	);
};

const DigimonSelector: React.FC<{
	licenceName: string;
	point?: LinePoint;
	handleChoose: (search: string) => void;
	handleImage: (name: string, value: string) => void;
	handleUpload: (file: string) => void;
	searchRef?: React.Ref<HTMLInputElement>;
	disabled?: boolean;
}> = ({
	licenceName,
	point,
	handleChoose,
	handleImage,
	handleUpload,
	searchRef,
	disabled,
}) => (
	<div>
		<DigimonFinder
			label={`Research a ${licenceName}`}
			onSelect={handleChoose}
			forwardRef={searchRef}
			disabled={disabled}
		/>
		<div className="d-sm-flex gap-3">
			<InputMono
				name="image"
				onSubmit={handleImage}
				placeholder="Image URL"
				defaultValue={(point && point.name == 'url' && point.image) || ''}
				className="flex-grow-1"
				disabled={disabled}
			/>
			<UploadImage
				handleUpload={handleUpload}
				className="mb-3"
				disabled={disabled}
			/>
		</div>
	</div>
);

const SettingFroms: React.FC<{
	point: LinePoint;
	handleSelectColor: CallableFunction;
	handleRemoveFrom: CallableFunction;
}> = ({ point, handleSelectColor, handleRemoveFrom }) => {
	if (!point.from) return null;
	return (
		<div className="mt-4">
			{point.from.map((from, i) => (
				<SettingFrom
					key={i}
					number={i}
					color={Array.isArray(point.color) ? point.color[i] : point.color}
					handleSelect={handleSelectColor}
					handleRemoveFrom={handleRemoveFrom}
				/>
			))}
		</div>
	);
};

const SettingFrom: React.FC<{
	number: number;
	color?: string;
	handleSelect: CallableFunction;
	handleRemoveFrom: CallableFunction;
}> = ({ number, color, handleSelect, handleRemoveFrom }) => (
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
		<ButtonRemove onClick={e => handleRemoveFrom(number)} title="remove line" />
	</div>
);

export default LinePointSettings;
