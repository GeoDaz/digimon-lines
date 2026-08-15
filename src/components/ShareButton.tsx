import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Icon from '@/components/Icon';

interface Props {
	title?: string;
	text?: string;
	/** Adresse à partager ; par défaut la page courante. */
	url?: string;
	/** Icône seule, pour les listes où le libellé n'a pas la place. */
	compact?: boolean;
	size?: 'sm' | 'lg';
	variant?: string;
	disabled?: boolean;
}

/**
 * Ouvre le partage natif du navigateur (feuille de partage sur mobile, menu
 * système sur desktop compatible) et retombe sur la copie dans le presse-papier
 * quand l'API n'existe pas.
 */
const ShareButton: React.FC<Props> = ({
	title,
	text,
	url,
	compact = false,
	size,
	variant = 'secondary',
	disabled = false,
}) => {
	const [copied, setCopied] = useState(false);

	const handleShare = async () => {
		const shared = url || window.location.href;
		if (navigator.share) {
			try {
				await navigator.share({ title: title || document.title, text, url: shared });
			} catch {
				// user cancelled or share failed, ignore
			}
			return;
		}
		try {
			await navigator.clipboard.writeText(shared);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// clipboard unavailable, ignore
		}
	};

	return (
		<Button
			variant={variant}
			size={size}
			disabled={disabled}
			onClick={handleShare}
			title={copied ? 'Link copied' : 'Share'}
		>
			{!compact && (copied ? 'Copied' : 'Share')}
			<Icon
				name={copied ? 'check-lg' : 'share-fill'}
				className={compact ? undefined : 'ms-2'}
			/>
		</Button>
	);
};
export default ShareButton;
