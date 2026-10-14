import { DigimonContext } from '@/context/digimon';
import { capitalize, makeClassName } from '@/functions';
import { DigimonItem } from '@/types/Digimon';
import React, { useContext } from 'react';
import LineImage from '../Line/LineImage';
import Icon from '../Icon';

export type RelationKey = Exclude<keyof DigimonItem, 'name'>;

export interface RelationColumn {
	key: RelationKey;
	extraKey?: RelationKey;
	extraLabel?: string;
	label: string;
	className?: string;
}

export const relationColumns: RelationColumn[] = [
	{ key: 'variants', label: 'Variants', className: 'cell-tiles-2' },
	{ key: 'modes', label: 'Modes' },
	{ key: 'x', label: 'X' },
	{
		key: 'from',
		extraKey: 'fusionFrom',
		extraLabel: 'Fusion of',
		label: 'From',
		className: 'cell-tiles-3',
	},
	{
		key: 'to',
		extraKey: 'armors',
		extraLabel: 'Armors',
		label: 'To',
		className: 'cell-tiles-3',
	},
];

interface Props extends React.HTMLAttributes<HTMLTableRowElement> {
	digimon: DigimonItem;
	columns: RelationColumn[];
	active: boolean;
	onEdit?: (digimon: DigimonItem) => void;
}
const ListRow: React.FC<Props> = ({
	digimon,
	columns,
	active,
	onEdit,
	className,
	...props
}) => {
	const { dubNames } = useContext(DigimonContext);
	const dubName = dubNames[digimon.name];
	return (
		<tr
			id={digimon.name}
			className={makeClassName(
				'evolution-row',
				active && 'active-outline',
				className
			)}
			{...props}
		>
			<td className="cell-digimon">
				<div className="digimon-identity">
					<span className="game-digimon-tile position-relative">
						<LineImage
							name={digimon.name}
							width={64}
							height={64}
							zoomable={false}
							expandable={true}
							className="game-digimon-img"
						/>
					</span>
					<span className="digimon-name">
						{capitalize(digimon.name)}
						{dubName && (
							<span className="digimon-number">{capitalize(dubName)}</span>
						)}
					</span>
					{onEdit && (
						<button
							type="button"
							className="btn btn-secondary btn-sm ms-auto"
							title="Edit"
							onClick={() => onEdit(digimon)}
						>
							<Icon name="pencil-fill" />
						</button>
					)}
				</div>
			</td>
			{columns.map(column => (
				<RelationsCell
					key={column.key}
					className={column.className}
					names={digimon[column.key]}
					extraNames={column.extraKey && digimon[column.extraKey]}
					extraLabel={column.extraLabel}
				/>
			))}
		</tr>
	);
};

const RelationsCell: React.FC<{
	names?: string[];
	extraNames?: string[];
	extraLabel?: string;
	className?: string;
}> = ({ names, extraNames, extraLabel, className }) => {
	const groups = [
		{ names, label: undefined },
		{ names: extraNames, label: extraLabel },
	].filter(group => !!group.names?.length);
	return (
		<td
			className={makeClassName(
				'cell-relations',
				className,
				!groups.length && 'void'
			)}
		>
			{groups.length ?
				groups.map((group, i) => (
					<React.Fragment key={i}>
						{group.label && (
							<strong className="relation-label">
								{group.label}&nbsp;:
							</strong>
						)}
						<div className="relation-tiles">
							{group.names!.map(name => (
								<RelationTile key={name} name={name} />
							))}
						</div>
					</React.Fragment>
				))
			:	<span className="cell-empty">&mdash;</span>}
		</td>
	);
};

const RelationTile: React.FC<{ name: string }> = ({ name }) => {
	const { dubNames } = useContext(DigimonContext);
	const dubName = dubNames[name];
	const title = capitalize(name) + (dubName ? ` / ${capitalize(dubName)}` : '');
	return (
		<span className="game-digimon-tile position-relative">
			<LineImage
				name={name}
				width={64}
				height={64}
				zoomable={false}
				expandable={true}
				title={title}
				className="game-digimon-img"
			/>
		</span>
	);
};

export default ListRow;
