import { useEffect, useState } from 'react';

// TODO rename this page groups.tsx when there will be a home

const defaultData = { groups: [], fusions: [] };
interface StaticProps {
	groups: string[] | LineThumb[];
}
interface Props {
	ssr: StaticProps;
}
const PageLines: React.FC<Props> = ({ ssr = defaultData }) => {
	const [groups, setLines] = useState<string[] | LineThumb[]>(ssr.groups);
	const [load, loading] = useFetch(setLines);

	useEffect(() => {
		if (!groups.length) {
			load(`${process.env.URL}/json/groups/_index.json`);
		}
	}, []);

	return (
		<Layout title="Digidex" metadescription="List of Digimon in the digidex">
			{loading ? (
				<div className="text-center">
					<Spinner animation="border" />
				</div>
			) : (
				<div className="line-wrapper">
					<Row className="line-row">
						{groups.map((group, i) =>
							typeof group === 'string' ? (
								<Col key={i}>
									<LinePoint name={group} type={GROUP} />
								</Col>
							) : (
								<Col key={i}>
									<LinePoint
										name={group.name}
										available={group.available}
										type={GROUP}
									/>
								</Col>
							)
						)}
					</Row>
				</div>
			)}
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	try {
		// let groups = require('../../../public/json/groups/_index.json');
		// groups = groups.map(checkGroupAvailability);

		return { props: { ssr: { groups } } };
	} catch (e) {
		console.error(e);
		return { props: { ssr: defaultData } };
	}
};

export default PageLines;
