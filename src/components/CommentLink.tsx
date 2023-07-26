import React from 'react';
import { Button } from 'react-bootstrap';
import Icon from '@/components/Icon';

const CommentLink: React.FC = () => (
	<p className="text-center mb-4">
		<Button
			as="a"
			href="https://discord.gg/GkGd8ED8Nc"
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
