import Line from '@/types/Line';
import { useEffect, useRef } from 'react';

interface Return {
	getStoredItem: CallableFunction;
	setItemToStorage: CallableFunction;
}
const useLocalStorage = (key: string, item: any, setItem: CallableFunction): Return => {
	const mount = useRef<Line | null>(null);

	useEffect(() => {
		if (!mount.current) {
			mount.current = item;
			const storedItem = getStoredItem();
			if (storedItem) {
				setItem(storedItem);
			}
		}
	}, []);

	useEffect(() => {
		// don't save default value
		if (item && item !== mount.current) {
			console.log('mounted', item);
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
