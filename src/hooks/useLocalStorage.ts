import { objectCompare } from '@/functions';
import Line from '@/types/Line';
import { useEffect, useRef } from 'react';

interface Return {
	getStoredItem: CallableFunction;
	setItemToStorage: CallableFunction;
}
const useLocalStorage = (
	key: string,
	item: any,
	setItem: CallableFunction,
	defaultItem: any = item
): Return => {
	useEffect(() => {
		// don't get stored value if first item is not the default one
		if (item !== defaultItem) {
			const storedItem = getStoredItem();
			if (storedItem) {
				setItem(storedItem);
			}
		}
	}, []);

	useEffect(() => {
		if (item && item !== defaultItem) {
			setItemToStorage(item);
		} else {
			localStorage.removeItem(key);
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
