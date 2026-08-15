import React from 'react';
import { ButtonGroup, DropdownButton, Dropdown, Spinner } from 'react-bootstrap';
import Icon from './Icon';

const DownloadDropdown: React.FC<{
	downloadCode: () => void;
	downloadImage: () => void;
	loading: boolean;
	error?: string;
	/** Options supplémentaires en tête de menu (sauvegarde dans le compte). */
	children?: React.ReactNode;
	/**
	 * L'export « Code » est remplacé par la sauvegarde dans le compte sur le
	 * builder. Explicite plutôt que déduit de `children` : si les comptes sont
	 * indisponibles, il doit rester le seul moyen d'exporter une ligne.
	 */
	showCode?: boolean;
}> = ({
	downloadCode,
	downloadImage,
	loading = false,
	error,
	children,
	showCode = true,
}) => (
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
		{!!children && <Dropdown.Divider />}
		<Dropdown.Item key="image" eventKey="image" onClick={downloadImage}>
			<Icon name="image" /> Image
		</Dropdown.Item>
		{showCode && (
			<Dropdown.Item key="code" eventKey="code" onClick={downloadCode}>
				<Icon name="braces" /> Code
			</Dropdown.Item>
		)}
	</DropdownButton>
);
export default DownloadDropdown;
