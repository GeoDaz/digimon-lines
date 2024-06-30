import { objectCompare } from '@/functions';
import Line from '@/types/Line';
import { useEffect, useRef } from 'react';

interface Return {
	getStoredItem: CallableFunction;
	setItemToStorage: CallableFunction;
}
interface Props {
	key: string;
	item: any;
	defaultItem: any;
	setItem: CallableFunction;
	locked?: boolean;
}
const useLocalStorage = ({
	key,
	item,
	setItem,
	defaultItem,
	locked = false,
}: Props): Return => {
	useEffect(() => {
		// don't get stored value if first item is not the default one
		if (!locked && item === defaultItem) {
			const storedItem = getStoredItem();
			if (storedItem) {
				setItem(storedItem);
			}
		}
	}, []);

	useEffect(() => {
		if (!locked && item && item !== defaultItem) {
			setItemToStorage(item);
		}
	}, [item]);

	const getStoredItem = () => {
		try {
			let item = localStorage.getItem(key);
			if (!item) return null;
			return JSON.parse(item);
		} catch (error) {
			console.error(error);
			return null;
		}
	};

	const setItemToStorage = (value: any) => {
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.error(error);
		}
	};

	return { getStoredItem, setItemToStorage };
};

export default useLocalStorage;
