// modules
import React from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router';
// components
import Icon from '../Icon';

interface Props {
	clearError: Function;
}
const PageError: React.FC<Props> = ({ clearError }) => {
	const navigate = useNavigate();

	const handleGoBack = () => {
		clearError();
		navigate(-1);
	};

	return (
		<Container>
			<h1>Une erreur est survenue</h1>
			<p>
				Nous sommes désolé pour le désagrément, une erreur est venue corrompre
				l'interface.
				<br /> Nous faisons notre maximum pour la corriger au plus vite.
			</p>
			<Button variant="primary" onClick={handleGoBack}>
				<Icon name="arrow-down-circle-fill" /> Revenir en lieu sûr
			</Button>
		</Container>
	);
};
export default PageError;
