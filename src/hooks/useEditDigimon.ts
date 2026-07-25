import { Digimon, DigimonItem } from '@/types/Digimon';
import { useToast } from '@/context/toast';

// Editing helpers decoupled from any list state, so the image modal can persist
// relation (ranked.json) and data (index.json) changes from any page in dev.
const useEditDigimon = () => {
	const { addToast } = useToast();

	const submitItem = async (
		level: string,
		item: DigimonItem,
		originalName?: string,
		originalLevel?: string
	): Promise<boolean> => {
		// No originalName -> the digimon has no ranked entry yet: create it.
		const isEdit = !!originalName;
		const endpoint = isEdit ? '/api/update-digimon' : '/api/add-digimon';
		const body =
			isEdit ?
				{ level, digimon: item, originalName, originalLevel: originalLevel || level }
			:	{ level, digimon: item };
		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			const data = await response.json();
			if (!response.ok) {
				addToast(data.error || 'Failed to save relations', 'danger');
				return false;
			}
			addToast(`Relations of "${item.name}" ${isEdit ? 'updated' : 'added'}`);
			return true;
		} catch (error) {
			console.error('Failed to save relations:', error);
			addToast('Failed to save relations', 'danger');
			return false;
		}
	};

	const submitData = async (name: string, digimon: Digimon): Promise<boolean> => {
		try {
			const response = await fetch('/api/update-digimon-data', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, digimon }),
			});
			const data = await response.json();
			if (!response.ok) {
				addToast(data.error || 'Failed to save data', 'danger');
				return false;
			}
			addToast(`Data of "${name}" updated`);
			return true;
		} catch (error) {
			console.error('Failed to save data:', error);
			addToast('Failed to save data', 'danger');
			return false;
		}
	};

	return { submitItem, submitData };
};

export default useEditDigimon;
