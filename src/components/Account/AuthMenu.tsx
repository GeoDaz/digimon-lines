import React from 'react';
import DropdownMenu from '@/components/DropdownMenu';
import Icon from '@/components/Icon';
import { useAuth } from '@/context/auth';
import devSignInItems from '@/components/Account/devSignInItems';
import { makeClassName } from '@/functions';

/**
 * Entrée de compte dans le header. N'affiche rien tant que Supabase n'est pas
 * configuré, pour qu'un clone du repo sans .env.local reste utilisable.
 */
const AuthMenu: React.FC<{ className?: string }> = ({ className }) => {
	const { user, profile, loading, enabled, signIn, signOut, devEmail, signInAsDev } =
		useAuth();

	if (!enabled || loading) return null;

	if (!user) {
		return (
			<DropdownMenu
				align="end"
				className={makeClassName('nav-link drop-none', className)}
				toggle={{
					content: (
						<>
							<Icon name="person-circle" />{' '}
							<span className="d-none d-lg-inline-block">Sign in</span>
						</>
					),
				}}
				items={[
					{
						content: (
							<>
								<Icon name="discord" /> Continue with Discord
							</>
						),
						onClick: () => signIn('discord'),
					},
					{
						content: (
							<>
								<Icon name="google" /> Continue with Google
							</>
						),
						onClick: () => signIn('google'),
					},
					...devSignInItems(devEmail, signInAsDev),
				]}
			/>
		);
	}

	const pseudo = profile?.pseudo;

	return (
		<DropdownMenu
			align="end"
			className={makeClassName('nav-link drop-none', className)}
			toggle={{
				content: (
					<>
						<Icon name="person-circle" />{' '}
						<span className="d-none d-lg-inline-block">
							{pseudo || 'Account'}
						</span>
					</>
				),
			}}
			items={[
				{
					href: '/my-lines',
					content: (
						<>
							<Icon name="collection" /> My lines
						</>
					),
				},
				...(profile?.is_admin ?
					[
						{
							href: '/admin',
							content: (
								<>
									<Icon name="shield-fill-check" /> Administration
								</>
							),
						},
					]
				:	[]),
				{
					content: (
						<>
							<Icon name="box-arrow-right" /> Sign out
						</>
					),
					onClick: () => signOut(),
				},
			]}
		/>
	);
};

export default AuthMenu;
