import React, { useContext, useRef, useEffect } from 'react';
import { Button, ButtonGroup, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import Icon from '@/components/Icon';
import { LinePoint } from '@/types/Line';
import { GridContext } from '@/context/grid';
import { setLineColumn } from '@/reducers/lineReducer';
import SearchBar from '@/components/SearchBar';
import LineImage from './LineImage';
import colors, { legend } from '@/consts/colors';

interface Props {
	handleVoid: () => void;
	point?: LinePoint;
	coord?: number[];
	show: boolean;
}
const LinePointSettings: React.FC<Props> = ({
	handleVoid,
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
			const nextPoint: LinePoint = point
				? { ...point, name: search }
				: { name: search, from: null };
			handleUpdate(setLineColumn, coord, nextPoint);
		}
		handleVoid();
	};

	const handleSelect = (color: string, number?: number) => {
		if (handleUpdate && point) {
			const nextPoint: LinePoint = {
				...point,
				[number == 2 ? 'color2' : 'color']: color,
			};
			handleUpdate(setLineColumn, coord, nextPoint);
		}
	};
	const handleRemove = (number?: number) => {
		if (handleUpdate && point) {
			const nextPoint: LinePoint = {
				...point,
				[number == 2 ? 'from2' : 'from']: null,
			};
			handleUpdate(setLineColumn, coord, nextPoint);
		}
	};

	return (
		<Modal show={show} onHide={handleVoid}>
			<Modal.Header closeButton>
				<Modal.Title>
					<Icon name="sliders2" /> Element Options
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<SearchBar onSubmit={handleChoose} forwardRef={ref} />
				{point ? (
					<div>
						<h4 className="text-capitalize mb-3">{point.name}</h4>
						<LineImage name={point.name} />
					</div>
				) : null}
				{!!point?.from && (
					<SettingFrom
						number={1}
						color={point.color}
						handleSelect={handleSelect}
						handleRemove={handleRemove}
					/>
				)}
				{!!point?.from2 && (
					<SettingFrom
						number={2}
						color={point.color2}
						handleSelect={handleSelect}
						handleRemove={handleRemove}
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
		<Button variant="danger" onClick={e => handleRemove(number)}>
			<Icon name="trash3-fill" />
		</Button>
	</div>
);

export default LinePointSettings;
