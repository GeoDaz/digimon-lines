import React, { useEffect, useState } from 'react';
import { Badge, Modal, Spinner } from 'react-bootstrap';
import CardImage from '@/components/Cards/CardImage';
import { DIGIMON_COLORS } from '@/functions/cardGames';
import { cardImageUrl, CARD_LEVELS } from '@/functions/dcgCards';
import { AlysionCard } from '@/functions/alysionCards';
import { AlysionCardDetails, loadAlysionDetails } from '@/functions/alysionDetails';

const LIGHT_COLORS = ['Yellow', 'White'];

const RARITY_LABELS: Record<string, string> = {
	C: 'Common',
	U: 'Uncommon',
	R: 'Rare',
	SR: 'Super Rare',
	SEC: 'Secret Rare',
	P: 'Promo',
};

const TYPE_LABELS: Record<string, string> = {
	D: 'Digimon',
	E: 'Digi-Egg',
	T: 'Tamer',
	O: 'Option',
};

const Effect: React.FC<{ title: string; text?: string }> = ({ title, text }) => {
	if (!text) return null;
	return (
		<div className="alysion-effect">
			<h4>{title}</h4>
			<p>
				{text.split(/(\[[^\]]+\]|＜[^＞]+＞|<[^>]+>)/).map((part, index) =>
					/^(\[.*\]|＜.*＞|<.*>)$/.test(part) ?
						<span key={index} className="alysion-effect-tag">
							{part.slice(1, -1)}
						</span>
					:	<React.Fragment key={index}>{part}</React.Fragment>
				)}
			</p>
		</div>
	);
};

interface Props {
	card: AlysionCard;
	show: boolean;
	onHide: () => void;
}

const AlysionCardModal: React.FC<Props> = ({ card, show, onHide }) => {
	const [details, setDetails] = useState<AlysionCardDetails | null | undefined>(undefined);

	useEffect(() => {
		if (!show || details !== undefined) return;
		loadAlysionDetails()
			.then(all => setDetails(all[card.id] || null))
			.catch(() => setDetails(null));
	}, [show, details, card.id]);

	const stats: Array<{ label: string; value: string }> = [];
	if (details?.cost !== undefined) stats.push({ label: card.type === 'O' ? 'Use cost' : 'Play cost', value: String(details.cost) });
	if (details?.dp !== undefined) {
		stats.push({ label: 'DP', value: details.dp.toLocaleString('en-US') });
	}
	for (const [color, level, cost] of details?.digivolve || []) {
		stats.push({ label: 'Digivolve', value: `${cost} from Lv.${level} ${color}` });
	}

	return (
		<Modal show={show} onHide={onHide} size="lg" centered className="alysion-card-modal">
			<Modal.Header closeButton>
				<Modal.Title>
					{card.name} <small>{card.id}</small>
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="alysion-card-modal-body">
					<div className="alysion-card-modal-image">
						<CardImage
							src={cardImageUrl(card.id)}
							name={card.name}
							code={card.id}
							lazy={false}
						/>
					</div>
					<div className="alysion-card-modal-info">
						<div className="alysion-card-modal-tags">
							{(card.colors || []).map(color => (
								<span
									key={color}
									className={`badge alysion-color-badge${LIGHT_COLORS.includes(color) ? ' light' : ''}`}
									style={{ background: DIGIMON_COLORS[color] }}
								>
									{color}
								</span>
							))}
							<Badge bg="secondary">{TYPE_LABELS[card.type]}</Badge>
							{card.level > 0 && CARD_LEVELS[card.level] && (
								<Badge bg="secondary">
									Lv.{card.level} {CARD_LEVELS[card.level]}
								</Badge>
							)}
							{details?.rarity && (
								<span
									className={`badge alysion-rarity-badge rarity-${details.rarity.toLowerCase()}`}
									title={RARITY_LABELS[details.rarity] || details.rarity}
								>
									{details.rarity}
								</span>
							)}
							{card.restricted && (
								<Badge bg="warning" text="dark">
									Restricted to 1
								</Badge>
							)}
							{card.count > 0 && <span className="badge alysion-qty-badge">Qty {card.count}</span>}
						</div>
						{details === undefined ?
							<Spinner animation="border" role="status" aria-label="Loading" />
						: details === null ?
							<p className="text-secondary">
								The details of this card are not available yet.
							</p>
						:	<>
								{(details.form || details.attribute || details.traits) && (
									<p className="alysion-card-modal-traits">
										{[details.form, details.attribute, details.traits]
											.filter(Boolean)
											.join(' · ')}
									</p>
								)}
								{stats.length > 0 && (
									<dl className="alysion-card-modal-stats">
										{stats.map((stat, index) => (
											<div key={index}>
												<dt>{stat.label}</dt>
												<dd>{stat.value}</dd>
											</div>
										))}
									</dl>
								)}
								<Effect title="Effect" text={details.effect} />
								<Effect title="Inherited effect" text={details.inherited} />
								<Effect title="Security effect" text={details.security} />
							</>
						}
					</div>
				</div>
			</Modal.Body>
		</Modal>
	);
};

export default AlysionCardModal;
