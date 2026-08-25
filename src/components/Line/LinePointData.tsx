import React, { useContext, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { DigimonContext } from '@/context/digimon';
import { makeClassName } from '@/functions';
import { getAttributeIcons, getFieldIcons } from '@/functions/items';
import ItemIcons from '../ItemIcons';
import Icon from '../Icon';
import { Digimon } from '@/types/Digimon';

const LinePointData: React.FC<{
	name: string;
	className?: string;
	datum?: Digimon;
	level?: string;
}> = ({ name, className, datum: datumProp, level }) => {
	const { data, dubNames } = useContext(DigimonContext);
	// Les niveaux secondaires restent cachés derrière le bouton « … », et se
	// referment quand le composant passe à un autre digimon.
	const [showOtherLevels, setShowOtherLevels] = useState(false);
	useEffect(() => {
		setShowOtherLevels(false);
	}, [name]);
	const dubName = dubNames[name];
	const datum = datumProp || data[name] || (dubName && data[dubName]);
	if (!datum) return null;
	// Le niveau complète l'attribut : Baby I / II « No Data », Armor « Free »,
	// Hybrid « Variable », même quand la donnée ne le précise pas.
	const attributes = getAttributeIcons(datum.attribute, datum.level);
	const fields = getFieldIcons(datum.field);
	const datumLevels =
		Array.isArray(datum.level) ? datum.level
		: datum.level ? [datum.level]
		: [];
	const mainLevel = level || datumLevels[0];
	const otherLevels = datumLevels.filter(datumLevel => datumLevel !== mainLevel);
	return (
		<div className={makeClassName('grid-2 text-start align-items-center', className)}>
			{!!mainLevel && (
				<div>
					<strong>Level&nbsp;:</strong> {mainLevel}{' '}
					{otherLevels.length > 0 &&
						(showOtherLevels ?
							<small className="text-muted">
								({otherLevels.join(', ')})
							</small>
						:	<Button
								variant="secondary"
								size="sm"
								className="py-0 px-1 lh-1"
								title="Show the other levels"
								onClick={() => setShowOtherLevels(true)}
							>
								<Icon name="three-dots" />
							</Button>)}
				</div>
			)}
			{!!datum.type && (
				<div>
					<strong>Type&nbsp;:</strong>{' '}
					{Array.isArray(datum.type) ? datum.type.join(', ') : datum.type}
				</div>
			)}
			{attributes.length > 0 && (
				<div>
					<strong>Attribute&nbsp;:</strong> <ItemIcons icons={attributes} />
				</div>
			)}
			{fields.length > 0 && (
				<div className={fields.length > 3 ? 'full-row' : undefined}>
					<strong>Field&nbsp;:</strong> <ItemIcons icons={fields} />
				</div>
			)}
			{!!datum.year && (
				<div>
					<strong>Year&nbsp;:</strong> {datum.year}
				</div>
			)}
			{!!datum.source && (
				<div>
					<strong>Source&nbsp;:</strong> {datum.source}
				</div>
			)}
		</div>
	);
};

export default LinePointData;
