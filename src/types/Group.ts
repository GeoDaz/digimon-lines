export interface Group {
	title?: string;
	main: GroupPoint[] | { [key: string]: Array<GroupPoint | null> };
	related?: GroupPoint[];
	notes?: string[];
	type?: string;
}

export interface GroupPoint {
	name: string;
	line?: string;
	skin?: string;
}

export default Group;
