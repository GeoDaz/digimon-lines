import Layout from '@/components/Layout';
import ListItem from '@/components/List/ListItem';
import SearchBar from '@/components/SearchBar';
import { stringToKey } from '@/functions';
import useHash from '@/hooks/useHash';
import { DigimonItem } from '@/types/Digimon';
import { GetStaticProps } from 'next';
import React, { useEffect, useState } from 'react';

interface DigimonList {
	[key: string]: { [key: string]: DigimonItem };
}

interface Props {
	list: DigimonList;
	searchList: string[];
}
const PageList: React.FC<Props> = props => {
	const [list, setList] = useState<DigimonList>(props.list);
	const [search, setSearch] = useState<string>();
	const hash = useHash();

	useEffect(() => {
		if (hash && Object.keys(props.list).length > 0) {
			document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
		}
	}, [hash]);

	useEffect(() => {
		if (!search) {
			setList(props.list);
		} else {
			setList(
				Object.entries(props.list).reduce((acc, [level, levels]) => {
					const nextLevel = Object.entries(levels).reduce((acc, [key, value]) => {
						if (key.includes(search)) {
							acc[key] = value;
						}
						return acc;
					}, {} as { [key: string]: DigimonItem });

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

	return (
		<Layout
			noGoBack
			title="Digimon by levels"
			metadescription="List of Digimon by levels"
		>
			<SearchBar
				label="Research a digimon"
				onSubmit={handleSearch}
				defaultValue={search}
				width={300}
			/>
			{Object.entries(list).map(([level, digimons]) => (
				<div key={level} className='mb-4'>
					<h2 className='mb-4'>{level}</h2>
					<div className="d-flex flex-wrap gap-3">
						{Object.entries(digimons).map(([name, digimon]) => (
							<ListItem key={name} digimon={digimon} hash={hash} />
						))}
					</div>
				</div>
			))}
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	const list: DigimonList = require('../../../public/json/digimons/ranked.json');
	const searchList: string[] = [];
	Object.values(list).forEach(key => {
		searchList.push(...Object.keys(key));
	});
	searchList.sort();
	return { props: { list, searchList } };
};

export default PageList;
