import { useToast } from '@/context/toast';
import { DigimonList } from './useSubmitDigimon';

const useDeleteDigimon = (
	setList: React.Dispatch<React.SetStateAction<DigimonList>>
) => {
	const { addToast } = useToast();

	const deleteDigimon = async (level: string, name: string): Promise<boolean> => {
		try {
			const response = await fetch('/api/delete-digimon', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ level, name }),
			});
			const data = await response.json();

			if (!response.ok) {
				addToast(data.error || 'Failed to delete Digimon', 'danger');
				return false;
			}

			setList(prev => {
				const updated = { ...prev };
				if (updated[level]) {
					const nextLevel = { ...updated[level] };
					delete nextLevel[name];
					if (Object.keys(nextLevel).length === 0) {
						delete updated[level];
					} else {
						updated[level] = nextLevel;
					}
				}
				return updated;
			});

			addToast(`"${name}" removed from "${level}"`);
			return true;
		} catch (error) {
			console.error('Failed to delete digimon:', error);
			addToast('Failed to delete Digimon', 'danger');
			return false;
		}
	};

	return deleteDigimon;
};

export default useDeleteDigimon;
