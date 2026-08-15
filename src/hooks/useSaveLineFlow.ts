import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '@/context/auth';
import { useToast } from '@/context/toast';
import { useSaveUserLine } from '@/hooks/useUserLines';
import { findUserLineBySlug, slugifyLine } from '@/functions/userLines';
import { copyToClipboard } from '@/functions';
import { IS_DEV, SITE_URL } from '@/consts/env';
import { MAX_LINE_DATA_BYTES } from '@/consts/images';
import {
	getLineDataBytes,
	getLineUploadedImages,
	lineToArray,
	stripUploadedImages,
} from '@/functions/line';
import { formatBytes } from '@/functions/images';
import Line from '@/types/Line';

/**
 * 'private' / 'public' : la visibilité est déjà choisie, on ne demande que le
 * titre s'il manque. 'ask' : déclenché par CTRL+S, la modale propose les deux.
 */
export type SaveMode = 'private' | 'public' | 'ask';

interface Params {
	line: Line;
	name?: string;
	setName: (name: string) => void;
}

/**
 * Orchestre la sauvegarde d'une ligne dans le compte : enregistre directement
 * quand tout est connu, ouvre la modale quand il manque le titre ou la
 * visibilité.
 */
const useSaveLineFlow = ({ line, name, setName }: Params) => {
	const { user, profile, enabled } = useAuth();
	const { save, saving } = useSaveUserLine();
	const { addToast } = useToast();
	const [mode, setMode] = useState<SaveMode | null>(null);
	/**
	 * Couverture déjà enregistrée pour cette ligne. Reste indéfinie à la
	 * création : rien n'est présélectionné dans la modale, le choix est fait
	 * par l'utilisateur et non imposé.
	 */
	const [storedCover, setStoredCover] = useState<string | undefined>();

	// Digimon présents dans la ligne : ce sont les couvertures possibles.
	const covers = useMemo(() => {
		const names = lineToArray(line).filter(Boolean);
		return names.filter((name, i) => names.indexOf(name) === i);
	}, [line]);

	/** CTRL+S reste l'écriture dans public/json/lines en dev. */
	const canSaveToAccount = enabled && !!user && !IS_DEV;

	const persist = useCallback(
		async (title: string, isPublic: boolean, cover?: string) => {
			// Les images uploadées sont écrites en base64 : saveUserLine les retire
			// avant l'écriture. On prévient, car la ligne enregistrée n'aura pas
			// tout à fait l'aspect de celle affichée à l'écran.
			const uploaded = getLineUploadedImages(line);
			if (uploaded.length) {
				const uploadedBytes = uploaded.reduce((sum, img) => sum + img.bytes, 0);
				const plural = uploaded.length > 1 ? 's' : '';
				addToast(
					`${uploaded.length} uploaded image${plural} (${formatBytes(uploadedBytes)}) ${uploaded.length > 1 ? 'were' : 'was'} not saved to your account — those points fall back to their Digimon image. Use image URLs to keep them, or "Save as Image" to export the line as you see it.`,
					'warning'
				);
			}

			// Filet de sécurité : après retrait des images, dépasser la limite
			// demanderait une grille démesurée. On préfère un message clair à une
			// erreur Postgres brute.
			const bytes = getLineDataBytes(stripUploadedImages(line));
			if (bytes > MAX_LINE_DATA_BYTES) {
				addToast(
					`This line is too heavy to save (${formatBytes(bytes)}, limit ${formatBytes(MAX_LINE_DATA_BYTES)}).`,
					'danger'
				);
				return false;
			}

			const saved = await save(line, title, isPublic, cover);
			if (!saved) return false;

			setName(title);
			if (isPublic && profile?.pseudo) {
				copyToClipboard(`${SITE_URL}/profile/${profile.pseudo}/${saved.slug}`);
				addToast('Share link copied to clipboard');
			}
			return true;
		},
		[save, line, setName, addToast, profile]
	);

	/**
	 * Depuis un item du menu, ou depuis CTRL+S avec `ask`.
	 *
	 * La modale s'ouvre s'il manque une information (titre, visibilité) et
	 * toujours à la création, pour que la couverture soit choisie plutôt
	 * qu'imposée. Un réenregistrement ultérieur passe en direct : la couverture
	 * est alors déjà celle qu'on a retenue.
	 */
	const requestSave = useCallback(
		async (requested: SaveMode) => {
			const title = name?.trim();
			let existing = null;

			if (title && user) {
				try {
					existing = await findUserLineBySlug(user.id, slugifyLine(title));
				} catch (error) {
					// Indisponible : on ouvre la modale, moins pire qu'imposer une
					// couverture sans le dire.
					console.error('Failed to look up the existing line:', error);
					setStoredCover(undefined);
					setMode(requested);
					return;
				}
			}

			setStoredCover(existing?.cover ?? undefined);

			// Création : la modale s'ouvre toujours, pour que la couverture soit
			// choisie. Elle s'ouvre aussi s'il manque le titre ou la visibilité.
			if (requested === 'ask' || !title || !existing) {
				setMode(requested);
				return;
			}

			// Mise à jour : on reconduit la couverture déjà choisie, sinon
			// l'enregistrement l'effacerait.
			persist(title, requested === 'public', existing.cover ?? undefined);
		},
		[name, persist, user]
	);

	const submitFromModal = useCallback(
		async (title: string, isPublic: boolean, cover?: string) => {
			if (await persist(title.trim(), isPublic, cover)) setMode(null);
		},
		[persist]
	);

	return {
		mode,
		saving,
		canSaveToAccount,
		defaultTitle: name,
		covers,
		defaultCover: storedCover,
		requestSave,
		submitFromModal,
		closeModal: useCallback(() => setMode(null), []),
	};
};

export default useSaveLineFlow;
