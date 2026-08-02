import React, { useRef, useState } from 'react';

/**
 * HTML5 drag and drop reordering of a list. Spread `dragProps(index)` on each
 * item container and give it the "reorderable" class.
 */
const useDragReorder = <T>(items: T[], onChange?: (items: T[]) => void) => {
	const dragIndex = useRef<number | null>(null);
	const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

	const stop = () => {
		dragIndex.current = null;
		setDraggingIndex(null);
	};

	const dragProps = (index: number) => ({
		draggable: true,
		onDragStart: (event: React.DragEvent) => {
			// Firefox only starts a drag when some data is set.
			event.dataTransfer.setData('text/plain', String(index));
			event.dataTransfer.effectAllowed = 'move';
			dragIndex.current = index;
			setDraggingIndex(index);
		},
		onDragEnd: stop,
		onDragOver: (event: React.DragEvent) => {
			if (dragIndex.current === null || dragIndex.current === index) return;
			event.preventDefault();
			event.dataTransfer.dropEffect = 'move';
		},
		onDrop: (event: React.DragEvent) => {
			event.preventDefault();
			const source = dragIndex.current;
			stop();
			if (source === null || source === index) return;

			// The moved item takes the place of the one it is dropped on.
			const next = items.slice();
			const [moved] = next.splice(source, 1);
			next.splice(index, 0, moved);
			onChange?.(next);
		},
	});

	return { dragProps, draggingIndex };
};

export default useDragReorder;
