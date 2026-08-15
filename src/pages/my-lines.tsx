import React from 'react';
import { Alert, Button, Spinner } from 'react-bootstrap';
import Layout from '@/components/Layout';
import Icon from '@/components/Icon';
import ProfileLines from '@/components/Account/ProfileLines';
import { useAuth } from '@/context/auth';

/**
 * Raccourci vers son propre profil : rend exactement la page publique, que la
 * RLS enrichit des lignes privées et des actions d'édition.
 */
const PageMyLines = () => {
	const { user, profile, loading, enabled, signIn, devEmail, signInAsDev } = useAuth();

	if (!enabled) {
		return (
			<Layout title="My lines" metatitle="My lines">
				<Alert variant="warning">Accounts are not available right now.</Alert>
			</Layout>
		);
	}

	if (!loading && !user) {
		return (
			<Layout title="My lines" metatitle="My lines">
				<p>Sign in to save your lines and share them.</p>
				<Button variant="primary" onClick={() => signIn('discord')}>
					<Icon name="discord" /> Continue with Discord
				</Button>{' '}
				<Button variant="outline-primary" onClick={() => signIn('google')}>
					<Icon name="google" /> Continue with Google
				</Button>
				{!!devEmail && (
					<>
						{' '}
						<Button variant="outline-secondary" onClick={() => signInAsDev()}>
							<Icon name="bug" /> {devEmail.split('@')[0]}
						</Button>
					</>
				)}
			</Layout>
		);
	}

	// Le profil arrive juste après la session : on attend le pseudo pour ne pas
	// lancer une requête sur un profil indéfini.
	if (!profile?.pseudo) {
		return (
			<Layout title="My lines" metatitle="My lines">
				<Spinner animation="border" role="status" aria-label="Loading" />
			</Layout>
		);
	}

	return <ProfileLines pseudo={profile.pseudo} />;
};

export default PageMyLines;
