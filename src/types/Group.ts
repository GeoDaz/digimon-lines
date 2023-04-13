export interface Group {
	title?: string;
	main: Array<GroupPoint>;
	related?: Array<GroupPoint>;
	notes?: Array<string>;
}

export interface GroupPoint {
	name: string;
	line?: string;
}

export default Group;
