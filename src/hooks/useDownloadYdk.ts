import { deckToYdk } from '@/functions/yugioh/deck';
import { createFile, downloadFile } from '@/functions/file';
import { Deck } from '@/types/YugiohDeck';
import { useState } from 'react';

const useDownloadYdk = (deck: Deck) => {
	const [name, setName] = useState<string | undefined>();

	const downloadYdk = () => {
		const file = createFile(deckToYdk(deck), 'text/plain');
		downloadFile(file, (name || 'random_deck') + '.ydk');
	};

	return { download: downloadYdk, name, setName };
};

export default useDownloadYdk;
