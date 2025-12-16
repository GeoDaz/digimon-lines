import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const getHash = () =>
	typeof window !== 'undefined'
		? decodeURIComponent(window.location.hash.replace('#', ''))
		: undefined;

const useHash = () => {
	const [hash, setHash] = useState<string | undefined>();
	const params = useParams();

	useEffect(() => {
		setHash(getHash());
	}, [params]);

	return hash;
};

export default useHash;

