import Line from '@/types/Line';

class LineModel {
	constructor(
		public from?: number[] | null,
		public color?: string,
		public xSize?: number,
		public ySize?: number,
		public baseWidth?: number,
		public baseHeight?: number
	) {}
}

export default LineModel;
