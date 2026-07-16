import { useEffect } from 'react';

const EDGE = 70; // distance from an edge (px) where auto-scroll kicks in
const MAX_SPEED = 22; // max scroll step per frame (px)

type Axis = 'x' | 'y';

const isScrollable = (el: HTMLElement, axis: Axis): boolean => {
	const style = getComputedStyle(el);
	const overflow = axis === 'x' ? style.overflowX : style.overflowY;
	if (!/(auto|scroll)/.test(overflow)) return false;
	return axis === 'x'
		? el.scrollWidth > el.clientWidth
		: el.scrollHeight > el.clientHeight;
};

const findScrollable = (el: Element | null, axis: Axis): HTMLElement | null => {
	let node = el as HTMLElement | null;
	while (node && node !== document.body && node !== document.documentElement) {
		if (isScrollable(node, axis)) return node;
		node = node.parentElement;
	}
	return null; // fall back to the window
};

const edgeDelta = (pos: number, start: number, end: number): number => {
	const intensity = (dist: number) => Math.max(0, Math.min(1, (EDGE - dist) / EDGE));
	if (pos < start + EDGE) return -MAX_SPEED * intensity(pos - start);
	if (pos > end - EDGE) return MAX_SPEED * intensity(end - pos);
	return 0;
};

/**
 * While an HTML5 drag is in progress, scrolls the nearest scrollable ancestor
 * (or the window) when the cursor gets close to an edge, on both axes.
 */
const useDragAutoScroll = () => {
	useEffect(() => {
		let active = false;
		let raf = 0;
		const pointer = { x: 0, y: 0 };

		const scrollAxis = (axis: Axis) => {
			const under = document.elementFromPoint(pointer.x, pointer.y);
			const scroller = findScrollable(under, axis);
			const pos = axis === 'x' ? pointer.x : pointer.y;

			if (scroller) {
				const rect = scroller.getBoundingClientRect();
				const start = axis === 'x' ? rect.left : rect.top;
				const end = axis === 'x' ? rect.right : rect.bottom;
				const delta = edgeDelta(pos, start, end);
				if (delta) {
					if (axis === 'x') scroller.scrollLeft += delta;
					else scroller.scrollTop += delta;
				}
			} else {
				const size = axis === 'x' ? window.innerWidth : window.innerHeight;
				const delta = edgeDelta(pos, 0, size);
				if (delta) window.scrollBy(axis === 'x' ? delta : 0, axis === 'y' ? delta : 0);
			}
		};

		const tick = () => {
			if (!active) return;
			scrollAxis('y');
			scrollAxis('x');
			raf = requestAnimationFrame(tick);
		};

		const onDragStart = () => {
			if (active) return;
			active = true;
			raf = requestAnimationFrame(tick);
		};

		const onDragOver = (e: DragEvent) => {
			pointer.x = e.clientX;
			pointer.y = e.clientY;
		};

		const stop = () => {
			active = false;
			cancelAnimationFrame(raf);
		};

		document.addEventListener('dragstart', onDragStart);
		document.addEventListener('dragover', onDragOver);
		document.addEventListener('dragend', stop);
		document.addEventListener('drop', stop);
		return () => {
			stop();
			document.removeEventListener('dragstart', onDragStart);
			document.removeEventListener('dragover', onDragOver);
			document.removeEventListener('dragend', stop);
			document.removeEventListener('drop', stop);
		};
	}, []);
};

export default useDragAutoScroll;
