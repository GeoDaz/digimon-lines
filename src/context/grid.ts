import { createContext, DragEvent } from 'react';
import { LineAnchor } from '@/types/Line';

export type ReorderAxis = 'column' | 'row';

export interface ReorderState {
	axis: ReorderAxis;
	from: number;
	over?: number;
}

export interface GridContextInterface {
	drawing?: number[];
	anchor?: LineAnchor;
	reorder?: ReorderState | null;
	handleUpdate?: CallableFunction;
	handleEdit?: CallableFunction;
	handleDraw?: CallableFunction;
	handleTarget?: CallableFunction;
	handleXCollapse?: CallableFunction;
	handleYCollapse?: CallableFunction;
	handleDragStart?: (e: DragEvent, coord: number[]) => void;
	handleDragEnd?: () => void;
	handleDragOver?: (e: DragEvent, coord: number[]) => void;
	handleDrop?: (e: DragEvent, coord: number[]) => void;
	handleAxisDragStart?: (e: DragEvent, axis: ReorderAxis, index: number) => void;
	handleAxisDragOver?: (e: DragEvent, axis: ReorderAxis, index: number) => void;
	handleAxisDrop?: (e: DragEvent, axis: ReorderAxis, index: number) => void;
}

export const GridContext = createContext<GridContextInterface>({});
