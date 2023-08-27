import React, { useContext, useRef, useEffect } from 'react';
import { Button, ButtonGroup, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import Icon from '@/components/Icon';
import { LinePoint } from '@/types/Line';
import { GridContext } from '@/context/grid';
import { setLineColumn } from '@/reducers/lineReducer';
import SearchBar from '@/components/SearchBar';
import LineImage from './LineImage';
import colors, { legend } from '@/consts/colors';
import UploadImage from '../UploadImage';

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
			handleUpdate(setLineColumn, coord, nextPoint);
			handleClose();
		}
	};

	const handleUpload = (file: string) => {
		if (handleUpdate) {
			const newPoint: LinePoint = { name: 'upload', from: null, image: file };
			handleUpdate(setLineColumn, coord, newPoint);
			handleClose();
		}
	};

	const handleRemove = () => {
		if (point?.image) {
			URL.revokeObjectURL(point.image);
		}
		if (handleUpdate) {
			handleUpdate(setLineColumn, coord, null);
			handleClose();
		}
	};

	const handleSelectColor = (color: string, number?: number) => {
		if (handleUpdate && point) {
			const nextPoint: LinePoint = {
				...point,
				[number == 2 ? 'color2' : 'color']: color,
			};
			handleUpdate(setLineColumn, coord, nextPoint);
		}
	};

	const handleRemoveFrom = (number?: number) => {
		if (handleUpdate && point) {
			const nextPoint: LinePoint = {
				...point,
				[number == 2 ? 'from2' : 'from']: null,
			};
			handleUpdate(setLineColumn, coord, nextPoint);
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
				<SearchBar onSubmit={handleChoose} forwardRef={ref} />
				<UploadImage handleUpload={handleUpload} />
				{point ? (
					<div className='mb-3'>
						<h4 className="text-capitalize mb-3">
							{point.name}{' '}
							<Button
								variant="danger"
								onClick={handleRemove}
								title="remove digimon"
							>
								<Icon name="trash3-fill" />
							</Button>
						</h4>
						<div className="line-point width-min-content">
							<LineImage name={point.name} path={point.image} />
						</div>
					</div>
				) : null}
				{!!point?.from && (
					<SettingFrom
						number={1}
						color={point.color}
						handleSelect={handleSelectColor}
						handleRemove={handleRemoveFrom}
					/>
				)}
				{!!point?.from2 && (
					<SettingFrom
						number={2}
						color={point.color2}
						handleSelect={handleSelectColor}
						handleRemove={handleRemoveFrom}
					/>
				)}
			</Modal.Body>
		</Modal>
	);
};

const SettingFrom: React.FC<{
	number: number;
	color?: string;
	handleSelect: CallableFunction;
	handleRemove: CallableFunction;
}> = ({ number, color, handleSelect, handleRemove }) => (
	<div className="mt-4">
		Line {number}&nbsp;:{' '}
		<DropdownButton
			as={ButtonGroup}
			id="line-point-settings_point-from"
			variant="secondary"
			title={
				<>
					<Icon
						name="circle-fill"
						style={{ color: color ? colors[color] : 'white' }}
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
