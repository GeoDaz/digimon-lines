import React from 'react';

const elementIcons = [
	'dark',
	'earth',
	'electric',
	'fire',
	'light',
	'neutral',
	'plant',
	'water',
	'wind',
];

interface Props {
	attribute?: string;
}
const AttributeIcon: React.FC<Props> = ({ attribute }) => {
	if (!attribute) return null;
	const key = attribute.toLowerCase().replace(/[^a-z0-9]+/g, '-');
	const file = elementIcons.includes(key) ? `${key}-icon` : key;
	return (
		<img
			src={`/images/items/${file}.png`}
			alt={attribute}
			title={attribute}
			loading="lazy"
			className="attribute-icon"
		/>
	);
};
export default AttributeIcon;
