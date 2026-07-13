import { DigimonList } from '@/hooks/useSubmitDigimon';
import { useToast } from '@/context/toast';

const useReorderDigimon = (
	setList: React.Dispatch<React.SetStateAction<DigimonList>>
) => {
	const { addToast } = useToast();

	const reorderDigimon = async (level: string, order: string[]) => {
		// Optimistic update: rebuild the level following the new order.
		let previous: DigimonList | null = null;
		setList(prev => {
			previous = prev;
			const currentLevel = prev[level];
			if (!currentLevel) return prev;

			const reordered = order.reduce((acc, name) => {
				if (currentLevel[name]) acc[name] = currentLevel[name];
				return acc;
			}, {} as DigimonList[string]);

			// Preserve any digimon missing from the order.
			for (const name of Object.keys(currentLevel)) {
				if (!reordered[name]) reordered[name] = currentLevel[name];
			}

			return { ...prev, [level]: reordered };
		});

		try {
			const response = await fetch('/api/reorder-digimon', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ level, order }),
			});
			const data = await response.json();

			if (!response.ok) {
				if (previous) setList(previous);
				addToast(data.error || 'Failed to reorder Digimons', 'danger');
				return;
			}

			addToast(`Order saved in "${level}"`);
		} catch (error) {
			console.error('Failed to reorder digimons:', error);
			if (previous) setList(previous);
			addToast('Failed to reorder Digimons', 'danger');
		}
	};

	return reorderDigimon;
};

export default useReorderDigimon;
