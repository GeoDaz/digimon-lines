import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Layout from '@/components/Layout';
import LinePoint from '@/components/Line/LinePoint';
import { GetStaticProps } from 'next';
import { VbThumb } from '@/types/Line';
import { VB } from '@/consts/ui';

const DEVICES = [
	{ key: 'dim', title: 'Vital Bracelet DIM' },
	{ key: 'bem', title: 'Vital Bracelet BE' },
];

const defaultData = { vbs: [] };
interface StaticProps {
	vbs: VbThumb[];
}
interface Props {
	ssr: StaticProps;
}
const PageVbs: React.FC<Props> = ({ ssr = defaultData }) => {
	return (
		<Layout
			title="Available Vpets"
			metatitle="Vpets"
			metadescription="List of available Digimon Vpets"
		>
			{DEVICES.map(device => {
				const vbs = ssr.vbs.filter(vb => vb.device === device.key);
				if (!vbs.length) return null;
				const series = Array.from(new Set(vbs.map(vb => vb.series)));
				return (
					<section key={device.key} className="mb-4">
						<h2 className="h3">{device.title}</h2>
						{series.map(serie => (
							<div key={serie} className="mb-3">
								<h3 className="h5">{serie}</h3>
								<div className="line-wrapper">
									<Row className="line-row">
										{vbs
											.filter(vb => vb.series === serie)
											.map(vb => (
												<Col key={vb.name}>
													<LinePoint
														name={vb.digimon}
														line={vb.name}
														label={vb.title}
														type={VB}
														available
													>
														<span className="absolute-legend">{vb.title}</span>
													</LinePoint>
												</Col>
											))}
									</Row>
								</div>
							</div>
						))}
					</section>
				);
			})}
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	try {
		const vbs: VbThumb[] = require('../../../public/json/vb/_index.json');
		return { props: { ssr: { vbs } } };
	} catch (e) {
		console.error(e);
		return { props: { ssr: defaultData } };
	}
};

export default PageVbs;
