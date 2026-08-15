import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/context/toast';
import { useAuth } from '@/context/auth';
import {
	deleteUserLine,
	listProfileLines,
	saveUserLine,
	setUserLineVisibility,
	slugifyLine,
} from '@/functions/userLines';
import Line from '@/types/Line';
import { UserLineWithAuthor } from '@/types/Account';

/**
 * Le trigger de quota renvoie déjà un message en anglais contenant la limite
 * effective du compte, qui varie d'un utilisateur à l'autre : on le relaie tel
 * quel plutôt que de coder un nombre en dur côté client.
 */
const QUOTA_ERROR = 'Line quota reached';

/** Sauvegarde de la ligne courante du builder vers le compte connecté. */
export const useSaveUserLine = () => {
	const { user, profile } = useAuth();
	const { addToast } = useToast();
	const [saving, setSaving] = useState(false);

	const save = useCallback(
		async (
			line: Line,
			title: string | undefined,
			isPublic: boolean,
			cover?: string
		) => {
			if (!user) {
				addToast('Sign in to save this line to your account', 'warning');
				return null;
			}
			if (!title?.trim()) {
				addToast('Give your line a title before saving it', 'warning');
				return null;
			}

			setSaving(true);
			try {
				const saved = await saveUserLine({
					userId: user.id,
					slug: slugifyLine(title),
					title: title.trim(),
					line,
					isPublic,
					cover,
				});
				// Toast cliquable : mene a la ligne enregistree, en lecture.
				addToast(
					`Line "${saved.title || saved.slug}" saved to your account`,
					'success',
					profile?.pseudo ? `/profile/${profile.pseudo}/${saved.slug}` : undefined
				);
				return saved;
			} catch (error: any) {
				console.error('Failed to save line to account:', error);
				addToast(
					error?.message?.includes(QUOTA_ERROR) ?
						`${error.message}. Delete a line, or ask us to raise your quota.`
					:	'Failed to save the line',
					'danger'
				);
				return null;
			} finally {
				setSaving(false);
			}
		},
		[user, profile, addToast]
	);

	return { save, saving, canSave: !!user };
};

/**
 * Lignes d'un profil. La RLS ajoute d'elle-même les lignes privées quand le
 * visiteur est le propriétaire du profil, d'où une seule et même page.
 */
export const useProfileLines = (pseudo?: string) => {
	const { profile, loading: authLoading } = useAuth();
	const { addToast } = useToast();
	const [lines, setLines] = useState<UserLineWithAuthor[]>([]);
	const [loading, setLoading] = useState(true);

	const isOwner = !!pseudo && profile?.pseudo === pseudo;

	const reload = useCallback(async () => {
		if (!pseudo) {
			setLines([]);
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			setLines(await listProfileLines(pseudo));
		} catch (error) {
			console.error('Failed to load the lines:', error);
			addToast('Failed to load the lines', 'danger');
		} finally {
			setLoading(false);
		}
	}, [pseudo, addToast]);

	useEffect(() => {
		if (authLoading) return;
		reload();
	}, [authLoading, reload]);

	const remove = useCallback(
		async (id: string) => {
			// Retrait optimiste, restauré si l'écriture échoue.
			let previous: UserLineWithAuthor[] = [];
			setLines(prev => {
				previous = prev;
				return prev.filter(l => l.id !== id);
			});
			try {
				await deleteUserLine(id);
				addToast('Line deleted');
			} catch (error) {
				console.error('Failed to delete line:', error);
				setLines(previous);
				addToast('Failed to delete the line', 'danger');
			}
		},
		[addToast]
	);

	const toggleVisibility = useCallback(
		async (id: string, isPublic: boolean) => {
			let previous: UserLineWithAuthor[] = [];
			setLines(prev => {
				previous = prev;
				return prev.map(l => (l.id === id ? { ...l, is_public: isPublic } : l));
			});
			try {
				await setUserLineVisibility(id, isPublic);
				addToast(isPublic ? 'Line is now public' : 'Line is now private');
			} catch (error) {
				console.error('Failed to change visibility:', error);
				setLines(previous);
				addToast('Failed to change the visibility', 'danger');
			}
		},
		[addToast]
	);

	return {
		lines,
		isOwner,
		loading: loading || authLoading,
		reload,
		remove,
		toggleVisibility,
	};
};
