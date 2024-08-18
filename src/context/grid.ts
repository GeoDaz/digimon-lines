import { createContext } from 'react';

export interface GridContextInterface {
	drawing?: number[];
	handleUpdate?: CallableFunction;
	handleEdit?: CallableFunction;
	handleDraw?: CallableFunction;
	handleTarget?: CallableFunction;
	handleXCollapse?: CallableFunction;
	handleYCollapse?: CallableFunction;
}

export const GridContext = createContext<GridContextInterface>({});
