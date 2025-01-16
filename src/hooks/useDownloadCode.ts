import { createFile, download } from '@/functions/file';
import transformLine from '@/functions/line';
import { defaultLine } from '@/reducers/lineReducer';
import Line from '@/types/Line';
import { useState } from 'react';

const useDownloadCode = (line: Line, setLine: (line: Line) => void) => {
	const [name, setName] = useState<string | undefined>();

	const downloadCode = () => {
		const file = createFile(JSON.stringify(line), 'application/json');
		download(file, (name || 'line') + '.json');
	};
	const uploadCode = (name: string, json: Line | null) => {
		setName(name);
		setLine(json ? (transformLine(json) as Line) : defaultLine);
	};

	return { downloadCode, uploadCode, name, setName };
};

export default useDownloadCode;
