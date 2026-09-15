import React from 'react';
import Icon from '@/components/Icon';
import { formatCount, makeClassName } from '@/functions';

interface Props {
	count: number;
	liked?: boolean;
	onClick?: () => void;
	title?: string;
	className?: string;
}

const LikeHeart: React.FC<Props> = ({
	count,
	liked = false,
	onClick,
	title,
	className,
}) => {
	const label = `${count} like${count > 1 ? 's' : ''}`;
	const classNames = makeClassName('like-heart', liked && 'liked', className);
	const content = (
		<>
			<Icon name={liked ? 'heart-fill' : 'heart'} />
			<span className="like-heart-count">{formatCount(count)}</span>
		</>
	);

	if (!onClick) {
		return (
			<span className={classNames} title={title || label}>
				{content}
			</span>
		);
	}

	return (
		<button
			type="button"
			className={classNames}
			title={title || (liked ? `Liked — ${label}` : `Like this line — ${label}`)}
			aria-pressed={liked}
			onClick={event => {
				event.preventDefault();
				event.stopPropagation();
				onClick();
			}}
		>
			{content}
		</button>
	);
};

export default LikeHeart;
