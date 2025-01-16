import { createContext } from 'react';
import Search from '@/types/Search';

export const SearchContext = createContext<Search | undefined>({
	mapped: {},
	values: [],
	keys: [],
});
