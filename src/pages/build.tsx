import React, { useState, useReducer } from 'react';
import Layout from '@/components/Layout';
import { getDirPaths } from '@/functions/file';
import ZoomBar from '@/components/ZoomBar';
import ColorLegend from '@/components/ColorLegend';
import LineGrid from '@/components/Line/LineGrid';
import { GetStaticProps } from 'next';
import { SearchContext } from '@/context/search';
import lineReducer, { defaultLine, setLineAction } from '@/reducers/lineReducer';
import Icon from '@/components/Icon';
import BoostrapSwitch from '@/components/BoostrapSwitch';
import { Button } from 'react-bootstrap';

interface StaticProps {
	searchList?: string[];
}
interface Props {
	ssr: StaticProps;
}
const PageBuild: React.FC<Props> = ({ ssr = {} }) => {
	const [line, dispatchState] = useReducer(lineReducer, defaultLine);
	const [zoom, setZoom] = useState<number>(100);
	const [edition, edit] = useState<boolean>(true);

	const handleUpdate = (action: CallableFunction, ...args: any[]) => {
		dispatchState(action(...args));
	};

	const handleVoid = () => {
		dispatchState(setLineAction(defaultLine));
	};

	return (
		<Layout
			title="Build your line"
			metadescription="Build your own Digimon lines. be creative your are free."
		>
			<p className="mb-4">
				Click on a case from the grid to set a Digimon.
				<br /> You can make up to 2 relation from a Digimon to another one, but a
				Digimon can receive an unlimited number of relations.
				<br /> At the moment there is no export button, the only way is to move
				zoom to 75% (to get the full image), toggle the edit button and get a
				screenshot.
			</p>
			<div className="line-filters align-items-center">
				<div className="me-4">
					<BoostrapSwitch
						checked={edition}
						labelOn={
							<>
								Edit <Icon name="pencil-fill" />
							</>
						}
						labelOff={
							<>
								<Icon name="eye-fill" /> View
							</>
						}
						toggle={() => edit(!edition)}
					/>
				</div>
				<div className="me-4">
					<Button variant="secondary" onClick={handleVoid}>
						<Icon name="trash3-fill" /> Void
					</Button>
				</div>
				<ZoomBar handleZoom={setZoom} />
				<ColorLegend className="ms-4" />
			</div>
			<SearchContext.Provider value={ssr.searchList}>
				<LineGrid
					line={line}
					zoom={zoom}
					handleUpdate={edition ? handleUpdate : undefined}
				/>
			</SearchContext.Provider>
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	try {
		const searchList = getDirPaths('images/digimon');

		return { props: { ssr: { searchList } } };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageBuild;
