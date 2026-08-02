import { useToast } from '@/context/toast';
import Group from '@/types/Group';

const useSaveGroup = (
	name: string,
	setGroup: React.Dispatch<React.SetStateAction<Group | undefined>>
) => {
	const { addToast } = useToast();

	const saveGroup = async (group: Group) => {
		// Optimistic update, rolled back if the write fails.
		let previous: Group | undefined;
		setGroup(prev => {
			previous = prev;
			return group;
		});

		try {
			const response = await fetch('/api/save-group', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, group }),
			});
			const data = await response.json();

			if (!response.ok) {
				setGroup(previous);
				addToast(data.error || 'Failed to save the group', 'danger');
				return;
			}

			addToast('Group saved');
		} catch (error) {
			console.error('Failed to save group:', error);
			setGroup(previous);
			addToast('Failed to save the group', 'danger');
		}
	};

	return saveGroup;
};

export default useSaveGroup;
