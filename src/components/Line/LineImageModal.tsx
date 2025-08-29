import React from 'react';
import { Modal } from 'react-bootstrap';
import LineImage from './LineImage';
import { LinePoint } from '@/types/Line';

interface Props {
	name: string;
	path?: string;
	mirror?: boolean;
	open: boolean;
	handleClose: () => void;
}

const LineImageModal: React.FC<Props> = ({
	name,
	path,
	mirror,
	open = false,
	handleClose,
}) => {
	if (!name) return null;

	return (
		<Modal show={open} onHide={handleClose} className="line-image-modal pt-4">
			<Modal.Header closeButton>
				<Modal.Title className="text-capitalize break-word">{name}</Modal.Title>
			</Modal.Header>
			<Modal.Body className="text-center overflow-auto">
				<div className="line-point m-auto">
					<LineImage
						name={name}
						path={path}
						mirror={mirror}
						width={500}
						height={500}
					/>
				</div>
			</Modal.Body>
		</Modal>
	);
};

export default LineImageModal;
