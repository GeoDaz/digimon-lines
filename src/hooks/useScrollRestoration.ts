import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

// Scroll to top after each route change
const useScrollRestoration = () => {
	const { pathname } = useLocation();
	const params = useParams();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname, params]);
};
export default useScrollRestoration;
