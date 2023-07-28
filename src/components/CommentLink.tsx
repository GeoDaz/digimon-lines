import React from 'react';
import { Button } from 'react-bootstrap';
import Icon from '@/components/Icon';
import { DISCORD_URL } from '@/consts/env';

const CommentLink: React.FC = () => (
	<p className="text-center mb-4">
		<Button
			as="a"
			href={DISCORD_URL}
			target="_blank"
			rel="nofollow noopener noreferrer"
			title="discord"
			color="primary"
			className="btn-lg"
		>
			<Icon name="chat-left-dots-fill" /> Comment it on Discord !{' '}
			<Icon name="discord" />
		</Button>
	</p>
);
export default CommentLink;
