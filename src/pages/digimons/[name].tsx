// modules
import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { redirect } from 'next/navigation';
import { GetStaticProps } from 'next';
// components
import Layout from '@/components/Layout';
// functions
import useFetch from '@/hooks/useFetch';
import { capitalize } from '@/functions';
// constants
import { Digimon as DigimonInterface } from '@/types/Digimon';
import useQueryParam from '@/hooks/useQueryParam';
import { DEV } from '@/consts/env';
import Galery from '@/components/Galery';
import Digimon from '@/components/Digimon';
import { getDirPaths } from '@/functions/file';

const NAME = 'name';

const getDigimonNames = ({ name, name2, name3 }: DigimonInterface) =>
	name + (name2 ? ` / ${name2}` : '') + (name3 ? ` / ${name3}` : '');

interface StaticProps {
	digimon?: DigimonInterface;
	name?: string;
}
interface Props {
	ssr: StaticProps;
}
const PageDigimon: React.FC<Props> = ({ ssr = {} }) => {
	const { name } = useQueryParam(NAME) || ssr;
	const [digimon, setDigimon] = useState<DigimonInterface | undefined>(ssr.digimon);

	const [load, loading] = useFetch((digimon: DigimonInterface | undefined): void =>
		setDigimon(digimon)
	);

	useEffect(() => {
		if (name != ssr.name) {
			load(`${process.env.URL}/json/digimons/${name}.json`);
		}
	}, [name]);

	useEffect(() => {
		if (digimon !== ssr.digimon) {
			setDigimon(ssr.digimon);
		}
	}, [ssr.digimon]);

	if (!name) {
		// redirect('/');
		return null;
	}
	const nameCap = digimon ? digimon.name : capitalize(name);
	return (
		<Layout
			title={
				<>
					Digimon&nbsp;:{' '}
					<span>{digimon ? getDigimonNames(digimon) : name}</span>
				</>
			}
			metatitle={nameCap + ' Digimon'}
			metadescription={`Informations of ${nameCap}`}
			metaimg={`digimon/${name}.jpg`}
		>
			{loading ? (
				<Spinner animation="border" />
			) : digimon ? (
				<>
					<Digimon digimon={digimon} />
					{digimon.modes && digimon.modes.length > 0 && (
						<Galery title="Modes" list={digimon.modes} />
					)}
					{digimon.skins && digimon.skins.length > 0 && (
						<Galery title="Skins" list={digimon.skins} />
					)}
					{digimon.species && digimon.species.length > 0 && (
						<Galery title="Species" list={digimon.species} />
					)}
					{digimon.preEvos && digimon.preEvos.length > 0 && (
						<Galery title="Pre-Evolutions" list={digimon.preEvos} />
					)}
					{digimon.evos && digimon.evos.length > 0 && (
						<Galery title="Evolutions" list={digimon.evos} />
					)}
					{digimon.related && digimon.related.length > 0 && (
						<Galery title="Related" list={digimon.related} />
					)}
				</>
			) : (
				<p>Digimon not found</p>
			)}
		</Layout>
	);
};

export async function getStaticPaths() {
	try {
		const filenames = getDirPaths('digimons');
		const paths = filenames.map(name => ({ params: { name } }));

		return { paths, fallback: false };
	} catch {
		return { paths: [], fallback: true };
	}
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
	if (!params || !params.name) {
		return { notFound: true };
	}
	let digimon: DigimonInterface | null = null;
	try {
		digimon = require(`../../../public/json/digimons/${params.name}.json`) || null;
	} catch (e) {
		console.error(e);
	}
	return { props: { ssr: { name: params.name, digimon } } };
};

export default PageDigimon;
