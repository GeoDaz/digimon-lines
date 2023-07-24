import { useRouter } from 'next/router';

const useQueryParam = (...args: string[]): Record<string, string> => {
	const { query, asPath } = useRouter();
	let urlParams: URLSearchParams | null = null;
	const params = asPath.split('?')?.[1];
	if (params) {
		urlParams = new URLSearchParams(params);
	}
	return args.reduce((acc, key) => {
		const param = query[key] || (urlParams && urlParams.get(key));
		if (param) {
			acc[key] = Array.isArray(param) ? param.join() : param;
		}
		return acc;
	}, {} as Record<string, string>);
};

export const addQueryParam = (key: string, value: string) => {
	const urlParams = new URLSearchParams(window.location.search);
	urlParams.set(key, value);
	window.history.pushState(null, '', urlParams.toString());
};

export const removeQueryParam = (key: string) => {
	const urlParams = new URLSearchParams(window.location.search);
	urlParams.delete(key);
	console.log(urlParams);
	window.history.pushState(null, '', urlParams.toString());
};

export default useQueryParam;
