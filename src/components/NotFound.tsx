import React from 'react';
import { useRouter } from 'next/router';
import { Button } from 'react-bootstrap';
import Icon from '@/components/Icon';
import Layout from '@/components/Layout';

/**
 * Corps de la page 404. Extrait dans un composant pour que d'autres pages
 * puissent se faire passer pour une 404 — /admin le fait quand le visiteur n'a
 * pas le rôle, afin de ne pas révéler que la page existe.
 */
const NotFound: React.FC = () => {
	const router = useRouter();

	return (
		<Layout title="Page not found" metatitle="Error 404">
			<Button variant="primary" onClick={() => router.push('/')}>
				<Icon name="home" /> Go back to Home
			</Button>
		</Layout>
	);
};

export default NotFound;
