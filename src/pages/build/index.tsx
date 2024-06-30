import React, { useState, useReducer, useMemo } from 'react';
import { Alert, Button, FormControl, InputGroup } from 'react-bootstrap';
import Layout from '@/components/Layout';
import { createFile, download, getDirPaths } from '@/functions/file';
import ZoomBar from '@/components/ZoomBar';
import ColorLegend from '@/components/ColorLegend';
import LineGrid from '@/components/Line/LineGrid';
import { GetStaticProps } from 'next';
import { SearchContext } from '@/context/search';
import lineReducer, { defaultLine, setLineAction } from '@/reducers/lineReducer';
import Icon from '@/components/Icon';
import BoostrapSwitch from '@/components/BoostrapSwitch';
import ReportABugLink from '@/components/ReportABugLink';
import useLocalStorage from '@/hooks/useLocalStorage';
import DownloadDropdown from '@/components/DownloadDropdown';
import Line from '@/types/Line';
import UploadCode from '@/components/UploadCode';
import transformLine, { areCollapsablePoints } from '@/functions/transformer/line';
import useDownloadImg from '@/hooks/useDownloadImg';
import useDownloadCode from '@/hooks/useDownloadCode';

interface Props {
	ssr: {
		searchList?: string[];
		line?: Line;
	};
}
const PageBuild: React.FC<Props> = ({ ssr = {} }) => {
	const [line, dispatchState] = useReducer(lineReducer, ssr.line || defaultLine);
	const setLine = (line: Line) => dispatchState(setLineAction(line));
	const { setItemToStorage } = useLocalStorage({
		key: 'line',
		item: line,
		setItem: setLine,
		defaultItem: defaultLine,
		locked: !!ssr.line,
	});
	const [zoom, setZoom] = useState<number>(100);
	const [edition, edit] = useState<boolean>(true);
	useMemo(() => areCollapsablePoints(line), [line]);

	const { downloadCode, uploadCode, name, setName } = useDownloadCode(line, setLine);
	const { downloadImage, downloading, error } = useDownloadImg(line, name);

	const handleUpdate = (action: CallableFunction, ...args: any[]) => {
		dispatchState(action(...args));
	};

	const handleVoid = () => {
		setLine(defaultLine);
		// default value is not automaticaly stored in localstorage
		setItemToStorage(defaultLine);
	};

	return (
		<Layout
			title="Build your line"
			metatitle="Builder"
			metadescription="Build your own Digimon lines. be creative your are free."
		>
			<blockquote className="blockquote">
				<b>Click</b> on a case from the grid to set a Digimon.
				<br /> You can make up to 2 relation from a Digimon to another one, but a
				Digimon can receive an unlimited number of relations.
				<br /> At the moment there is no download button for images, the only way
				is to move zoom to the percent you need to get the full image, toggle the
				edit button and get a manual screenshot.
				<br /> Your work is saved on the browser for one line at a time but you
				can export it on your computer with the <b>Save</b> button and rework it
				later with the <b>Import</b> button.
			</blockquote>
			<div className="line-filters align-items-center">
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
				<Button
					variant="danger"
					disabled={line === defaultLine}
					onClick={handleVoid}
				>
					<Icon name="trash3-fill" /> Void
				</Button>
				<InputGroup className="width-auto d-inline-flex">
					<InputGroup.Text>Line title</InputGroup.Text>
					<FormControl
						id="line-title"
						max="100"
						onChange={e => setName(e.target.value)}
						value={name || ''}
						placeholder="_ _ _ _ _"
					/>
				</InputGroup>
				<DownloadDropdown
					downloadCode={downloadCode}
					downloadImage={downloadImage}
					loading={downloading}
					error={error}
				/>
				<UploadCode handleUpload={uploadCode} />
				<ReportABugLink />
				<ZoomBar handleZoom={setZoom} />
				<ColorLegend />
			</div>
			{!!error && (
				<div>
					<Alert variant="danger">{error}</Alert>
				</div>
			)}
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
