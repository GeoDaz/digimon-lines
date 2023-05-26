import { useCallback, useState } from 'react';

const useFetch = (callback: Function): any[] => {
	const [loading, setLoading] = useState(false);

	const load: Function = useCallback(
		(url: string, params: object | undefined) => {
			setLoading(true);
			fetch(url, params)
				.then(res => res.json())
				.then(res => {
					callback(res);
					setLoading(false);
				})
				.catch(error => {
					console.error(error);
					callback(undefined);
					setLoading(false);
				});
		},
		[callback]
	);

	return [load, loading];
};
export default useFetch;
