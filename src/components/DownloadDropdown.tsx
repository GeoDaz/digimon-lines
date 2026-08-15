import React from 'react';
import { ButtonGroup, DropdownButton, Dropdown, Spinner } from 'react-bootstrap';
import Icon from './Icon';

const DownloadDropdown: React.FC<{
	downloadCode: () => void;
	downloadImage: () => void;
	loading: boolean;
	error?: string;
	/**
	 * Options supplémentaires en tête de menu (sauvegarde dans le compte, sur le
	 * builder). Elles portent leur propre séparateur : rien n'est ajouté ici,
	 * sans quoi un séparateur orphelin apparaîtrait quand elles ne rendent rien.
	 */
	children?: React.ReactNode;
}> = ({ downloadCode, downloadImage, loading = false, error, children }) => (
	<DropdownButton
		as={ButtonGroup}
		id="download-line-options"
		variant={error ? 'danger' : 'secondary'}
		title={
			loading ?
				<Spinner animation="border" />
			:	<span className="me-1">
					<Icon name="download me-2" /> Save
				</span>
		}
	>
		{children}
		<Dropdown.Item key="image" eventKey="image" onClick={downloadImage}>
			<Icon name="image" /> Image
		</Dropdown.Item>
		<Dropdown.Item key="code" eventKey="code" onClick={downloadCode}>
			<Icon name="braces" /> Code
		</Dropdown.Item>
	</DropdownButton>
);
export default DownloadDropdown;
