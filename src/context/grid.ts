import { createContext, DragEvent } from 'react';
import { LineAnchor } from '@/types/Line';

export interface GridContextInterface {
	drawing?: number[];
	anchor?: LineAnchor;
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
