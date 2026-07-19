import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Icon from '@/components/Icon';

interface Props {
	title?: string;
	text?: string;
}
const ShareButton: React.FC<Props> = ({ title, text }) => {
	const [copied, setCopied] = useState(false);

	const handleShare = async () => {
		const url = window.location.href;
		if (navigator.share) {
			try {
				await navigator.share({ title: title || document.title, text, url });
			} catch {
				// user cancelled or share failed, ignore
			}
			return;
		}
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// clipboard unavailable, ignore
		}
	};

	return (
		<Button variant="secondary" onClick={handleShare} title="Share">
			{copied ? 'Copied' : 'Share'}
			<Icon name={copied ? 'check-lg' : 'share-fill'} className="me-1" />
		</Button>
	);
};
export default ShareButton;
