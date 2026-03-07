import Layout from '@/components/Layout';
import ListItem from '@/components/List/ListItem';
import AddDigimonModal from '@/components/List/AddDigimonModal';
import SearchBar from '@/components/SearchBar';
import { stringToKey } from '@/functions';
import useHash from '@/hooks/useHash';
import { Digimon, DigimonItem } from '@/types/Digimon';
import { StringObject } from '@/types/Ui';
import Search from '@/types/Search';
import { DigimonProvider } from '@/context/digimon';
import { SearchContext } from '@/context/search';
import { GetStaticProps } from 'next';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import Icon from '@/components/Icon';
import { getDirPaths } from '@/functions/file';
import { getDubNames, getDubbedSearchList } from '@/functions/search';

const defaultObject: any = {};
interface DigimonList {
	[key: string]: { [key: string]: DigimonItem };
}

interface Props {
	list?: DigimonList;
	digimons?: { [key: string]: Digimon };
	dubNames?: StringObject;
	search?: Search;
}
const PageList: React.FC<Props> = props => {
	const defaultList: DigimonList = props.list || defaultObject;
	const [list, setList] = useState<DigimonList>(defaultList);
	const [search, setSearch] = useState<string>();
	const [showAddModal, setShowAddModal] = useState(false);
	const hash = useHash();

	useEffect(() => {
		if (hash) {
			document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
		}
	}, [hash]);

	useEffect(() => {
		if (!search) {
			setList(defaultList);
		} else {
			setList(
				Object.entries(defaultList).reduce((acc, [level, levels]) => {
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
				}, {} as DigimonList)
			);
		}
	}, [search]);

	const handleSearch = (value: string) => {
		let sanitizedSearch = stringToKey(value);
		if (sanitizedSearch == search) return;
		if (sanitizedSearch.length < 3) {
			sanitizedSearch = '';
		}
		setSearch(sanitizedSearch);
	};

	const handleAddDigimon = async (level: string, item: DigimonItem) => {
		try {
			const response = await fetch('/api/add-digimon', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ level, digimon: item }),
			});
			const data = await response.json();

			if (!response.ok) return;

			setList((prev) => ({
				...prev,
				[level]: {
					...prev[level],
					[item.name]: item,
				},
			}));

		} catch (error) {
			console.error('Failed to add digimon:', error);
		}
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
						{process.env.NODE_ENV === 'development' && (
							<Button
								variant="primary"
								className="mb-3"
								onClick={() => setShowAddModal(true)}
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
									<ListItem key={name} digimon={digimon} hash={hash} />
								))}
							</div>
						</div>
					))}
					{process.env.NODE_ENV === 'development' && (
						<AddDigimonModal
							show={showAddModal}
							handleClose={() => setShowAddModal(false)}
							onSubmit={handleAddDigimon}
							levels={Object.keys(defaultList)}
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
