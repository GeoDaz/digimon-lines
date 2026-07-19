import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Icon from './Icon';

const ScrollUp = () => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const toggleVisibility = () => {
			setIsVisible(window.scrollY > window.innerHeight);
		};

		window.addEventListener('scroll', toggleVisibility);

		return () => window.removeEventListener('scroll', toggleVisibility);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	return (
		<Button
			variant="primary"
			onClick={isVisible ? scrollToTop : undefined}
			title="Back to top"
			className={`btn-scroll-up ${isVisible ? 'fade-in' : 'fade-out'}`}
		>
			<Icon name="chevron-up" />
		</Button>
	);
};

export default ScrollUp;
