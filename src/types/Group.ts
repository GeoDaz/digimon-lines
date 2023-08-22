export interface Group {
	title?: string;
	// main: Array<GroupPoint>|Record<string, GroupPoint[]>;
	main: GroupPoint[];
	related?: GroupPoint[];
	notes?: string[];
}

export interface GroupPoint {
	name: string;
	line?: string;
	skin?: string;
}

export default Group;
