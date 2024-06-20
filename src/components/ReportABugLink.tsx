import React from 'react';
import { Button } from 'react-bootstrap';
import Icon from '@/components/Icon';
import { DISCORD_URL } from '@/consts/env';

const ReportABugLink: React.FC = () => (
	<Button
		as="a"
		href={DISCORD_URL}
		target="_blank"
		rel="nofollow noopener noreferrer"
		title="discord"
		color="primary"
	>
		<Icon name="discord" />{' '}
		<span className="mx-1">Join the commmunity or report a bug</span>{' '}
	</Button>
);
export default ReportABugLink;
