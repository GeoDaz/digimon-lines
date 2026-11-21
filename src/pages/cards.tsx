import React from 'react';
import Layout from '@/components/Layout';
import CardLineMaker from '@/components/Cards/CardLineMaker';
import { DIGIMON_GAME } from '@/functions/cardGames';

const PageCards: React.FC = () => (
	<Layout
		title="Card line maker"
		metatitle="Digimon Card Game evolution line maker"
		metaimg="digimon-cards.jpg"
		metadescription="Line up Digimon Card Game cards from Rookie to Mega and Ultra on a colorful background, then download the picture to share your favorite evolution line."
	>
		<p className="card-maker-intro">
			Pick a card for each level, choose a background, then download the picture.
			Click a slot to search a card by name or number, alternative arts included.
		</p>
		<CardLineMaker game={DIGIMON_GAME} />
		<p className="card-maker-credits">
			Digimon Card Game card images © Bandai. Fan-made tool, not affiliated with Bandai.
		</p>
	</Layout>
);

export default PageCards;
