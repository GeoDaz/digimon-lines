import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Alert } from 'react-bootstrap';
import LineGrid from '@/components/Line/LineGrid';
import Icon from '@/components/Icon';
import ColorLegend from '@/components/ColorLegend';
import DownloadDropdown from '@/components/DownloadDropdown';
import ShareButton from '@/components/ShareButton';
import ZoomBar from '@/components/ZoomBar';
import useDownloadImg from '@/hooks/useDownloadImg';
import useDownloadCode from '@/hooks/useDownloadCode';
import { DigimonProvider } from '@/context/digimon';
import { ZoomProvider } from '@/context/zoom';
import { SearchContext } from '@/context/search';
import {
	getLicence,
	licenceBuildPath,
	licenceStorageKey,
	LicenseContext,
} from '@/context/license';
import { DEFAULT_ZOOM } from '@/consts/zooms';
import { Line } from '@/types/Line';
import { Digimon, DigimonItem } from '@/types/Digimon';
import { StringObject } from '@/types/Ui';
import Search from '@/types/Search';

interface Props {
	line: Line;
	downloadName?: string;
	editName?: string;
	licence?: string | null;
	shareTitle?: string;
	shareText?: string;
	search?: Search;
	digimons?: { [key: string]: Digimon };
	items?: { [key: string]: DigimonItem };
	itemLevels?: StringObject;
	levels?: string[];
	dubNames?: StringObject;
}

const noop = () => {};

const LineViewer: React.FC<Props> = ({
	line,
	downloadName,
	editName,
	licence,
	shareTitle,
	shareText,
	search,
	digimons,
	items,
	itemLevels,
	levels,
	dubNames,
}) => {
	const router = useRouter();
	const [zoom, setZoom] = useState(DEFAULT_ZOOM);
	const { downloadCode } = useDownloadCode(line, noop);
	const { downloadImage, downloading, error } = useDownloadImg(downloadName);

	useEffect(() => {
		if (window.innerWidth < 576) {
			setZoom(-2);
		} else if (window.innerWidth < 992) {
			setZoom(-1);
		}
	}, []);

	const handleDownloadImg = () => {
		const zoomState = zoom;
		setZoom(DEFAULT_ZOOM);
		downloadImage(line, DEFAULT_ZOOM).then(() => {
			setZoom(zoomState);
		});
	};

	const handleEdit = () => {
		const build = licenceBuildPath(licence);
		localStorage.setItem(licenceStorageKey(licence), JSON.stringify(line, null, 4));
		router.push(editName ? `${build}/?name=${encodeURIComponent(editName)}` : build);
	};

	return (
		<>
			<div className="line-filters">
				<button type="button" className="btn btn-primary" onClick={handleEdit}>
					<Icon name="pencil-fill" className="d-inline-block me-1" /> Edit in
					builder
				</button>
				<DownloadDropdown
					downloadCode={downloadCode}
					downloadImage={handleDownloadImg}
					loading={downloading}
					error={error}
				/>
				{!!shareTitle && <ShareButton title={shareTitle} text={shareText} />}
				<ZoomBar handleZoom={setZoom} />
				<ColorLegend />
			</div>
			{!!error && (
				<div>
					<Alert variant="danger">{error}</Alert>
				</div>
			)}
			<SearchContext.Provider value={search}>
				<LicenseContext.Provider value={getLicence(licence)}>
					<DigimonProvider
						dubNames={dubNames}
						data={digimons}
						items={items}
						itemLevels={itemLevels}
						levels={levels}
					>
						<ZoomProvider zoom={zoom}>
							<LineGrid line={line} />
						</ZoomProvider>
					</DigimonProvider>
				</LicenseContext.Provider>
			</SearchContext.Provider>
		</>
	);
};

export default LineViewer;
