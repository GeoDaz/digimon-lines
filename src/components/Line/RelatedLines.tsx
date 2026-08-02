import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import LinePoint from '@/components/Line/LinePoint';
import LineImage from '@/components/Line/LineImage';
import ButtonRemove from '@/components/Button/ButtonRemove';
import ButtonAdd from '@/components/Button/ButtonAdd';
import RelatedModal from '@/components/Line/RelatedModal';
import useDragReorder from '@/hooks/useDragReorder';
import { makeClassName } from '@/functions';
import { APPMON, LINE } from '@/consts/ui';
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
	const relations = related || [];
	const { dragProps, draggingIndex } = useDragReorder(relations, onChange);

	// In edit mode the row stays visible when empty, to add a first relation.
	if (!related?.length && !editable) return null;

	const handleRemove = (index: number) => {
		onChange?.(relations.filter((_, i) => i !== index));
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
		if (editIndex === null) {
			onChange?.([...relations, relation]);
		} else {
			onChange?.(relations.map((item, i) => (i === editIndex ? relation : item)));
		}
	};

	return (
		<div className="line-wrapper">
			<h2>Related lines&nbsp;:</h2>
			<Row className="line-row">
				{relations.map((relation, i) => {
					const removeButton = editable && (
						<ButtonRemove
							size="sm"
							overlay
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
						...(editable && {
							...dragProps(i),
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
						<ButtonAdd title="Add a related line" onClick={openAdd} />
					</Col>
				)}
			</Row>
			{editable && (
				<RelatedModal
					show={showModal}
					onClose={() => setShowModal(false)}
					onSubmit={handleSubmit}
					initial={editIndex === null ? null : relations[editIndex]}
				/>
			)}
		</div>
	);
};

export default RelatedLines;
