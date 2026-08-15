import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Alert, Spinner } from 'react-bootstrap';
import { GetStaticProps } from 'next';
import Layout from '@/components/Layout';
import LineGrid from '@/components/Line/LineGrid';
import ColorLegend from '@/components/ColorLegend';
import ZoomBar from '@/components/ZoomBar';
import ShareButton from '@/components/ShareButton';
import DownloadDropdown from '@/components/DownloadDropdown';
import RelatedLines from '@/components/Line/RelatedLines';
import Icon from '@/components/Icon';
import useDownloadImg from '@/hooks/useDownloadImg';
import useDownloadCode from '@/hooks/useDownloadCode';
import { fetchSharedLine } from '@/functions/userLines';
import { flattenDigimonItems, getDigimonItemLevels } from '@/functions/items';
import { getDubbedSearchList, getDubNames } from '@/functions/search';
import { getDirPaths } from '@/functions/file';
import transformLine from '@/functions/line';
import { defaultLine } from '@/reducers/lineReducer';
import { DigimonProvider } from '@/context/digimon';
import { ZoomProvider } from '@/context/zoom';
import { SearchContext } from '@/context/search';
import { DEFAULT_ZOOM } from '@/consts/zooms';
import { Digimon, DigimonItem } from '@/types/Digimon';
import { StringObject } from '@/types/Ui';
import Search from '@/types/Search';
import Line from '@/types/Line';
import { UserLineWithAuthor } from '@/types/Account';

interface Props {
	digimons?: { [key: string]: Digimon };
	items?: { [key: string]: DigimonItem };
	itemLevels?: StringObject;
	levels?: string[];
	dubNames?: StringObject;
	search?: Search;
}

const PageSharedLine: React.FC<Props> = props => {
	const router = useRouter();
	const { pseudo, slug } = router.query as { pseudo?: string; slug?: string };

	const [record, setRecord] = useState<UserLineWithAuthor | null>(null);
	const [line, setLine] = useState<Line | undefined>();
	const [loading, setLoading] = useState(true);
	const [failed, setFailed] = useState(false);
	const [zoom, setZoom] = useState(DEFAULT_ZOOM);

	const { downloadCode } = useDownloadCode(line || defaultLine, setLine);
	const { downloadImage, downloading, error } = useDownloadImg(record?.title || slug);

	useEffect(() => {
		if (window.innerWidth < 576) setZoom(-2);
		else if (window.innerWidth < 992) setZoom(-1);
	}, []);

	useEffect(() => {
		if (!pseudo || !slug) return;
		let active = true;

		const load = async () => {
			setLoading(true);
			setFailed(false);
			try {
				const found = await fetchSharedLine(pseudo, slug);
				if (!active) return;
				setRecord(found);
				setLine(found ? (transformLine(found.data as any) as Line) : undefined);
			} catch (e) {
				console.error('Failed to load the shared line:', e);
				if (active) setFailed(true);
			} finally {
				if (active) setLoading(false);
			}
		};

		load();
		return () => {
			active = false;
		};
	}, [pseudo, slug]);

	const handleDownloadImg = () => {
		if (!line) return;
		const zoomState = zoom;
		setZoom(DEFAULT_ZOOM);
		downloadImage(line, DEFAULT_ZOOM).then(() => setZoom(zoomState));
	};

	const handleEdit = () => {
		localStorage.setItem('digimon-line', JSON.stringify(line, null, 4));
		router.push(`/build/?name=${encodeURIComponent(record?.title || slug || '')}`);
	};

	const title = record?.title || slug || 'Shared line';

	return (
		<Layout
			title={title}
			metatitle={title}
			metadescription={
				pseudo ?
					`An evolution line shared by ${pseudo}`
				:	'A shared evolution line'
			}
			// Le Digimon de couverture sert d'aperçu quand le lien est partagé.
			metaimg={record?.cover ? `digimon/${record.cover}.jpg` : undefined}
		>
			{!!pseudo && (
				<p className="text-muted">
					By <Link href={`/profile/${pseudo}`}>{pseudo}</Link>
					{!!record && !record.is_public && (
						<>
							{' · '}
							<Icon name="lock" title="private" /> Private — only you can
							see this
						</>
					)}
				</p>
			)}

			{loading ?
				<Spinner animation="border" role="status" aria-label="Loading" />
			: failed ?
				<Alert variant="danger">
					Something went wrong while loading this line. Please try again.
				</Alert>
			: !line ?
				<Alert variant="warning">
					This line does not exist, or it is private. If it belongs to you, sign
					in to see it.
				</Alert>
			:	<>
					<div className="line-filters">
						<button
							type="button"
							className="btn btn-primary"
							onClick={handleEdit}
						>
							<Icon name="pencil-fill" className="d-inline-block me-1" />{' '}
							Edit in builder
						</button>
						<DownloadDropdown
							downloadCode={downloadCode}
							downloadImage={handleDownloadImg}
							loading={downloading}
							error={error}
						/>
						<ShareButton
							title={title}
							text={`An evolution line shared by ${pseudo}`}
						/>
						<ZoomBar handleZoom={setZoom} />
						<ColorLegend />
					</div>
					{!!error && (
						<div>
							<Alert variant="danger">{error}</Alert>
						</div>
					)}
					<SearchContext.Provider value={props.search}>
						<DigimonProvider
							dubNames={props.dubNames}
							data={props.digimons}
							items={props.items}
							itemLevels={props.itemLevels}
							levels={props.levels}
						>
							<ZoomProvider zoom={zoom}>
								<LineGrid line={line} />
							</ZoomProvider>
						</DigimonProvider>
					</SearchContext.Provider>
					<RelatedLines related={line.related} />
				</>
			}
		</Layout>
	);
};

export async function getStaticPaths() {
	// Les URLs partagées ne sont pas connues au build. La coquille est générée à
	// la première visite puis servie par le CDN ; elle ne contient aucune donnée
	// utilisateur, celle-ci est chargée côté client sous RLS.
	return { paths: [], fallback: 'blocking' as const };
}

export const getStaticProps: GetStaticProps<Props> = async () => {
	try {
		const digimons = require('../../../../public/json/digimons/index.json');
		const ranked = require('../../../../public/json/digimons/ranked.json');
		const dubNames: StringObject = getDubNames();
		const search: Search = getDubbedSearchList(
			getDirPaths('images/digimon'),
			dubNames
		);
		return {
			props: {
				digimons,
				items: flattenDigimonItems(ranked),
				itemLevels: getDigimonItemLevels(ranked),
				levels: Object.keys(ranked),
				dubNames,
				search,
			},
		};
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageSharedLine;
