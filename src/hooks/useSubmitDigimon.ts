import { DigimonItem } from '@/types/Digimon';
import { useToast } from '@/context/toast';

export interface DigimonList {
	[key: string]: { [key: string]: DigimonItem };
}

const useSubmitDigimon = (setList: React.Dispatch<React.SetStateAction<DigimonList>>) => {
	const { addToast } = useToast();

	const submitDigimon = async (
		level: string,
		item: DigimonItem,
		originalName?: string,
		originalLevel?: string
	) => {
		const isEdit = !!originalName;
		const srcLevel = originalLevel || level;
		const endpoint = isEdit ? '/api/update-digimon' : '/api/add-digimon';
		const body = isEdit
			? { level, digimon: item, originalName, originalLevel: srcLevel }
			: { level, digimon: item };
		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			const data = await response.json();

			if (!response.ok) {
				addToast(data.error || 'Failed to save Digimon', 'danger');
				return;
			}

			setList(prev => {
				const updated = { ...prev };
				const movingLevel = srcLevel !== level;
				const renaming = originalName !== item.name;
				if (isEdit && (movingLevel || renaming) && updated[srcLevel]) {
					const source = { ...updated[srcLevel] };
					delete source[originalName as string];
					if (movingLevel && Object.keys(source).length === 0) {
						delete updated[srcLevel];
					} else {
						updated[srcLevel] = source;
					}
				}
				updated[level] = { ...updated[level], [item.name]: item };
				return updated;
			});

			addToast(
				isEdit
					? `"${item.name}" updated in "${level}"`
					: `"${item.name}" added to "${level}"`
			);
		} catch (error) {
			console.error('Failed to save digimon:', error);
			addToast('Failed to save Digimon', 'danger');
		}
	};

	return submitDigimon;
};

export default useSubmitDigimon;
