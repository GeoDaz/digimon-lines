import { DigimonItem } from '@/types/Digimon';
import { useToast } from '@/context/toast';

export interface DigimonList {
	[key: string]: { [key: string]: DigimonItem };
}

const useSubmitDigimon = (setList: React.Dispatch<React.SetStateAction<DigimonList>>) => {
	const { addToast } = useToast();

	const submitDigimon = async (level: string, item: DigimonItem, originalName?: string) => {
		const isEdit = !!originalName;
		const endpoint = isEdit ? '/api/update-digimon' : '/api/add-digimon';
		const body = isEdit
			? { level, digimon: item, originalName }
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
				if (isEdit && originalName !== item.name && updated[level]) {
					delete updated[level][originalName];
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
