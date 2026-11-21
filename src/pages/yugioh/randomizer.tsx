import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Layout from '@/components/Layout';
import { GetStaticProps } from 'next';
import { randomizeDeck, RandomizeDeckArgs } from '@/functions/yugioh/deckRandomizer';
import Deck from '@/components/Yugioh/Deck';
import Icon from '@/components/Icon';
import { Deck as DeckType } from '@/types/YugiohDeck';
import { getCardArchetype, isExtraDeck } from '@/functions/yugioh/card';
import useDownloadYdk from '@/hooks/useDownloadYdk';
import { RegulationLabels, Regulations } from '@/consts/yugioh/limitations';
import SelectField from '@/components/Field/SelectField';
import Range from '@/components/Field/Range';
import { consistencyLevels } from '@/consts/yugioh/consistency';
import { STAPLE_MIN_DECK_TYPES } from '@/consts/yugioh/deck';

type Props = Omit<RandomizeDeckArgs, 'regulation' & 'consitency'>;

const defaultProps: Props = {
	cards: {},
	extraCards: [],
	mainCards: [],
	names: {},
	staples: [],
};
const defaultDeck: DeckType = { mainDeck: [], extraDeck: [] };

const PageLines: React.FC<Props> = props => {
	const [deck, setDeck] = useState<DeckType>(defaultDeck);
	const { download } = useDownloadYdk(deck);
	const [loading, setLoading] = useState(false);
	const [regulation, setRegulation] = useState<Regulations>(Regulations.md);
	const [consistency, setConsistency] = useState<number>(1);

	const handleRandomize = async () => {
		setLoading(true);
		randomizeDeck({ ...props, regulation, consistency }).then(deck => {
			setDeck(deck);
			setLoading(false);
		});
	};

	const { mainDeck, extraDeck } = deck;
	return (
		<Layout
			noGoBack
			title="Deck Randomizer"
			metatitle="Yu-Gi-Oh! Deck Randomizer"
			metadescription="Get a randomized Yu-Gi-Oh deck with this tool."
			metaimg="yugioh.png"
		>
			<div className="d-flex gap-3 mb-3">
				<SelectField
					id="format-select"
					label="Format"
					onChange={e => setRegulation(e.target.value as Regulations)}
					value={regulation}
					options={RegulationLabels}
				/>
				<Button
					size="lg"
					onClick={handleRandomize}
					variant={mainDeck.length > 0 ? 'outline-primary' : 'primary'}
				>
					<Icon
						name="arrow-counterclockwise me-2"
						className={loading ? 'spinning' : undefined}
					/>{' '}
					Randomize a deck
				</Button>
				{mainDeck.length > 0 && (
					<Button size="lg" onClick={download}>
						<Icon name="download me-2" /> Export
					</Button>
				)}
			</div>
			<div>
				<Range
					id="consistency"
					label="Consistency"
					value={consistency}
					onChange={setConsistency}
					options={consistencyLevels}
				/>
			</div>
			{/* TODO add a void deck section with a plus button */}
			{mainDeck.length > 0 && (
				<div className="mt-4">
					<Deck
						deck={mainDeck}
						title="Main Deck"
						/* handleAddCard={handleAddCard} */
					/>
				</div>
			)}
			{extraDeck.length > 0 && (
				<div className="mt-4">
					<Deck
						deck={extraDeck}
						title="Extra Deck"
						bottom
						max={15}
						/* handleAddCard={handleAddCard} */
					/>
				</div>
			)}
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	try {
		const cards: RandomizeDeckArgs['cards'] = require('../../json/yugioh/top.json');
		const mainCards: RandomizeDeckArgs['mainCards'] = [];
		const extraCards: RandomizeDeckArgs['extraCards'] = [];
		const names: RandomizeDeckArgs['names'] = {};

		Object.values(cards).forEach(card => {
			card.archetype = getCardArchetype(card);
			names[card.name] = card._id;
			if (isExtraDeck(card)) {
				extraCards.push(card._id);
			} else {
				mainCards.push(card._id);
			}
		});

		const staples: RandomizeDeckArgs['staples'] = mainCards.filter(
			id => cards[id].deckTypes.length >= STAPLE_MIN_DECK_TYPES
		);

		return { props: { cards, names, mainCards, extraCards, staples } };
	} catch (e) {
		console.error(e);
		return { props: { defaultProps } };
	}
};

export default PageLines;
