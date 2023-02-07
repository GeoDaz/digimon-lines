import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

const GoBack: React.FC = () => {
	const navigate = useNavigate();
	const handleGoBack = () => navigate(-1);

	return <Icon name="arrow-left-circle-fill" onClick={handleGoBack} className="click" />;
};

export default GoBack;
