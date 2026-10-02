import { Line } from '@/types/Line';

export interface Group {
	title?: string;
	main: GroupPoint[] | { [key: string]: Array<GroupPoint | null> };
	related?: GroupPoint[];
	grid?: Line;
	notes?: string[];
	type?: string;
}

export interface GroupPoint {
	name: string;
	line?: string;
	redirect?: string;
	skin?: string;
}

export default Group;
