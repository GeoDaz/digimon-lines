import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Row, Col, Image } from 'react-bootstrap';
import useFetch from '../../hooks/useFetch';
import Layout from '../Layout';
import LineGrid, { LineLoading } from '../LineGrid';
import { Line } from '../../types/Line';
import { zooms, zoomOptions } from '../../consts/zooms';
import ProgressBarSteps from '../ProgressBarSteps';
import Icon from '../Icon';
import ColorLegend from '../ColorLegend';

const PageLine: React.FC = () => {
	const { name } = useParams();
	const [line, setLine] = useState<Line | undefined>();
	const [zoom, setZoom] = useState(0);

	const setLineBuffer = (line: Line | undefined) => {
		if (line) {
			let size = 6;
			line.columns.forEach(column => {
				if (column.length > size) {
					size = column.length;
				}
			});
			const columns = line.columns.map(col => {
				col = col.slice();
				if (col[0]) {
					col[0] = { ...col[0], from: null };
				}
				while (col.length < size) {
					col.push(null);
				}
				// col.reverse();
				return col;
			});
			line = {
				...line,
				columns,
			};
		}
		setLine(line);
	};

	const [load, loading] = useFetch(setLineBuffer);

	useEffect(() => {
		if (name) {
			load(`/json/lines/${name}.json`);
		}
	}, [name]);

	return (
		<Layout
			title={
				<>
					Digimon&nbsp;: <span className="text-capitalize">{name}</span>
				</>
			}
		>
			<div className="line-filters">
				<Icon name="zoom-in lead d-inline-block d-max-xs-none" />
				<ProgressBarSteps
					steps={zoomOptions}
					selected={zoom}
					progress={zooms[zoom] / 1.5}
					onChange={setZoom}
					className="progress-zoom me-4"
				/>
				<ColorLegend className="ms-4" />
			</div>
			{loading ? (
				<LineLoading />
			) : line ? (
				<LineGrid line={line} zoom={zooms[zoom]} />
			) : (
				<p>Line not found</p>
			)}
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
									<div className="line-point-safe-zone">
										<Image
											src={`/images/digimon/${name}.jpg`}
											alt={name}
											rounded
											className="line-img"
										/>
									</div>
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
