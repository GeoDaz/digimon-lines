import React, { useEffect } from 'react';
import { Row, Col, Image, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import Layout from '../Layout';

const PageLines: React.FC = () => {
	const [lines, setLines] = React.useState<string[]>([]);
	const [load, loading] = useFetch(setLines);

	useEffect(() => {
		load(`/json/lines/index.json`);
	}, []);

	return (
		<Layout title="Available lines">
			{loading ? (
				<div className="text-center">
					<Spinner animation="border" />
				</div>
			) : (
				<div className="line-wrapper">
					<Row className="line-row">
						{lines.map((ref, i) => (
							<Col key={i}>
								<Link
									to={`/lines/${ref}`}
									className="line-point pictured"
									title={ref}
								>
									<Image
										src={`/images/digimon/${ref}.jpg`}
										alt={ref}
										rounded
										className="line-img"
									/>
								</Link>
							</Col>
						))}
					</Row>
				</div>
			)}
		</Layout>
	);
};

export default PageLines;
