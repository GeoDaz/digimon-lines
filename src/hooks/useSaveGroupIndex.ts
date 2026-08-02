import { useToast } from '@/context/toast';
import { LineThumb } from '@/types/Line';

const useSaveGroupIndex = (
	setGroups: React.Dispatch<React.SetStateAction<LineThumb[]>>
) => {
	const { addToast } = useToast();

	const saveGroups = async (groups: LineThumb[]) => {
		// Optimistic update, rolled back if the write fails.
		let previous: LineThumb[] | null = null;
		setGroups(prev => {
			previous = prev;
			return groups;
		});

		try {
			const response = await fetch('/api/save-group-index', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ groups: groups.map(group => group.name) }),
			});
			const data = await response.json();

			if (!response.ok) {
				if (previous) setGroups(previous);
				addToast(data.error || 'Failed to save the groups', 'danger');
				return;
			}

			// The API knows which groups actually exist.
			if (Array.isArray(data.groups)) setGroups(data.groups);
			addToast('Groups saved');
		} catch (error) {
			console.error('Failed to save groups:', error);
			if (previous) setGroups(previous);
			addToast('Failed to save the groups', 'danger');
		}
	};

	return saveGroups;
};

export default useSaveGroupIndex;
