import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Router from 'next/router';
import { Alert, Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import Layout from '@/components/Layout';
import Icon from '@/components/Icon';
import LinePoint from '@/components/Line/LinePoint';
import LikeHeart from '@/components/Account/LikeHeart';
import { useCommunityLines } from '@/hooks/useCommunityLines';
import { useAuth } from '@/context/auth';
import useQueryParam from '@/hooks/useQueryParam';
import {
	COMMUNITY_SORTS,
	CommunitySortKey,
	DEFAULT_SORT,
	isCommunitySort,
} from '@/functions/communityLines';
import { CommunityLine } from '@/types/Account';

const SEARCH = 'search';
const SORT = 'sort';

const PageCommunity = () => {
	const params = useQueryParam(SEARCH, SORT);
	const search = params[SEARCH] || '';
	const sort: CommunitySortKey =
		isCommunitySort(params[SORT]) ? params[SORT] : DEFAULT_SORT;

	const { enabled } = useAuth();
	const { lines, loading, loadingMore, failed, hasMore, loadMore } = useCommunityLines(
		search,
		sort
	);

	const [draft, setDraft] = useState(search);
	useEffect(() => setDraft(search), [search]);

	const sentinel = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const node = sentinel.current;
		if (!node) return;
		const observer = new IntersectionObserver(
			entries => {
				if (entries[0]?.isIntersecting) loadMore();
			},
			{ rootMargin: '400px' }
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [loadMore]);

	const pushQuery = (next: { search?: string; sort?: CommunitySortKey }) => {
		const query: Record<string, string> = {};
		const nextSearch = next.search ?? search;
		const nextSort = next.sort ?? sort;
		if (nextSearch) query[SEARCH] = nextSearch;
		if (nextSort !== DEFAULT_SORT) query[SORT] = nextSort;
		Router.push({ pathname: '/community', query });
	};

	if (!enabled) {
		return (
			<Layout title="Community lines" metatitle="Community lines">
				<Alert variant="warning">
					Community lines are not available right now.
				</Alert>
			</Layout>
		);
	}

	return (
		<Layout
			title="Community lines"
			metatitle="Community lines"
			metadescription="Evolution lines built and published by the Digimon Lines community."
		>
			<blockquote className="blockquote">
				Every line here was built and published by a visitor.{' '}
				<Link href="/build" className="btn btn-primary px-2 py-1">
					Build your own
				</Link>{' '}
				and publish it from <Link href="/my-lines">My lines</Link>&nbsp;!
			</blockquote>
			<div className="d-flex flex-wrap gap-2 mb-3">
				<Form
					className="d-flex search"
					style={{ width: 300, maxWidth: '100%' }}
					onSubmit={event => {
						event.preventDefault();
						pushQuery({ search: draft.trim() });
					}}
				>
					<Form.Label htmlFor="community-search" visuallyHidden>
						Research a digimon or a title
					</Form.Label>
					<Form.Control
						type="search"
						id="community-search"
						className="research"
						placeholder="Research a digimon or a title"
						autoComplete="off"
						value={draft}
						onChange={event => {
							setDraft(event.target.value);
							if (!event.target.value && search) pushQuery({ search: '' });
						}}
					/>
					<Button variant="primary" type="submit" title="Search">
						<Icon name="search" />
					</Button>
				</Form>
				<Form.Label htmlFor="community-sort" visuallyHidden>
					Sort the lines
				</Form.Label>
				<Form.Select
					id="community-sort"
					className="width-auto"
					value={sort}
					onChange={event =>
						pushQuery({ sort: event.target.value as CommunitySortKey })
					}
				>
					{Object.entries(COMMUNITY_SORTS).map(([key, { label }]) => (
						<option key={key} value={key}>
							{label}
						</option>
					))}
				</Form.Select>
			</div>
			{loading ?
				<Spinner animation="border" role="status" aria-label="Loading" />
			: failed ?
				<Alert variant="danger">
					Something went wrong while loading the lines. Please try again.
				</Alert>
			: !lines.length ?
				<p className="text-muted">
					{search ?
						<>
							No line matches “{search}”. Try another Digimon, or a word of
							the title.
						</>
					:	<>
							No line has been published yet.{' '}
							<Link href="/build">Be the first one</Link>&nbsp;!
						</>
					}
				</p>
			:	<>
					<div className="line-wrapper">
						<Row className="line-row">
							{lines.map(line => (
								<CommunityCard key={line.id} line={line} />
							))}
						</Row>
					</div>
					{hasMore && (
						<div ref={sentinel} className="text-center my-3">
							{loadingMore && (
								<Spinner
									animation="border"
									size="sm"
									role="status"
									aria-label="Loading"
								/>
							)}
						</div>
					)}
				</>
			}
		</Layout>
	);
};

const CommunityCard = ({ line }: { line: CommunityLine }) => {
	const pseudo = line.profiles?.pseudo;
	const name = line.title || line.slug;
	const href = `/profile/${pseudo}/${line.slug}`;
	const caption = <span className="absolute-legend">{name}</span>;

	return (
		<Col className="profile-line">
			{
				line.cover ?
					<LinePoint name={line.cover} href={href} label={name} available>
						{caption}
					</LinePoint>
					// Ligne sans aucun point : pas d'image à montrer.
				:	<Link href={href} title={name} className="line-point pictured available">
						{caption}
					</Link>

			}
			<div className="profile-line-actions community-line-actions d-flex align-items-center justify-content-between gap-2 px-1">
				{!!pseudo && (
					<Link
						href={`/profile/${pseudo}`}
						className="community-author"
						title={`Lines by ${pseudo}`}
					>
						<Icon name="person-circle" /> {pseudo}
					</Link>
				)}
				<LikeHeart
					count={line.like_count}
					liked={line.liked}
					className="ms-auto"
				/>
			</div>
		</Col>
	);
};

export default PageCommunity;
