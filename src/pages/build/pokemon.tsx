import { GetStaticProps } from 'next';
import { PageBuild } from '.';
import { LicenceProps } from '@/context/license';
import Search from '@/types/Search';
import { StringObject } from '@/types/Ui';

export const getStaticProps: GetStaticProps = async () => {
	const context: LicenceProps = { key: 'pokemon', name: 'Pokémon' };
	try {
		let res: any = await fetch('https://www.coupcritique.fr/api/pokemons?gen=9');
		res = await res.json();
		const searchList: string[] = (res.pokemons as any).map((p: any) => p.name);

		searchList.push('Pyroar-F');
		searchList.push('Hippowdon-F');

		const search: Search = {
			mapped: searchList.reduce((acc, curr) => {
				acc[curr] = curr;
				return acc;
			}, {} as StringObject),
			values: searchList.slice(),
			keys: searchList.slice(),
		};
		return { props: { search, context } };
	} catch (e) {
		console.error(e);
		return { props: { context } };
	}
};

export default PageBuild;
