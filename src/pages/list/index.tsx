import Layout from '@/components/Layout';
import ListItem from '@/components/List/ListItem';
import DigimonModal, { EditData } from '@/components/List/AddDigimonModal';
import LevelFilter from '@/components/List/LevelFilter';
import SearchBar from '@/components/SearchBar';
import { makeClassName, stringToKey } from '@/functions';
import useHash from '@/hooks/useHash';
import useSubmitDigimon, { DigimonList } from '@/hooks/useSubmitDigimon';
import useDeleteDigimon from '@/hooks/useDeleteDigimon';
import useReorderDigimon from '@/hooks/useReorderDigimon';
import useDragAutoScroll from '@/hooks/useDragAutoScroll';
import { Digimon, DigimonItem } from '@/types/Digimon';
import { StringObject } from '@/types/Ui';
import Search from '@/types/Search';
import { DigimonProvider } from '@/context/digimon';
import { SearchContext } from '@/context/search';
import { GetStaticProps } from 'next';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import Icon from '@/components/Icon';
import { getDirPaths } from '@/functions/file';
import { getDubNames, getDubbedSearchList } from '@/functions/search';
import { IS_DEV } from '@/consts/env';
import { useRouter } from 'next/router';

const defaultObject: any = {};

// Number of cards mounted per "page". The list can hold >1300 entries, each card
// mounting many relation images, so we render incrementally on scroll.
const PAGE_SIZE = 60;

