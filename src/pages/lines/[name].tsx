// modules
import React, { useState, useEffect } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { redirect } from 'next/navigation';
import { GetStaticProps } from 'next';
// components
import Layout from '@/components/Layout';
import LineGrid from '@/components/Line/LineGrid';
import LineLoading from '@/components/Line/LineLoading';
import LinePoint from '@/components/Line/LinePoint';
import LineImage from '@/components/Line/LineImage';
import CommentLink from '@/components/CommentLink';
import Icon from '@/components/Icon';
import ColorLegend from '@/components/ColorLegend';
// functions
import useFetch from '@/hooks/useFetch';
import useQueryParam from '@/hooks/useQueryParam';
import { capitalize } from '@/functions';
import transformLine from '@/functions/transformer/line';
// constants
import { Line } from '@/types/Line';
import { LINE, titles } from '@/consts/ui';
import ZoomBar from '@/components/ZoomBar';

const NAME = 'name';
interface StaticProps {
	line?: Line;
	name?: string;
	next?: string;
	prev?: string;
}
interface Props {
	ssr: StaticProps;
	type: string;
}
export const PageLine: React.FC<Props> = ({ ssr = {}, type = LINE }) => {
	const { name } = useQueryParam(NAME) || ssr;
	const [line, setLine] = useState<Line | undefined>(ssr.line);
	const [zoom, setZoom] = useState(100);

	const [load, loading] = useFetch((line: Line | undefined): void =>
		setLine(transformLine(line))
	);

	useEffect(() => {
		if (window.innerWidth < 576) {
			setZoom(-2);
		} else if (window.innerWidth < 992) {
			setZoom(-1);
		}
	}, []);

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
		redirect('/');
	}
	const { next, prev } = ssr;
	const nameCap = capitalize(name);
	const typeTitle = titles[type];
	return (
		<Layout
			title={
				<>
					{typeTitle} for {line?.title || nameCap}
				</>
			}
			metatitle={nameCap + ' ' + typeTitle}
			metadescription={`Evolution line for ${nameCap} species`}
			metaimg={`digimon/${name}.jpg`}
		>
			<div className="line-filters">
				<a
					className="btn btn-primary"
					href={`/build/` + encodeURIComponent(JSON.stringify(line))}
				>
					<Icon name="pencil-fill" className="d-inline-block me-1" /> Edit in
					builder
				</a>
				<ZoomBar handleZoom={setZoom} />
				<ColorLegend />
			</div>
			{loading ? (
				<LineLoading />
			) : line ? (
				<>
					<LineGrid line={line} zoom={zoom} />
					<CommentLink />
				</>
			) : (
				<p>Line not found</p>
			)}
			{(!!prev || !!next) && (
				<div className="row mb-4">
					<div className="col-6 d-flex justify-content-start">
						{!!prev && (
							<LinePoint className="move-link" name={prev} type={type}>
								<span className="absolute-legend">
									<Icon name="arrow-left-circle-fill" /> Previous
								</span>
							</LinePoint>
						)}
					</div>
					<div className="col-6 d-flex justify-content-end">
						{!!next && (
							<LinePoint name={next} className="move-link" type={type}>
								<span className="absolute-legend">
									Next <Icon name="arrow-right-circle-fill" />
								</span>
							</LinePoint>
						)}
					</div>
				</div>
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
									<LinePoint
										name={relation.for || relation.name}
										line={relation.name}
									>
										{!!relation.for && (
											<LineImage
												className="line-skin"
												name={relation.name}
												loadable={false}
											/>
										)}
										{!!relation.from && (
											<LineImage
												className="line-skin" /* from */
												name={relation.from}
												loadable={false}
											/>
										)}
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
		const lines = require('../../../public/json/lines/_index.json');
		const fusions = require('../../../public/json/lines/_fusion.json');

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
	let line: Line | null = null;
	try {
		line =
			transformLine(require(`../../../public/json/lines/${params.name}.json`)) ||
			null;
	} catch (e) {
		console.error(e);
	}

	const lines = require('../../../public/json/lines/_index.json');
	const fusions = require('../../../public/json/lines/_fusion.json');

	let prev = null;
	let next = null;
	let list = lines;
	let index = lines.findIndex((name: string) => name == params.name);
	if (index < 0) {
		index = fusions.findIndex((name: string) => name == params.name);
		if (index > -1) {
			list = fusions;
		}
	}
	if (index > 0) {
		prev = list[index - 1];
	}
	if (index > -1 && index < list.length - 1) {
		next = list[index + 1];
	}

	return { props: { ssr: { name: params.name, line, prev, next } } };
};

export default PageLine;
