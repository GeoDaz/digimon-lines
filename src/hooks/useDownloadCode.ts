import { copyToClipboard } from '@/functions';
import { createFile, downloadFile } from '@/functions/file';
import { transformLine, prepareLineExport } from '@/functions/line';
import { defaultLine } from '@/reducers/lineReducer';
import { useToast } from '@/context/toast';
import Line from '@/types/Line';
import { useState } from 'react';
import { IS_DEV } from '@/consts/env';

const useDownloadCode = (line: Line, setLine: (line: Line) => void) => {
	const [name, setName] = useState<string | undefined>();
	const { addToast } = useToast();

	const downloadCode = async () => {
		const exportedLine = prepareLineExport(line);
		const json = JSON.stringify(exportedLine);
		copyToClipboard(json);
		const file = createFile(json, 'application/json');

		if (IS_DEV && name) {
			try {
				const response = await fetch('/api/save-line', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name, line: exportedLine }),
				});
				const data = await response.json();
				if (response.ok) {
					addToast(
						data.created
							? `Line "${data.name}" created successfully`
							: `Line "${data.name}" updated successfully`
					);
				} else {
					addToast(data.error || 'Failed to save line', 'danger');
				}
			} catch (error) {
				console.error('Failed to save line to file:', error);
				addToast('Failed to save line to file', 'danger');
			}
		} else {
			downloadFile(file, (name || 'line') + '.json');
			addToast('Copied to clipboard');
		}
	};

	const uploadCode = (name: string, json: Line | null) => {
		setName(name);
		setLine(json ? (transformLine(json) as Line) : defaultLine);
	};

	return { downloadCode, uploadCode, name, setName };
};

export default useDownloadCode;
