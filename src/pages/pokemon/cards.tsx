import React from 'react';
import Layout from '@/components/Layout';
import CardLineMaker from '@/components/Cards/CardLineMaker';
import { POKEMON_GAME } from '@/functions/cardGames';

const PagePokemonCards: React.FC = () => (
	<Layout
		title="Pokémon card line maker"
		metatitle="Pokémon TCG evolution line maker"
		metaimg="pokemon-cards.jpg"
		metadescription="Line up Pokémon Trading Card Game cards on a colorful background, from a single evolution line to a whole deck, then download the picture to share it."
	>
		<p className="card-maker-intro">
			Pick your cards, choose a background, then download the picture. Click a slot to
			search a card by name or by card number.
		</p>
		<CardLineMaker game={POKEMON_GAME} />
		<p className="card-maker-credits">
			Pokémon Trading Card Game card images © The Pokémon Company / Nintendo / Creatures /
			GAME FREAK, provided through{' '}
			<a href="https://tcgdex.dev" target="_blank" rel="noreferrer">
				TCGdex
			</a>
			. Fan-made tool, not affiliated with Nintendo or The Pokémon Company.
		</p>
	</Layout>
);

export default PagePokemonCards;
