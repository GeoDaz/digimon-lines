// modules
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Alert } from 'react-bootstrap';
import { redirect } from 'next/navigation';
import { GetStaticProps } from 'next';
// components
import Layout from '@/components/Layout';
import LineGrid from '@/components/Line/LineGrid';
import LineNav from '@/components/Line/LineNav';
import CommentLink from '@/components/CommentLink';
import Icon from '@/components/Icon';
import ColorLegend from '@/components/ColorLegend';
import DownloadDropdown from '@/components/DownloadDropdown';
import ShareButton from '@/components/ShareButton';
import RelatedLines from '@/components/Line/RelatedLines';
// hooks
import useDownloadImg from '@/hooks/useDownloadImg';
import useDownloadCode from '@/hooks/useDownloadCode';
// functions
import useQueryParam from '@/hooks/useQueryParam';
import useSharedDigimonData from '@/hooks/useSharedDigimonData';
import { capitalize } from '@/functions';
import transformLine, { thumbsToNames } from '@/functions/line';
// constants
import { Line } from '@/types/Line';
import { defaultLine } from '@/reducers/lineReducer';
import { LINE, titles } from '@/consts/ui';
import ZoomBar from '@/components/ZoomBar';
import { DigimonProvider } from '@/context/digimon';
import { ZoomProvider } from '@/context/zoom';
import { SearchContext } from '@/context/search';
import { DEFAULT_ZOOM } from '@/consts/zooms';

const NAME = 'name';
const defaultObject: any = {};
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
export const PageLine: React.FC<Props> = ({ ssr = defaultObject, type = LINE }) => {
	const { name } = useQueryParam(NAME) || ssr;
	const router = useRouter();
	const [line, setLine] = useState<Line | undefined>(ssr.line);
	const [zoom, setZoom] = useState(DEFAULT_ZOOM);
	// Fiches, relations et noms doublés pour la modale des images : communs à
	// toutes les lines, ils sont chargés à part (chunk en cache) plutôt que
	// répétés dans les props de chaque page. Les pages Appmon / VB, qui
	// réutilisent ce composant, ne les ont jamais reçues : pas de chargement.
	const { data: shared, loading: sharedLoading } = useSharedDigimonData(type === LINE);

	const downloadName = ssr.line?.title || name;
	const { downloadCode } = useDownloadCode(line || defaultLine, setLine);
	const { downloadImage, downloading, error } = useDownloadImg(downloadName);

	const handleDownloadImg = () => {
		if (!line) return;
		let zoomState = zoom;
		setZoom(DEFAULT_ZOOM);
		downloadImage(line, DEFAULT_ZOOM).then(() => {
			setZoom(zoomState);
		});
	};

	useEffect(() => {
		if (window.innerWidth < 576) {
			setZoom(-2);
		} else if (window.innerWidth < 992) {
			setZoom(-1);
		}
	}, []);

	useEffect(() => {
		if (line !== ssr.line) {
			setLine(ssr.line);
		}
	}, [ssr.line]);

	const handleEdit = () => {
		localStorage.setItem('digimon-line', JSON.stringify(line, null, 4));
		router.push(`/build/?${NAME}=${encodeURIComponent(name)}`);
	};

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
				<ZoomBar handleZoom={setZoom} />
				<ColorLegend />
				<ShareButton
					title={`${line?.title || nameCap} ${typeTitle}`}
					text={`Evolution line for ${nameCap} species`}
				/>
			</div>
			{!!error && (
				<div>
					<Alert variant="danger">{error}</Alert>
				</div>
			)}
			{line ?
				<>
					<SearchContext.Provider value={shared?.search}>
						<DigimonProvider
							dubNames={shared?.dubNames}
							data={shared?.digimons}
							items={shared?.items}
							itemLevels={shared?.itemLevels}
							levels={shared?.levels}
							loading={sharedLoading}
						>
							<ZoomProvider zoom={zoom}>
								<LineGrid line={line} />
							</ZoomProvider>
						</DigimonProvider>
					</SearchContext.Provider>
					<CommentLink />
				</>
			:	<p>Line not found</p>}
			<LineNav prev={prev} next={next} type={type} />
			<RelatedLines related={line?.related} />
		</Layout>
	);
};

export async function getStaticPaths() {
	try {
		const lines = thumbsToNames(require('../../../public/json/lines/_index.json'));
		const fusions = thumbsToNames(require('../../../public/json/lines/_fusion.json'));

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

	const lines = thumbsToNames(require('../../../public/json/lines/_index.json'));
	const fusions = thumbsToNames(require('../../../public/json/lines/_fusion.json'));

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

	return {
		props: {
			ssr: {
				name: params.name,
				line,
				prev,
				next,
			},
		},
	};
};

export default PageLine;
