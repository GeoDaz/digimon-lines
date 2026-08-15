import React from 'react';
import Icon from '@/components/Icon';

/**
 * Item « connexion en un clic » sur le compte de test local. Renvoie un tableau
 * vide hors développement (DEV_AUTH_EMAIL y est vide), donc les appelants
 * peuvent l'étaler sans condition.
 */
const devSignInItems = (devEmail: string, signInAsDev: () => Promise<void>) =>
	devEmail ?
		[
			{
				content: (
					<>
						<Icon name="bug" /> Dev: {devEmail.split('@')[0]}
					</>
				),
				onClick: () => signInAsDev(),
			},
		]
	:	[];

export default devSignInItems;
