import React from 'react';
import Layout from '../Layout';
import LineGrid from '../LineGrid';
import { useParams } from 'react-router-dom';

const PageLine: React.FC = () => {
	const { name } = useParams();

	return (
		<Layout
			title={
				<>
					Digimon : <span className="text-capitalize">{name}</span>
				</>
			}
		>
			{!!name && <LineGrid name={name} />}
		</Layout>
	);
};
export default PageLine;
