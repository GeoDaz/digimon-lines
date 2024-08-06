import { GetStaticProps } from 'next';
import { BuildProps, PageBuild } from '.';
const Page = (props: BuildProps) => <PageBuild {...props} />;

export const getStaticProps: GetStaticProps = async () => {
	try {
		let res: any = await fetch('https://www.coupcritique.fr/api/pokemons?gen=9');
		res = await res.json();
		const searchList: string[] = (res.pokemons as any).map((p: any) => p.name);
		// Add licence notion for strings, add path to localStorage
		return {
			props: {
				searchList,
				context: { key: 'pokemon', name: 'Pokémon' },
			},
		};
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default Page;
