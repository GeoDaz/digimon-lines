import { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { DropdownItemProps } from 'react-bootstrap/DropdownItem';
import { DropdownToggleProps } from 'react-bootstrap/DropdownToggle';

interface DropdownMenuItemProps extends DropdownItemProps {
	target?: string;
}

interface DropdownMenuProps {
	toggle: DropdownToggleProps;
	items: DropdownMenuItemProps[];
	id?: string;
	className?: string;
}

const DropdownMenu = ({ toggle, items, ...props }: DropdownMenuProps) => (
	<Dropdown {...props} data-bs-theme="dark">
		<Dropdown.Toggle {...toggle}>{toggle.content}</Dropdown.Toggle>
		<Dropdown.Menu>
			{items.map((item, i) => (
				<Dropdown.Item key={i} href={item.href} {...item}>
					{item.content}
				</Dropdown.Item>
			))}
		</Dropdown.Menu>
	</Dropdown>
);

export default DropdownMenu;
