import { createContext } from 'react';

export interface GridContextInterface {
	drawing?: number[];
	handleUpdate?: CallableFunction;
	handleEdit?: CallableFunction;
	handleDraw?: CallableFunction;
	handleTarget?: CallableFunction;
	handleCollapse?: CallableFunction;
}

export const GridContext = createContext<GridContextInterface>({});
