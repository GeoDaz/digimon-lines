import React, { useContext, useRef, useEffect } from 'react';
import { Button, ButtonGroup, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import Icon from '@/components/Icon';
import { LinePoint } from '@/types/Line';
import { GridContext } from '@/context/grid';
import { setLinePoint } from '@/reducers/lineReducer';
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
			handleUpdate(setLinePoint, coord, nextPoint);
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
			const colors = ((point.color || []) as string[]).slice();
			colors[i] = color;
			const nextPoint: LinePoint = { ...point, color: colors };
			handleUpdate(setLinePoint, coord, nextPoint);
		}
	};

	const handleRemoveFrom = (i: number) => {
		if (handleUpdate && point?.from) {
			let froms = point.from.slice();
			let colors = ((point.color || []) as string[]).slice();
			froms.splice(i, 1);
			colors.splice(i, 1);
			if (!froms.length) {
				// become nullable in the if
				(froms as Array<number[]> | null) = null;
				(colors as string[] | undefined) = undefined;
			}
			const nextPoint: LinePoint = { ...point, from: froms, color: colors };
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
				<SearchBar onSubmit={handleChoose} forwardRef={ref} />
				<UploadImage handleUpload={handleUpload} className="mb-3" />
				{point ? (
					<div className="mb-3">
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
				{!!point?.from &&
					point.from.map((from, i) => (
						<SettingFrom
							key={i}
							number={i}
							color={point.color && point.color[i]}
							handleSelect={handleSelectColor}
							handleRemove={handleRemoveFrom}
						/>
					))}
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
