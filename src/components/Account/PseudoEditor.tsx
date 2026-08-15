import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Form, FormControl, InputGroup } from 'react-bootstrap';
import Popup from '@/components/Popup';
import Icon from '@/components/Icon';
import { useAuth } from '@/context/auth';
import { useToast } from '@/context/toast';
import { updatePseudo } from '@/functions/userLines';

/** Doit rester alignée sur la contrainte SQL : ^[a-z0-9_-]{3,24}$ */
const PSEUDO_PATTERN = /^[a-z0-9_-]{3,24}$/;

interface Props {
	pseudo: string;
}

/**
 * Renommage du pseudo depuis sa propre page de profil. Le pseudo est l'adresse
 * publique de l'utilisateur, donc le changer réécrit tous ses liens de partage :
 * on le dit avant, et on redirige vers la nouvelle URL après.
 */
const PseudoEditor: React.FC<Props> = ({ pseudo }) => {
	const router = useRouter();
	const { user, refreshProfile } = useAuth();
	const { addToast } = useToast();

	const [value, setValue] = useState(pseudo);
	const [saving, setSaving] = useState(false);

	// Le pseudo arrive après la session : le champ doit suivre.
	useEffect(() => setValue(pseudo), [pseudo]);

	const trimmed = value.trim().toLowerCase();
	const valid = PSEUDO_PATTERN.test(trimmed);
	const unchanged = trimmed === pseudo;

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user || !valid || unchanged || saving) return;

		setSaving(true);
		try {
			await updatePseudo(user.id, trimmed);
			await refreshProfile();
			addToast(`You are now known as ${trimmed}`);
			// Les liens de partage ont changé : on suit le nouveau.
			router.replace(`/profile/${trimmed}`);
		} catch (error: any) {
			console.error('Failed to change the pseudonym:', error);
			addToast(
				// 23505 : violation d'unicité, le seul cas que l'utilisateur peut
				// corriger lui-même.
				error?.code === '23505' ?
					`“${trimmed}” is already taken, pick another one`
				:	'Failed to change your pseudonym',
				'danger'
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Form onSubmit={submit} className="mb-4">
			<InputGroup className="width-auto d-inline-flex">
				<InputGroup.Text>Username</InputGroup.Text>
				<FormControl
					id="profile-pseudo"
					value={value}
					maxLength={24}
					max={24}
					aria-label="Username"
					isInvalid={!!trimmed && !valid}
					onChange={e => setValue(e.target.value)}
				/>
				<Button
					type="submit"
					variant="primary"
					title="Save my pseudonym"
					disabled={!valid || unchanged || saving}
				>
					<Icon name={saving ? 'hourglass-split' : 'check-lg'} />
				</Button>
			</InputGroup>
			<Popup
				trigger={
					<span className="d-inline-block ms-2 align-middle">
						<Icon name="info-circle" className="click" />
					</span>
				}
			>
				<span>
					3 to 24 characters: lowercase letters, digits, hyphens and
					underscores. Your pseudonym is your public address — changing it
					rewrites your share links, and the old ones stop working.
				</span>
			</Popup>
		</Form>
	);
};

export default PseudoEditor;
