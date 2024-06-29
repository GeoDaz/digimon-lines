import React from 'react';
import { ButtonGroup, DropdownButton, Dropdown, Button, Spinner } from 'react-bootstrap';
import Icon from './Icon';

// const DownloadDropdown: React.FC<{ downloadCode: () => void }> = ({ downloadCode }) => (
// 	<Button variant="secondary" onClick={downloadCode}>
// 		<Icon name="download me-2" /> Save as <Icon name="braces ms-1" />
// 	</Button>
// );

const DownloadDropdown: React.FC<{
	downloadCode: () => void;
	downloadImage: () => void;
	loading: boolean;
	error?: string;
}> = ({ downloadCode, downloadImage, loading = false, error }) => (
	<DropdownButton
		as={ButtonGroup}
		id="download-line-options"
		variant={error ? 'danger' : 'secondary'}
		title={
			loading ? (
				<Spinner animation="border" />
			) : (
				<span className="me-1">
					<Icon name="download me-2" /> Save as
				</span>
			)
		}
	>
		<Dropdown.Item key="image" eventKey="image" onClick={downloadImage}>
			<Icon name="image" /> Image
		</Dropdown.Item>
		<Dropdown.Item key="code" eventKey="code" onClick={downloadCode}>
			<Icon name="braces" /> Code
		</Dropdown.Item>
	</DropdownButton>
);
export default DownloadDropdown;
