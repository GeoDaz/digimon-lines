import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import { useToast } from '@/context/toast';
import { listLikedDeckIds, setDeckLike } from '@/functions/alysionDecks';

const useDeckLike = (deckId?: string, initialCount: number = 0, initialLiked?: boolean) => {
	const { user } = useAuth();
	const { addToast } = useToast();
	const [count, setCount] = useState(initialCount);
	const [liked, setLiked] = useState(!!initialLiked);
	const [saving, setSaving] = useState(false);

	useEffect(() => setCount(initialCount), [initialCount]);

	useEffect(() => {
		if (initialLiked !== undefined) {
			setLiked(initialLiked);
			return;
		}
		if (!deckId || !user) {
			setLiked(false);
			return;
		}
		let active = true;
		listLikedDeckIds(user.id, [deckId])
			.then(ids => active && setLiked(ids.includes(deckId)))
			.catch(error => console.error('Failed to load the like:', error));
		return () => {
			active = false;
		};
	}, [deckId, user, initialLiked]);

	const toggle = useCallback(async () => {
		if (!deckId || saving) return;
		if (!user) {
			addToast('Sign in to like a deck', 'warning');
			return;
		}
		const next = !liked;
		setLiked(next);
		setCount(prev => Math.max(0, prev + (next ? 1 : -1)));
		setSaving(true);
		try {
			await setDeckLike(deckId, user.id, next);
		} catch (error) {
			console.error('Failed to change the like:', error);
			setLiked(!next);
			setCount(prev => Math.max(0, prev + (next ? -1 : 1)));
			addToast('Failed to register your like', 'danger');
		} finally {
			setSaving(false);
		}
	}, [addToast, deckId, liked, saving, user]);

	return { count, liked, toggle };
};

export default useDeckLike;
