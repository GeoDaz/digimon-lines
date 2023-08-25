import React from 'react';
import { ButtonGroup, DropdownButton, Dropdown, Button } from 'react-bootstrap';
import Icon from './Icon';

const DownloadDropdown: React.FC<{ downloadCode: () => void }> = ({ downloadCode }) => (
	<Button variant="secondary" onClick={downloadCode}>
		<Icon name="download me-2" /> Save as <Icon name="braces ms-1" />
	</Button>
);

// const DownloadDropdown: React.FC<{
// 	downloadCode: () => void;
// 	// downloadImage: () => void;
// }> = ({ downloadCode /* , downloadImage */ }) => (
// 	<DropdownButton
// 		as={ButtonGroup}
// 		id="download-line-options"
// 		variant="secondary"
// 		title={
// 			<span className='me-1'>
// 				<Icon name="download me-2" /> Save
// 			</span>
// 		}
// 	>
// 		<Dropdown.Item key="code" eventKey="code" onClick={downloadCode}>
// 			<Icon name="braces" /> Code
// 		</Dropdown.Item>
// 		{/* <Dropdown.Item key="image" eventKey="image" onClick={downloadImage}>
// 			<Icon name="image" /> Image
// 		</Dropdown.Item> */}
// 	</DropdownButton>
// );
export default DownloadDropdown;
