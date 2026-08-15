import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Icon from '@/components/Icon';
import { useAuth } from '@/context/auth';
import { SaveMode } from '@/hooks/useSaveLineFlow';

interface Props {
	saving: boolean;
	onRequestSave: (mode: SaveMode) => void;
}

/**
 * Options de sauvegarde dans le compte, destinées au menu « Save » du builder.
 * Rend des Dropdown.Item plutôt qu'un menu à part, pour ne pas multiplier les
 * boutons dans une barre d'outils déjà chargée.
 *
 * Ne rend rien tant qu'on n'est pas connecté : le menu Save se limite alors aux
 * exports, se connecter passant par le header. Le séparateur fait partie de ce
 * rendu, pour qu'il n'apparaisse jamais seul.
 *
 * Purement présentationnel : la modale et l'écriture vivent dans
 * useSaveLineFlow, au niveau de la page — un composant rendu dans un menu
 * déroulant est démonté à sa fermeture.
 */
const SaveToAccountItems: React.FC<Props> = ({ saving, onRequestSave }) => {
	const { user, enabled, loading } = useAuth();

	if (!enabled || loading || !user) return null;

	return (
		<>
			<Dropdown.Item disabled={saving} onClick={() => onRequestSave('private')}>
				<Icon name="lock" /> {saving ? 'Saving…' : 'Private'}
			</Dropdown.Item>
			<Dropdown.Item disabled={saving} onClick={() => onRequestSave('public')}>
				<Icon name="globe" /> Publish
			</Dropdown.Item>
			<Dropdown.Divider />
		</>
	);
};

export default SaveToAccountItems;
