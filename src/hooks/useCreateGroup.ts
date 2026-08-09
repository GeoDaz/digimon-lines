import { useToast } from '@/context/toast';

const readAsDataUrl = (file: File): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});

/**
 * Creates the json file of a group, so a group added to the index is directly
 * editable, and its illustration when one is given. An already existing json
 * file is kept untouched.
 */
const useCreateGroup = () => {
	const { addToast } = useToast();

	const createGroup = async (
		name: string,
		title?: string,
		image?: File
	): Promise<boolean> => {
		try {
			const response = await fetch('/api/create-group', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name,
					title,
					image: image ? await readAsDataUrl(image) : undefined,
				}),
			});
			const data = await response.json();

			if (!response.ok) {
				addToast(data.error || 'Failed to create the group file', 'danger');
				// The image alone failed : the group itself can still be listed.
				return !!data.name;
			}

			if (data.image == 'replaced') {
				addToast(`The image of ${name} has been replaced`, 'warning');
			}
			return true;
		} catch (error) {
			console.error('Failed to create group:', error);
			addToast('Failed to create the group file', 'danger');
			return false;
		}
	};

	return createGroup;
};

export default useCreateGroup;
