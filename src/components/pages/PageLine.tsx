import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Row, Col, Image } from 'react-bootstrap';
import useFetch from '../../hooks/useFetch';
import Layout from '../Layout';
import LineGrid, { LineLoading } from '../LineGrid';
import { Line } from '../../types/Line';

const PageLine: React.FC = () => {
	const { name } = useParams();
	const [line, setLine] = useState<Line | undefined>();
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
					Digimon&nbsp;: <span className="text-capitalize">{name}</span>
				</>
			}
		>
			{loading && <LineLoading />}
			{!!line && <LineGrid line={line} />}
			{line?.related ? (
				<div className="line-wrapper">
					<h2>Related lines&nbsp;:</h2>
					<Row className="line-row">
						{line.related.map((name, i) => (
							<Col key={i}>
								<Link
									to={`/lines/${name}`}
									title={name}
									className="line-point pictured"
								>
									<Image
										src={`/images/digimon/${name}.jpg`}
										alt={name}
										rounded
										className="line-img"
									/>
								</Link>
							</Col>
						))}
					</Row>
				</div>
			) : null}
		</Layout>
	);
};
export default PageLine;
