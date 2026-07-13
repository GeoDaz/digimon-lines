import Layout from '@/components/Layout';
import ListItem from '@/components/List/ListItem';
import DigimonModal, { EditData } from '@/components/List/AddDigimonModal';
import SearchBar from '@/components/SearchBar';
import { makeClassName, stringToKey } from '@/functions';
import useHash from '@/hooks/useHash';
import useSubmitDigimon, { DigimonList } from '@/hooks/useSubmitDigimon';
import useReorderDigimon from '@/hooks/useReorderDigimon';
import { Digimon, DigimonItem } from '@/types/Digimon';
import { StringObject } from '@/types/Ui';
import Search from '@/types/Search';
import { DigimonProvider } from '@/context/digimon';
import { SearchContext } from '@/context/search';
import { GetStaticProps } from 'next';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import Icon from '@/components/Icon';
import { getDirPaths } from '@/functions/file';
import { getDubNames, getDubbedSearchList } from '@/functions/search';
import { IS_DEV } from '@/consts/env';

const defaultObject: any = {};

interface Props {
	list?: DigimonList;
	digimons?: { [key: string]: Digimon };
	dubNames?: StringObject;
	search?: Search;
}
const PageList: React.FC<Props> = props => {
	const [fullList, setFullList] = useState<DigimonList>(
		props.list || defaultObject
	);
	const handleSubmitDigimon = useSubmitDigimon(setFullList);
	const handleReorderDigimon = useReorderDigimon(setFullList);
	const [search, setSearch] = useState<string>();
	const [showModal, setShowModal] = useState(false);
	const [editData, setEditData] = useState<EditData | null>(null);
	const dragRef = useRef<{ level: string; name: string } | null>(null);
	const [draggingName, setDraggingName] = useState<string | null>(null);
	const hash = useHash();

	// Drag & drop reordering is only enabled in dev and when not filtering.
	const canReorder = IS_DEV && !search;

	const list = useMemo<DigimonList>(() => {
		if (!search) return fullList;
		return Object.entries(fullList).reduce((acc, [level, levels]) => {
			const nextLevel = Object.entries(levels).reduce(
				(acc, [key, value]) => {
					if (key.includes(search)) {
						acc[key] = value;
					}
					return acc;
				},
				{} as { [key: string]: DigimonItem }
			);

			if (Object.keys(nextLevel).length > 0) {
				acc[level] = nextLevel;
			}
			return acc;
		}, {} as DigimonList);
	}, [fullList, search]);

	useEffect(() => {
		if (hash) {
			document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
		}
	}, [hash]);

	const handleDragStart = (level: string, name: string) => {
		dragRef.current = { level, name };
		setDraggingName(name);
	};

	const handleDragEnd = () => {
		dragRef.current = null;
		setDraggingName(null);
	};

	const handleDragOver = (
		event: React.DragEvent,
		level: string,
		name: string
	) => {
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
					{Object.entries(list).map(([level, digimons]) => (
						<div key={level} className="mb-4">
							<h2 className="mb-4">{level}</h2>
							<div className="d-flex flex-wrap gap-3">
								{Object.entries(digimons).map(([name, digimon]) => (
									<div
										key={name}
										draggable={canReorder}
										onDragStart={
											canReorder
												? () => handleDragStart(level, name)
												: undefined
										}
										onDragEnd={canReorder ? handleDragEnd : undefined}
										onDragOver={
											canReorder
												? e => handleDragOver(e, level, name)
												: undefined
										}
										onDrop={
											canReorder
												? () => handleDrop(level, name)
												: undefined
										}
										className={makeClassName(
											canReorder && 'reorderable',
											draggingName === name && 'dragging'
										)}
										style={canReorder ? { cursor: 'grab' } : undefined}
									>
										<ListItem
											digimon={digimon}
											hash={hash}
											onEdit={
												IS_DEV
													? () => handleEditDigimon(level, digimon)
													: undefined
											}
										/>
									</div>
								))}
							</div>
						</div>
					))}
					{IS_DEV && (
						<DigimonModal
							show={showModal}
							handleClose={handleCloseModal}
							onSubmit={handleSubmitDigimon}
							levels={Object.keys(fullList)}
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
