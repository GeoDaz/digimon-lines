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
 * Purement présentationnel : la modale et l'écriture vivent dans
 * useSaveLineFlow, au niveau de la page — un composant rendu dans un menu
 * déroulant est démonté à sa fermeture.
 */
const SaveToAccountItems: React.FC<Props> = ({ saving, onRequestSave }) => {
	const { user, enabled, loading, signIn, devEmail, signInAsDev } = useAuth();

	if (!enabled || loading) return null;

	if (!user) {
		return (
			<>
				<Dropdown.Item onClick={() => signIn('discord')}>
					<Icon name="discord" /> Sign in to save
				</Dropdown.Item>
				<Dropdown.Item onClick={() => signIn('google')}>
					<Icon name="google" /> Sign in with Google
				</Dropdown.Item>
				{!!devEmail && (
					<Dropdown.Item onClick={() => signInAsDev()}>
						<Icon name="bug" /> Dev: {devEmail.split('@')[0]}
					</Dropdown.Item>
				)}
			</>
		);
	}

	return (
		<>
			<Dropdown.Item disabled={saving} onClick={() => onRequestSave('private')}>
				<Icon name="lock" /> {saving ? 'Saving…' : 'Private'}
			</Dropdown.Item>
			<Dropdown.Item disabled={saving} onClick={() => onRequestSave('public')}>
				<Icon name="globe" /> Publish
			</Dropdown.Item>
		</>
	);
};

export default SaveToAccountItems;
