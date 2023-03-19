import { useRouter } from 'next/router';

const useQueryParam = (
	key: string,
	ssr: { [key: string]: string | undefined }
): string | undefined => {
	const query = useRouter().query;
	// there is no ts error here
	const name =
		query[key] && Array.isArray(query[key])
			? query[key].join()
			: query[key] || ssr[key];

	return name;
};
export default useQueryParam;
