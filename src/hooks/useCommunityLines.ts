import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/auth';
import { useToast } from '@/context/toast';
import {
	COMMUNITY_PAGE_SIZE,
	CommunitySortKey,
	DEFAULT_SORT,
	hasLikedLine,
	listCommunityLines,
	setLineLike,
} from '@/functions/communityLines';
import { CommunityLine } from '@/types/Account';

export const useCommunityLines = (
	search: string,
	sort: CommunitySortKey = DEFAULT_SORT
) => {
	const { loading: authLoading } = useAuth();

	const [lines, setLines] = useState<CommunityLine[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [failed, setFailed] = useState(false);
	const [hasMore, setHasMore] = useState(false);

	const page = useRef(0);
	const request = useRef(0);

	const load = useCallback(
		async (nextPage: number) => {
			const id = ++request.current;
			if (nextPage) setLoadingMore(true);
			else setLoading(true);
			setFailed(false);
			try {
				const rows = await listCommunityLines({ search, sort, page: nextPage });
				if (id !== request.current) return;
				page.current = nextPage;
				setHasMore(rows.length === COMMUNITY_PAGE_SIZE);
				setLines(prev => (nextPage ? [...prev, ...rows] : rows));
			} catch (error) {
				console.error('Failed to load the community lines:', error);
				if (id === request.current) setFailed(true);
			} finally {
				if (id === request.current) {
					setLoading(false);
					setLoadingMore(false);
				}
			}
		},
		[search, sort]
	);

	useEffect(() => {
		if (authLoading) return;
		load(0);
	}, [authLoading, load]);

	const loadMore = useCallback(() => {
		if (loading || loadingMore || !hasMore) return;
		load(page.current + 1);
	}, [hasMore, load, loading, loadingMore]);

	return {
		lines,
		loading: loading || authLoading,
		loadingMore,
		failed,
		hasMore,
		loadMore,
	};
};

export const useLineLike = (lineId?: string, initialCount: number = 0) => {
	const { user } = useAuth();
	const { addToast } = useToast();

	const [count, setCount] = useState(initialCount);
	const [liked, setLiked] = useState(false);
	const [saving, setSaving] = useState(false);

	useEffect(() => setCount(initialCount), [initialCount]);

	useEffect(() => {
		if (!lineId || !user) {
			setLiked(false);
			return;
		}
		let active = true;
		hasLikedLine(lineId, user.id)
			.then(found => {
				if (active) setLiked(found);
			})
			.catch(error => console.error('Failed to load the like:', error));
		return () => {
			active = false;
		};
	}, [lineId, user]);

	const toggle = useCallback(async () => {
		if (!lineId) return;
		if (!user) {
			addToast('Sign in to like a line', 'warning');
			return;
		}
		const next = !liked;
		setLiked(next);
		setCount(prev => Math.max(0, prev + (next ? 1 : -1)));
		setSaving(true);
		try {
			await setLineLike(lineId, user.id, next);
		} catch (error) {
			console.error('Failed to change the like:', error);
			setLiked(!next);
			setCount(prev => Math.max(0, prev + (next ? -1 : 1)));
			addToast('Failed to register your like', 'danger');
		} finally {
			setSaving(false);
		}
	}, [addToast, liked, lineId, user]);

	return { count, liked, saving, toggle };
};

export default useCommunityLines;
