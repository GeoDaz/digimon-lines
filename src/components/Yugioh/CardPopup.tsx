import { Card as CardType } from '@/types/YugiohCard';
import Popup, { PopupProps } from '@/components/Yugioh/Popup';

const CardPopup = ({
	card,
	children,
	placement = 'bottom',
}: {
	card: CardType;
	children: PopupProps['children'];
	placement?: PopupProps['placement'];
}) => {
	const data = (() => {
		const data = [card.type, ...card.monsterType];
		if (card.level) data.push(`Level : ${card.level}*`);
		if (card.attribute) data.push(`Attribute : ${card.attribute}`);
		if (card.race) data.push(`Type : ${card.race}`);
		return data.join('\u00A0| ');
	})();

	return (
		<Popup
			header={card.name}
			placement={placement}
			className="card-popup"
			body={
				<div>
					<p>
						<strong className="d-block">{data}</strong>
						{card.atk !== undefined && (
							<b className="d-block">
								ATK&nbsp;: {card.atk} | DEF&nbsp;: {card.def}
							</b>
						)}
					</p>
					<p>{card.description}</p>
				</div>
			}
		>
			{children}
		</Popup>
	);
};

export default CardPopup;
