import { useState, useReducer, useMemo } from 'react';
import { Alert, Button, FormControl, InputGroup } from 'react-bootstrap';
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
import ReportABugLink from '@/components/ReportABugLink';
import useLocalStorage from '@/hooks/useLocalStorage';
import DownloadDropdown from '@/components/DownloadDropdown';
import Line from '@/types/Line';
import UploadCode from '@/components/UploadCode';
import { areCollapsablePoints } from '@/functions/line';
import useDownloadImg from '@/hooks/useDownloadImg';
import useDownloadCode from '@/hooks/useDownloadCode';
import { defaultLicenceContext, LicenceProps, LicenseContext } from '@/context/license';
import { getDubbedSearchList } from '@/functions/search';
import { StringObject } from '@/types/Ui';
import Search from '@/types/Search';
import { DigimonContext } from '@/context/digimon';
import { Digimon } from '@/types/Digimon';

export interface BuildProps {
	search?: Search;
	line?: Line;
	context?: LicenceProps;
	noStorage?: boolean;
	digimons?: {
		[key: string]: Digimon;
	};
	dubNames?: StringObject;
}

export const PageBuild = (props: BuildProps) => {
	const licenceContext = props.context || defaultLicenceContext;
	const [line, dispatchState] = useReducer(lineReducer, props.line || defaultLine);
	const [zoom, setZoom] = useState<number>(100);
	const [edition, edit] = useState<boolean>(true);

	const setLine = (line: Line) => dispatchState(setLineAction(line));

	const { removeItemFromStorage } = useLocalStorage({
		key: licenceContext.key + '-line',
		item: line,
		setItem: setLine,
		defaultItem: defaultLine,
		locked: props.noStorage,
	});

	useMemo(() => areCollapsablePoints(line), [line]);

	const { downloadCode, uploadCode, name, setName } = useDownloadCode(line, setLine);
	const { downloadImage, downloading, error } = useDownloadImg(name);

	const handleUpdate = (action: CallableFunction, ...args: any[]) => {
		dispatchState(action(...args));
	};

	const handeDowloadImg = () => {
		let editionState = edition;
		let zoomState = zoom;
		edit(false);
		setZoom(100);
		downloadImage(line).then(() => {
			edit(editionState);
			setZoom(zoomState);
		});
	};

	const handleVoid = () => {
		setLine(defaultLine);
		// default value is not automaticaly stored in localstorage
		removeItemFromStorage();
	};

	return (
		<Layout
			title="Build your line"
			metatitle="Builder"
			metadescription={`Build your own ${licenceContext.name} lines. be creative your are free.`}
		>
			<blockquote className="blockquote">
				<b>Click</b> on a case from the grid to set a {licenceContext.name}. The{' '}
				<Icon name="bezier2" title="link" /> button will allow you to link two
				digimons together.
				<br /> If you click on a digimon image, you can access to new parameters
				like&nbsp;: change the line color or add some sub images.
				<br /> The <b>Save as</b> button will allow you to download the line as an
				image or code.
				<br /> The image option doesn't work with <b>url images</b>, but it will
				works with <b>uploaded images</b>.
				<br /> The code save option will be very heavy with <b>uploaded images</b>
				, but it will works with <b>url images</b>.
				<br /> Your work is saved on the browser for one line at a time, but you
				can export it on your computer with the <b>Save as Code</b> button and
				update it later with the <b>Import from {'{}'}</b> button.
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
					downloadImage={handeDowloadImg}
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
			<SearchContext.Provider value={props.search}>
				<LicenseContext.Provider value={licenceContext}>
					<DigimonContext.Provider
						value={{
							dubNames: props.dubNames || {},
							data: props.digimons || {},
						}}
					>
						<LineGrid
							line={line}
							zoom={zoom}
							handleUpdate={edition ? handleUpdate : undefined}
						/>
					</DigimonContext.Provider>
				</LicenseContext.Provider>
			</SearchContext.Provider>
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	const context: LicenceProps = defaultLicenceContext;
	try {
		let dubNames: StringObject = require('../../../public/json/dubnames.json');
		dubNames = {
			...dubNames,
			...Object.fromEntries(Object.entries(dubNames).map(([k, v]) => [v, k])),
		};

		const digimons: {
			[key: string]: Digimon;
		} = require('../../../public/json/digimons/index.json');
		const searchList: string[] = getDirPaths('images/digimon');
		const search: Search = getDubbedSearchList(searchList, dubNames);
		return { props: { search, context, digimons, dubNames } };
	} catch (e) {
		console.error(e);
		return { props: { context } };
	}
};

export default PageBuild;
