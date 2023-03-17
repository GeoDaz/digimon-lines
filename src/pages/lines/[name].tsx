import React, { useState, useEffect } from 'react';
import { Row, Col, Image } from 'react-bootstrap';
import { useRouter } from 'next/router';
import useFetch from '@/hooks/useFetch';
import Layout from '@/components/Layout';
import LineGrid, { LineLoading } from '@/components/LineGrid';
import { Line } from '@/types/Line';
import { zooms, zoomOptions } from '@/consts/zooms';
import ProgressBarSteps from '@/components/ProgressBarSteps';
import Icon from '@/components/Icon';
import ColorLegend from '@/components/ColorLegend';
import PointImage from '@/components/PointImage';
import { capitalize } from '@/functions';

const PageLine: React.FC = () => {
	const router = useRouter();
	const name = Array.isArray(router.query.name)
		? router.query.name.join()
		: router.query.name;
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
				let first = col[0];
				if (first) {
					if (Array.isArray(first)) {
						col[0] = first.map(point => point && { ...point, from: null });
					} else {
						col[0] = { ...first, from: null };
					}
				}
				while (col.length < size) {
					col.push(null);
				}
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

	if (!name) {
		console.log(name);
		// router.replace('/404');
		return null;
	}
	return (
		<Layout
			title={
				<>
					Digimon&nbsp;: <span className="text-capitalize">{name}</span>
				</>
			}
			metatitle={capitalize(name) + ' Line'}
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
								<PointImage name={name} />
							</Col>
						))}
					</Row>
				</div>
			) : null}
		</Layout>
	);
};
export default PageLine;
