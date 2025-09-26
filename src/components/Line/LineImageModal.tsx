import React, { useContext } from 'react';
import { Modal } from 'react-bootstrap';
import LineImage from './LineImage';
import { LinePoint } from '@/types/Line';
import LinePointData from './LinePointData';
import { DigimonContext } from '@/context/digimon';
import { capitalize } from '@/functions';

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
	const { dubNames } = useContext(DigimonContext);
	if (!name) return null;
	const dubName = dubNames[name];
	return (
		<Modal show={open} onHide={handleClose} className="line-image-modal pt-4">
			<Modal.Header closeButton>
				<Modal.Title className="text-capitalize break-word">
					{capitalize(name)} {dubName && `/ ${dubName}`}
				</Modal.Title>
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
				<LinePointData name={name} className="p-4 pb-0" />
			</Modal.Body>
		</Modal>
	);
};

export default LineImageModal;
