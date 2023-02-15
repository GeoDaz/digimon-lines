import React from 'react';
import Layout from '../Layout';
import { Row, Col, Image } from 'react-bootstrap';
import LineGrid, { LineLoading } from '../LineGrid';
import { useParams } from 'react-router-dom';

const PageLine: React.FC = () => {
	const { name } = useParams();
	const [line, setLine] = React.useState<Line | undefined>();
	const [load, loading] = useFetch(setLine);

	useEffect(() => {
		if (name) {
			load(`/json/lines/${name}.json`);
		}
	}, [name]);

	if (loading) {
		return <LineLoading />;
	}

	return (
		<Layout
			title={
				<>
					Digimon : <span className="text-capitalize">{name}</span>
				</>
			}
		>
			{loading && <LineLoading />}
			{!!line && <LineGrid line={line} />}
			{line?.related ? (
				<Row className="line-row">
					{line.related.map((name, i) => (
						<Col key={i}>
							<div className="line-point pictured">
								<Image
									src={`/images/digimon/${name}.jpg`}
									title={name}
									rounded
									className="line-img"
								/>
							</div>
						</Col>
					))}
				</Row>
			) : null}
		</Layout>
	);
};
export default PageLine;
