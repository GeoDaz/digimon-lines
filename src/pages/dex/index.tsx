import Layout from '@/components/Layout';
import { Row } from 'react-bootstrap';
import Page404 from '../404';

interface Props {}

const PageLines: React.FC<Props> = props => {
	return <Page404 />;
	return (
		<Layout title="Digidex" metadescription="List of Digimon in the digidex">
			<div className="line-wrapper">
				<Row className="line-row">
					{/* {groups.map((group, i) =>
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
					)} */}
				</Row>
			</div>
		</Layout>
	);
};

// export const getStaticProps: GetStaticProps = async () => {
// 	try {
// 		return { props: {} };
// 	} catch (e) {
// 		console.error(e);
// 		return { props: {} };
// 	}
// };

export default PageLines;
