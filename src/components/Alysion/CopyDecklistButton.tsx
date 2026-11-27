import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Icon from '@/components/Icon';
import { AlysionCard, decklistText } from '@/functions/alysionCards';

const CopyDecklistButton: React.FC<{ cards: AlysionCard[] }> = ({ cards }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard
			.writeText(decklistText(cards))
			.then(() => {
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			})
			.catch(() => setCopied(false));
	};

	return (
		<Button variant="outline-primary" onClick={handleCopy}>
			<Icon name={copied ? 'check-lg' : 'clipboard'} /> {copied ? 'Copied' : 'Copy the list'}
		</Button>
	);
};

export default CopyDecklistButton;
