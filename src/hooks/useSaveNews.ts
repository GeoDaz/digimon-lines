import { useToast } from '@/context/toast';
import { LineThumb } from '@/types/Line';

// _news.json holds plain names, or objects when the entry has a grid.
const toNewsItem = (thumb: LineThumb) =>
	thumb.grid?.length ? { name: thumb.name, grid: thumb.grid } : thumb.name;

const useSaveNews = (setNews: React.Dispatch<React.SetStateAction<LineThumb[]>>) => {
	const { addToast } = useToast();

	const saveNews = async (news: LineThumb[]) => {
		// Optimistic update, rolled back if the write fails.
		let previous: LineThumb[] | null = null;
		setNews(prev => {
			previous = prev;
			return news;
		});

		try {
			const response = await fetch('/api/save-news', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ news: news.map(toNewsItem) }),
			});
			const data = await response.json();

			if (!response.ok) {
				if (previous) setNews(previous);
				addToast(data.error || 'Failed to save the news', 'danger');
				return;
			}

			// The API knows which lines actually exist.
			if (Array.isArray(data.news)) setNews(data.news);
			addToast('News saved');
		} catch (error) {
			console.error('Failed to save news:', error);
			if (previous) setNews(previous);
			addToast('Failed to save the news', 'danger');
		}
	};

	return saveNews;
};

export default useSaveNews;
