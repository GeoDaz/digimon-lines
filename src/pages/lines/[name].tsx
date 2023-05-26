// modules
import React, { useState, useEffect } from 'react';
import { Row, Col, Image } from 'react-bootstrap';
import { useRouter } from 'next/router';
// components
import Layout from '@/components/Layout';
import LineGrid, { LineLoading } from '@/components/LineGrid';
import Page404 from '@/pages/404';
import ProgressBarSteps from '@/components/ProgressBarSteps';
import Icon from '@/components/Icon';
import ColorLegend from '@/components/ColorLegend';
import LinePoint, { LineImage } from '@/components/LinePoint';
// functions
import useFetch from '@/hooks/useFetch';
import { capitalize } from '@/functions';
// constants
import { Line } from '@/types/Line';
import { zooms, zoomOptions } from '@/consts/zooms';
import { GetStaticProps } from 'next';
import transformLine from '@/functions/transformer/line';
import useQueryParam from '@/hooks/useQueryParam';
import { DEV } from '@/consts/env';

const NAME = 'name';
interface StaticProps {
	line?: Line;
	name?: string;
}
interface Props {
	ssr: StaticProps;
}
const PageLine: React.FC<Props> = ({ ssr = {} }) => {
	const name = useQueryParam(NAME) || ssr.name;
	const [line, setLine] = useState<Line | undefined>(ssr.line);
	const [zoom, setZoom] = useState(0);

	const [load, loading] = useFetch((line: Line | undefined): void =>
		setLine(transformLine(line))
	);

	useEffect(() => {
		if (name != ssr.name) {
			load(`${process.env.URL}/json/lines/${name}.json`);
		}
	}, [name]);

	useEffect(() => {
		if (line !== ssr.line) {
			setLine(ssr.line);
		}
	}, [ssr.line]);

	if (!name) {
		return <Page404 />;
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
			{!!line?.notes && (
				<>
					<h2>Notes&nbsp;:</h2>
					{line.notes.map((note, i) => (
						<p key={i} className="mb-1">
							{note}
						</p>
					))}
				</>
			)}
			{!!line?.related && (
				<div className="line-wrapper">
					<h2>Related lines&nbsp;:</h2>
					<Row className="line-row">
						{line.related.map((relation, i) => {
							if (typeof relation == 'string') {
								return (
									<Col key={i}>
										<LinePoint name={relation} />
									</Col>
								);
							}
							return (
								<Col key={i}>
									<LinePoint name={relation.name}>
										<LineImage
											className="line-skin"
											name={relation.for}
											title={relation.for}
										/>
									</LinePoint>
								</Col>
							);
						})}
					</Row>
				</div>
			)}
		</Layout>
	);
};

export async function getStaticPaths() {
	try {
		const lines = require('/json/lines/_index.json');
		const fusions = require('/json/lines/_fusion.json');

		const paths = [...lines, ...fusions].map(name => ({
			params: { name },
		}));

		return { paths, fallback: false };
	} catch {
		return { paths: [], fallback: true };
	}
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
	if (!params || !params.name) {
		return { notFound: true };
	}
	try {
		const line: Line | undefined = transformLine(
			require(`../../../public/json/lines/${params.name}.json`)
		);

		return { props: { ssr: { name: params.name, line } } };
	} catch (e) {
		if (process.env.NODE_ENV === DEV) {
			console.error(e);
		}
		return { props: { ssr: { name: params.name } } };
	}
};

export default PageLine;
