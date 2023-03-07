import React, { useEffect } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import colors from '../../consts/colors';
import useFetch from '../../hooks/useFetch';
import Layout from '../Layout';
import PointImage from '../PointImage';

const PageLines: React.FC = () => {
	const [lines, setLines] = React.useState<string[]>([]);
	const [fusions, setFusions] = React.useState<string[]>([]);
	const [load, loading] = useFetch(setLines);
	const [loadFusions] = useFetch(setFusions);

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
						{lines.map((name, i) => (
							<Col key={i}>
								<PointImage name={name} />
							</Col>
						))}
					</Row>
				</div>
			)}
			{fusions.length > 0 && (
				<div>
					<h2 style={{ color: colors.fusion }}>Fusions&nbsp;:</h2>
					<div className="line-wrapper">
						<Row className="line-row">
							{fusions.map((name, i) => (
								<Col key={i}>
									<PointImage name={name} />
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
