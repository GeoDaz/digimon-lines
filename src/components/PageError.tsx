// modules
import React from 'react';
import { useRouter } from 'next/router';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
// components
import Icon from './Icon';

interface Props {
	clearError: Function;
}
const PageError: React.FC<Props> = ({ clearError }) => {
	const router = useRouter();

	const handleGoBack = () => {
		clearError();
		router.back();
	};

	return (
		<Container>
			<h1>An error occured</h1>
			<p>
				We are sorry for the inconvenience, an error occurred in the interface.
				<br /> We are doing our best to fix it as soon as possible.
			</p>
			<Button variant="primary" onClick={handleGoBack}>
				<Icon name="arrow-left-circle-fill" /> Return to safety
			</Button>
		</Container>
	);
};
export default PageError;
