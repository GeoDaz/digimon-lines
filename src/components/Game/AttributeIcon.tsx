import React from 'react';

interface Props {
	game: string;
	attribute?: string;
}
const AttributeIcon: React.FC<Props> = ({ game, attribute }) => {
	if (!attribute) return null;
	const key = attribute.toLowerCase().replace(/[^a-z0-9]+/g, '-');
	return (
		<img
			src={`/images/games/${game}/attributes/${key}.png`}
			alt={attribute}
			title={attribute}
			loading="lazy"
			className="attribute-icon"
		/>
	);
};
export default AttributeIcon;
