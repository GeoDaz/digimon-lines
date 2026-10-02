import React, { useEffect, useState } from 'react';
import Link from '@/components/Link';
import { Alert, Spinner } from 'react-bootstrap';
import { GetServerSideProps } from 'next';
import Layout from '@/components/Layout';
import LineViewer from '@/components/Line/LineViewer';
import LikeHeart from '@/components/Account/LikeHeart';
import { useLineLike } from '@/hooks/useCommunityLines';
import { useAuth } from '@/context/auth';
import { getLicence } from '@/context/license';
import imgPathByLicence from '@/functions/images';
import { fetchSharedLine } from '@/functions/userLines';
import { shouldRestoreSession } from '@/functions/supabase';
import { flattenDigimonItems, getDigimonItemLevels } from '@/functions/items';
import { getDubNamesFor } from '@/functions/search';
import transformLine, { lineToArray } from '@/functions/line';
import { Digimon, DigimonItem } from '@/types/Digimon';
import { StringObject } from '@/types/Ui';
import Line from '@/types/Line';
import { UserLineWithAuthor } from '@/types/Account';

interface Props {
	digimons?: { [key: string]: Digimon };
	items?: { [key: string]: DigimonItem };
	itemLevels?: StringObject;
	levels?: string[];
	dubNames?: StringObject;
	pseudo?: string;
	slug?: string;
	record?: UserLineWithAuthor | null;
	serverFailed?: boolean;
}

const PageSharedLine: React.FC<Props> = props => {
	const { pseudo, slug } = props;
	const { user } = useAuth();

	const [record, setRecord] = useState<UserLineWithAuthor | null>(props.record ?? null);
	const [line, setLine] = useState<Line | undefined>(() =>
		props.record ? transformLine(props.record.data as unknown as Line) : undefined
	);
	const [loading, setLoading] = useState(!props.record);
	const [failed, setFailed] = useState(false);
	const like = useLineLike(record?.id, record?.like_count ?? 0);

	useEffect(() => {
		if (props.record) return;
		if (!pseudo || !slug) return;
		if (!props.serverFailed && !shouldRestoreSession()) {
			setLoading(false);
			return;
		}
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
	}, [props.record, props.serverFailed, pseudo, slug]);

	const title = record?.title || 'Shared line';
	const isOwn = !!user && record?.user_id === user.id;
	const licence = getLicence(record?.licence);

	return (
		<Layout
			title={
				<>
					{title} by <Link href={`/profile/${pseudo}`}>{pseudo}</Link>
					{!!record?.is_public && (
						<>
							{' '}
							<LikeHeart
								count={like.count}
								liked={like.liked}
								className="ms-3"
								onClick={isOwn ? undefined : like.toggle}
								title={
									isOwn ?
										`Your line — ${like.count} like${
											like.count > 1 ? 's' : ''
										}`
									:	undefined
								}
							/>
						</>
					)}
				</>
			}
			metatitle={`${title} by ${pseudo}`}
			metadescription={'A Digimon evolution line'}
			metaimg={
				record?.cover ?
					imgPathByLicence[licence.key](record.cover).replace(/^\/images\//, '')
				:	`${licence.key}.png`
			}
		>
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
			:	<LineViewer
					line={line}
					downloadName={slug}
					editName={slug}
					licence={record?.licence}
					shareTitle={title}
					shareText={`An evolution line shared by ${pseudo}`}
					digimons={props.digimons}
					items={props.items}
					itemLevels={props.itemLevels}
					levels={props.levels}
					dubNames={props.dubNames}
				/>
			}
		</Layout>
	);
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ params, res }) => {
	const pseudo = String(params?.pseudo ?? '');
	const slug = String(params?.slug ?? '');

	res.setHeader(
		'Cache-Control',
		'public, max-age=0, s-maxage=60, stale-while-revalidate=300'
	);

	let record: UserLineWithAuthor | null = null;
	let serverFailed = false;
	try {
		const { getServerSupabase } = await import('@/functions/supabaseServer');
		record = await fetchSharedLine(pseudo, slug, await getServerSupabase());
	} catch (e) {
		console.error('Failed to load the shared line on the server:', e);
		serverFailed = true;
	}

	try {
		const digimons = require('../../../../public/json/digimons/index.json');
		const ranked = require('../../../../public/json/digimons/ranked.json');
		const dubNames: StringObject = getDubNamesFor(lineToArray(record?.data as any));
		return {
			props: {
				digimons,
				items: flattenDigimonItems(ranked),
				itemLevels: getDigimonItemLevels(ranked),
				levels: Object.keys(ranked),
				dubNames,
				pseudo,
				slug,
				record,
				serverFailed,
			},
		};
	} catch (e) {
		console.error(e);
		return { props: { pseudo, slug, record, serverFailed } };
	}
};

export default PageSharedLine;
