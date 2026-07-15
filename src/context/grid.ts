import { createContext, DragEvent } from 'react';

export interface GridContextInterface {
	drawing?: number[];
	handleUpdate?: CallableFunction;
	handleEdit?: CallableFunction;
	handleDraw?: CallableFunction;
	handleTarget?: CallableFunction;
	handleXCollapse?: CallableFunction;
	handleYCollapse?: CallableFunction;
	handleDragStart?: (coord: number[]) => void;
	handleDragEnd?: () => void;
	handleDragOver?: (e: DragEvent) => void;
	handleDrop?: (coord: number[]) => void;
}

export const GridContext = createContext<GridContextInterface>({});
