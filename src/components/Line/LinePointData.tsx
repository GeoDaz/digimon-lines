import React, { useContext } from 'react';
import { DigimonContext } from '@/context/digimon';
import { makeClassName } from '@/functions';

const LinePointData: React.FC<{ name: string; className?: string }> = ({
	name,
	className,
}) => {
	const { data, dubNames } = useContext(DigimonContext);
	const dubName = dubNames[name];
	const datum = data[name] || (dubName && data[dubName]);
	if (!datum) return null;
	return (
		<div className={makeClassName('grid-2 text-start', className)}>
			{!!datum.level && (
				<div>
					<strong>Level&nbsp;:</strong>{' '}
					{Array.isArray(datum.level) ? datum.level.join(', ') : datum.level}
				</div>
			)}
			{!!datum.attribute && (
				<div>
					<strong>Attribute&nbsp;:</strong>{' '}
					{Array.isArray(datum.attribute)
						? datum.attribute.join(', ')
						: datum.attribute}
				</div>
			)}
			{!!datum.type && (
				<div>
					<strong>Type&nbsp;:</strong>{' '}
					{Array.isArray(datum.type) ? datum.type.join(', ') : datum.type}
				</div>
			)}
			{!!datum.year && (
				<div>
					<strong>Year&nbsp;:</strong> {datum.year}
				</div>
			)}
			{!!datum.field && (
				<div className="full-row">
					<strong>Field&nbsp;:</strong>{' '}
					{Array.isArray(datum.field) ? datum.field.join(', ') : datum.field}
				</div>
			)}
			{datum.variants.length > 0 && (
				<div>
					<strong>Variants&nbsp;:</strong> {datum.variants.join(', ')}
				</div>
			)}
		</div>
	);
};

export default LinePointData;
