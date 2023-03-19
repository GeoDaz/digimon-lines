import { useRouter } from 'next/router';

const useQueryParam = (key: string): string | undefined => {
	const query = useRouter().query;
	const param = query[key];
	const name = Array.isArray(param) ? param.join() : param;

	return name;
};
export default useQueryParam;
