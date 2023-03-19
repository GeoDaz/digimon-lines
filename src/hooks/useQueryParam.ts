import { useRouter } from 'next/router';

const useQueryParam = (
	key: string,
	ssr: { [key: string]: string | undefined }
): string | undefined => {
	const query = useRouter().query;
	const param = query[key];
	const name = Array.isArray(param) ? param.join() : param || ssr[key];

	return name;
};
export default useQueryParam;
