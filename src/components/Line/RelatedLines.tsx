import React, { useRef, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import LinePoint from '@/components/Line/LinePoint';
import LineImage from '@/components/Line/LineImage';
import Icon from '@/components/Icon';
import ButtonRemove from '@/components/Button/ButtonRemove';
import RelatedModal from '@/components/Line/RelatedModal';
import { makeClassName } from '@/functions';
import { APPMON, LINE } from '@/consts/ui';
import { BASE_IMG_SIZE } from '@/consts/grid';
import { LineRelation } from '@/types/Line';

type Related = Array<string | LineRelation>;

interface Props {
	related?: Related;
	editable?: boolean;
	onChange?: (related: Related) => void;
}

const relationName = (relation: string | LineRelation) =>
	typeof relation == 'string' ? relation : relation.name;

const RelatedLines: React.FC<Props> = ({ related, editable = false, onChange }) => {
	const [showModal, setShowModal] = useState(false);
	// null while adding, otherwise the index of the relation being edited.
	const [editIndex, setEditIndex] = useState<number | null>(null);
	const dragIndex = useRef<number | null>(null);
	const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

	if (!related?.length) return null;

	const handleRemove = (index: number) => {
		onChange?.(related.filter((_, i) => i !== index));
	};

	const openAdd = () => {
		setEditIndex(null);
		setShowModal(true);
	};

	const openEdit = (index: number) => {
		setEditIndex(index);
		setShowModal(true);
	};

	const handleSubmit = (relation: string | LineRelation) => {
		const duplicate = related.some(
			(item, i) => i !== editIndex && relationName(item) === relationName(relation)
		);
		if (duplicate) return;
		if (editIndex === null) {
			onChange?.([...related, relation]);
		} else {
			onChange?.(related.map((item, i) => (i === editIndex ? relation : item)));
		}
	};

	const handleDragStart = (index: number) => {
		dragIndex.current = index;
		setDraggingIndex(index);
	};

	const handleDragEnd = () => {
		dragIndex.current = null;
		setDraggingIndex(null);
	};

	const handleDragOver = (event: React.DragEvent, index: number) => {
		if (dragIndex.current === null || dragIndex.current === index) return;
		event.preventDefault();
	};

	const handleDrop = (targetIndex: number) => {
		const source = dragIndex.current;
		if (source === null || source === targetIndex) return;

		const next = related.slice();
		const [moved] = next.splice(source, 1);
		next.splice(source < targetIndex ? targetIndex - 1 : targetIndex, 0, moved);
		onChange?.(next);
	};

	return (
		<div className="line-wrapper">
			<h2>Related lines&nbsp;:</h2>
			<Row className="line-row">
				{related.map((relation, i) => {
					const removeButton = editable && (
						<ButtonRemove
							size="sm"
							className="position-absolute top-1"
							style={{ zIndex: 3, right: 'calc(var(--bs-gutter-x) * .5)' }}
							title="Remove"
							data-related-remove
							onClick={() => handleRemove(i)}
						/>
					);
					const colProps = {
						className: makeClassName(
							'position-relative',
							editable && 'reorderable',
							draggingIndex === i && 'dragging'
						),
						style: editable ? { cursor: 'grab' } : undefined,
						...(editable && {
							draggable: true,
							onDragStart: () => handleDragStart(i),
							onDragEnd: handleDragEnd,
							onDragOver: (e: React.DragEvent) => handleDragOver(e, i),
							onDrop: () => handleDrop(i),
							// In edit mode, clicking a relation opens the edit modal
							// instead of navigating to the line.
							onClickCapture: (e: React.MouseEvent) => {
								if (
									(e.target as HTMLElement).closest(
										'[data-related-remove]'
									)
								) {
									return;
								}
								e.preventDefault();
								e.stopPropagation();
								openEdit(i);
							},
						}),
					};
					if (typeof relation == 'string') {
						const type = relation.startsWith('app_') ? APPMON : LINE;
						return (
							<Col key={i} {...colProps}>
								{removeButton}
								<LinePoint name={relation} type={type} />
							</Col>
						);
					}
					const type =
						relation.type ||
						(relation.name.startsWith('app_') ? APPMON : LINE);
					return (
						<Col key={i} {...colProps}>
							{removeButton}
							<LinePoint
								name={relation.for || relation.name}
								line={relation.name}
								type={type}
							>
								{!!relation.from ?
									<LineImage
										className="line-skin" /* from */
										name={relation.from}
										loadable={false}
									/>
								:	!!relation.for && (
										<LineImage
											className="line-skin"
											name={relation.name}
											loadable={false}
										/>
									)
								}
							</LinePoint>
						</Col>
					);
				})}
				{editable && (
					<Col>
						<button
							type="button"
							className="btn btn-outline-secondary d-flex align-items-center justify-content-center rounded"
							style={{ width: BASE_IMG_SIZE, height: BASE_IMG_SIZE }}
							title="Add a related line"
							onClick={openAdd}
						>
							<Icon name="plus" style={{ fontSize: '3rem' }} />
						</button>
					</Col>
				)}
			</Row>
			{editable && (
				<RelatedModal
					show={showModal}
					onClose={() => setShowModal(false)}
					onSubmit={handleSubmit}
					initial={editIndex === null ? null : related[editIndex]}
				/>
			)}
		</div>
	);
};

export default RelatedLines;
