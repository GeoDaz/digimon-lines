import React from 'react';
import Dropdown, { DropdownProps } from 'react-bootstrap/Dropdown';
import { DropdownItemProps } from 'react-bootstrap/DropdownItem';
import { DropdownToggleProps } from 'react-bootstrap/DropdownToggle';
import { DropdownHeaderProps } from 'react-bootstrap/DropdownHeader';

// `content` est typé `string` par Bootstrap (l'attribut HTML du même nom). On le
// remplace par un ReactNode pour pouvoir mettre une icône dans un item, et on le
// retire du spread pour qu'il n'atterrisse pas sur le DOM.
interface DropdownMenuItemProps extends Omit<DropdownItemProps, 'content'> {
	target?: string;
	content?: React.ReactNode;
}

interface DropdownMenuToggleProps extends Omit<DropdownToggleProps, 'content'> {
	content?: React.ReactNode;
}

interface DropdownMenuHeaderProps extends Omit<DropdownHeaderProps, 'content'> {
	content?: React.ReactNode;
}

// `children` vient de DropdownProps mais est fourni ici par `toggle` et `items`.
interface DropdownMenuProps
	extends Omit<DropdownProps, 'toggle' | 'header' | 'items' | 'children'> {
	toggle: DropdownMenuToggleProps;
	header?: DropdownMenuHeaderProps;
	items: DropdownMenuItemProps[];
}

const DropdownMenu = ({ toggle, header, items, ...props }: DropdownMenuProps) => {
	const { content: toggleContent, ...toggleProps } = toggle;
	const { content: headerContent, ...headerProps } = header ?? {};
	return (
		<Dropdown {...props} data-bs-theme="dark">
			<Dropdown.Toggle {...toggleProps}>{toggleContent}</Dropdown.Toggle>
			<Dropdown.Menu>
				{headerContent != null && (
					<>
						<Dropdown.Header {...headerProps}>{headerContent}</Dropdown.Header>
						<Dropdown.Divider className={headerProps.className} />
					</>
				)}
				{items.map(({ content, ...item }, i) => (
					<Dropdown.Item key={i} {...item}>
						{content}
					</Dropdown.Item>
				))}
			</Dropdown.Menu>
		</Dropdown>
	);
};

export default DropdownMenu;