interface Props {
	list?: DigimonList;
	digimons?: { [key: string]: Digimon };
	dubNames?: StringObject;
	search?: Search;
}
const PageList: React.FC<Props> = props => {
	const [fullList, setFullList] = useState<DigimonList>(props.list || defaultObject);
	const handleSubmitDigimon = useSubmitDigimon(setFullList);
	const handleDeleteDigimon = useDeleteDigimon(setFullList);
	const handleReorderDigimon = useReorderDigimon(setFullList);
	const [search, setSearch] = useState<string>();
	const [levelFilter, setLevelFilter] = useState<string>('');
	const [showModal, setShowModal] = useState(false);
	const [editData, setEditData] = useState<EditData | null>(null);
	const dragRef = useRef<{ level: string; name: string } | null>(null);
	const [draggingName, setDraggingName] = useState<string | null>(null);
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
	const sentinelRef = useRef<HTMLDivElement | null>(null);
	const scrolledHashRef = useRef<string | null>(null);
	const router = useRouter();
	const hash = useHash();

	useDragAutoScroll();

	// Drag & drop reordering is only enabled in dev and when not filtering.
	const canReorder = IS_DEV && !search;

	const levels = useMemo(() => Object.keys(fullList), [fullList]);

	const list = useMemo<DigimonList>(() => {
		if (!search && !levelFilter) return fullList;
		return Object.entries(fullList).reduce((acc, [level, levels]) => {
			if (levelFilter && level !== levelFilter) return acc;

			const nextLevel =
				search ?
					Object.entries(levels).reduce(
						(acc, [key, value]) => {
							if (key.includes(search)) {
								acc[key] = value;
							}
							return acc;
						},
						{} as { [key: string]: DigimonItem }
					)
				:	levels;

			if (Object.keys(nextLevel).length > 0) {
				acc[level] = nextLevel;
			}
			return acc;
		}, {} as DigimonList);
	}, [fullList, search, levelFilter]);

	// Flat render order of names (across levels), used for pagination + hash jumps.
	const flatNames = useMemo(
		() => Object.values(list).flatMap(digimons => Object.keys(digimons)),
		[list]
	);
	const totalCount = flatNames.length;

	// Reset pagination whenever the visible list changes (search / filter / edits).
	useEffect(() => {
		setVisibleCount(PAGE_SIZE);
	}, [search, levelFilter]);

	// Load more cards as the bottom sentinel approaches the viewport.
	useEffect(() => {
		const el = sentinelRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting) {
					setVisibleCount(v => Math.min(v + PAGE_SIZE, totalCount));
				}
			},
			{ rootMargin: '600px' }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [totalCount, visibleCount]);

	// Deep-link via hash (e.g. clicking a relation): make sure the target card is
	// mounted before scrolling to it. Only scroll when the hash itself changes —
	// not when the list mutates (e.g. submitting the add/edit modal).
	useEffect(() => {
		if (!hash) {
			scrolledHashRef.current = null;
			return;
		}
		if (scrolledHashRef.current === hash) return;
		let idx = flatNames.indexOf(hash);
		if (idx < 0 && props.dubNames?.[hash]) {
			idx = flatNames.indexOf(props.dubNames[hash]);
		}
		if (idx >= 0 && idx >= visibleCount) {
			setVisibleCount(Math.min(idx + PAGE_SIZE, totalCount));
			return; // re-runs once visibleCount grows, then scrolls below
		}
		const target = document.getElementById(hash);
		if (target) {
			target.scrollIntoView({ behavior: 'smooth' });
			scrolledHashRef.current = hash;
		}
	}, [hash, flatNames, visibleCount, totalCount, props.dubNames]);

	const handleDragStart = (level: string, name: string) => {
		dragRef.current = { level, name };
		setDraggingName(name);
	};

	const handleDragEnd = () => {
		dragRef.current = null;
		setDraggingName(null);
	};

	const handleDragOver = (event: React.DragEvent, level: string, name: string) => {
		const source = dragRef.current;
		// Only allow dropping onto another item of the same level.
		if (!source || source.level !== level || source.name === name) return;
		event.preventDefault();
	};

	const handleDrop = (level: string, targetName: string) => {
		const source = dragRef.current;
		if (!source || source.level !== level || source.name === targetName) return;

		const names = Object.keys(fullList[level] || {});
		const fromIndex = names.indexOf(source.name);
		if (fromIndex === -1) return;

		names.splice(fromIndex, 1);
		const targetIndex = names.indexOf(targetName);
		names.splice(targetIndex, 0, source.name);

		handleReorderDigimon(level, names);
	};

	const handleSearch = (value: string) => {
		let sanitizedSearch = stringToKey(value);
		if (sanitizedSearch == search) return;
		if (sanitizedSearch.length < 3) {
			sanitizedSearch = '';
		}
		setSearch(sanitizedSearch);
	};

	const handleEditDigimon = (level: string, digimon: DigimonItem) => {
		setEditData({ level, digimon });
		setShowModal(true);
		const hash = digimon.name;
		scrolledHashRef.current = hash;

		router
			.replace(
				// or push or whatever you want
				{
					pathname: window.location.pathname,
					hash,
					query: window.location.search,
				},
				undefined,
				{
					shallow: true,
				}
			)
			.catch(e => {
				// workaround for https://github.com/vercel/next.js/issues/37362
				if (!e.cancelled) {
					throw e;
				}
			});
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditData(null);
	};

	const handleOpenAddModal = () => {
		setEditData(null);
		setShowModal(true);
	};

	return (
		<Layout
			noGoBack
			title="Digimon by levels"
			metadescription="List of Digimon by levels"
		>
			<SearchContext.Provider value={props.search}>
				<DigimonProvider dubNames={props.dubNames} data={props.digimons}>
					<div className="d-flex gap-3 align-items-center">
						<SearchBar
							label="Research a digimon"
							onSubmit={handleSearch}
							defaultValue={search}
							width={300}
						/>
						<LevelFilter
							levels={levels}
							value={levelFilter}
							onChange={setLevelFilter}
						/>
						{IS_DEV && (
							<Button
								variant="primary"
								className="mb-3"
								onClick={handleOpenAddModal}
							>
								<Icon name="plus" /> Add a Digimon
							</Button>
						)}
					</div>
					{(() => {
						let shown = 0;
						return Object.entries(list).map(([level, digimons]) => {
							if (shown >= visibleCount) return null;
							const slice = Object.entries(digimons).slice(
								0,
								visibleCount - shown
							);
							shown += slice.length;
							return (
								<div key={level} className="mb-4">
									<h2 className="mb-4">{level}</h2>
									<div className="d-flex flex-wrap gap-3">
										{slice.map(([name, digimon]) => (
											<div
												key={name}
												draggable={canReorder}
												onDragStart={
													canReorder ?
														() => handleDragStart(level, name)
													:	undefined
												}
												onDragEnd={
													canReorder ? handleDragEnd : undefined
												}
												onDragOver={
													canReorder ?
														e =>
															handleDragOver(e, level, name)
													:	undefined
												}
												onDrop={
													canReorder ?
														() => handleDrop(level, name)
													:	undefined
												}
												className={makeClassName(
													canReorder && 'reorderable',
													draggingName === name && 'dragging'
												)}
												style={
													canReorder ?
														{ cursor: 'grab' }
													:	undefined
												}
											>
												<ListItem
													digimon={digimon}
													hash={hash}
													onEdit={
														IS_DEV ?
															() =>
																handleEditDigimon(
																	level,
																	digimon
																)
														:	undefined
													}
												/>
											</div>
										))}
									</div>
								</div>
							);
						});
					})()}
					{visibleCount < totalCount && (
						<div ref={sentinelRef} className="text-center py-4">
							<Spinner animation="border" />
						</div>
					)}
					{IS_DEV && (
						<DigimonModal
							show={showModal}
							handleClose={handleCloseModal}
							onSubmit={handleSubmitDigimon}
							onDelete={handleDeleteDigimon}
							levels={levels}
							editData={editData}
						/>
					)}
				</DigimonProvider>
			</SearchContext.Provider>
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	try {
		const list: DigimonList = require('../../../public/json/digimons/ranked.json');
		const digimons = require('../../../public/json/digimons/index.json');
		const dubNames = getDubNames();
		const searchList: string[] = getDirPaths('images/digimon');
		const search = getDubbedSearchList(searchList, dubNames);
		return { props: { list, digimons, dubNames, search } };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageList;
