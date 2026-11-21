import React from 'react';
import Layout from '@/components/Layout';
import CardLineMaker from '@/components/Cards/CardLineMaker';
import { YUGIOH_GAME } from '@/functions/cardGames';

const PageYugiohCards: React.FC = () => (
	<Layout
		title="Yu-Gi-Oh! card line maker"
		metatitle="Yu-Gi-Oh! card line maker"
		metadescription="Line up Yu-Gi-Oh! cards on a colorful background, from a combo to a whole deck, then download the picture to share it."
		metaimg="yugioh.png"
	>
		<p className="card-maker-intro">
			Pick your cards, choose a background, then download the picture. Click a slot to
			search a card by name, alternative arts included.
		</p>
		<CardLineMaker game={YUGIOH_GAME} />
		<p className="card-maker-credits">
			Yu-Gi-Oh! card images © Studio Dice / SHUEISHA, TV TOKYO, KONAMI, provided through{' '}
			<a href="https://www.masterduelmeta.com" target="_blank" rel="noreferrer">
				Master Duel Meta
			</a>
			. Fan-made tool, not affiliated with KONAMI.
		</p>
	</Layout>
);

export default PageYugiohCards;
