import React, { useEffect } from 'react';
import { Row, Col, Image, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import Layout from '../Layout';

const PageLines: React.FC = () => {
	const [lines, setLines] = React.useState<string[]>([]);
	const [fusions, setFusions] = React.useState<string[]>([]);
	const [load, loading] = useFetch(setLines);
	const [loadFusions, loadingFusions] = useFetch(setFusions);

	useEffect(() => {
		load(`/json/lines/_index.json`);
		loadFusions(`/json/lines/_fusion.json`);
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
			{fusions.length > 0 && (
				<div>
					<h2>Fusions</h2>
					<div className="line-wrapper">
						<Row className="line-row">
							{fusions.map((ref, i) => (
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
				</div>
			)}
		</Layout>
	);
};

export default PageLines;
