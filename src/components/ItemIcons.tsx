import React from 'react';
import Image from 'next/image';
import { makeClassName } from '@/functions';
import { ItemIcon } from '@/functions/items';
import Popup from './Popup';

interface Props {
	icons: ItemIcon[];
	className?: string;
}

// Affiche des attributs / fields sous forme d'icônes : le libellé est porté par
// alt et par une popup au survol, et les valeurs sans icône restent en texte.
const ItemIcons: React.FC<Props> = ({ icons, className }) => {
	if (!icons.length) return null;
	return (
		<span className={makeClassName('item-icons', className)}>
			{icons.map(({ label, src }) =>
				src ?
					// Le span porte la ref attendue par l'OverlayTrigger.
					<Popup
						key={label}
						trigger={
							<span className="d-inline-flex">
								<Image
									src={src}
									alt={label}
									width={48}
									height={48}
									className="item-icon click"
								/>
							</span>
						}
					>
						<span>{label}</span>
					</Popup>
				:	<span key={label}>{label}</span>
			)}
		</span>
	);
};

export default ItemIcons;
