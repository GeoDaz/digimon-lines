import React from 'react';
import { useRouter } from 'next/router';
import Icon from './Icon';

const GoBack: React.FC = () => {
	const router = useRouter();

	return (
		<Icon
			name="arrow-left-circle-fill"
			onClick={() => router.back()}
			className="click"
		/>
	);
};

export default GoBack;
