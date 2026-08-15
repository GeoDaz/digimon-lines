import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Alert, Button, Col, Row, Spinner } from 'react-bootstrap';
import Layout from '@/components/Layout';
import Icon from '@/components/Icon';
import LinePoint from '@/components/Line/LinePoint';
import ShareButton from '@/components/ShareButton';
import PseudoEditor from '@/components/Account/PseudoEditor';
import ButtonAdd from '@/components/Button/ButtonAdd';
import { useProfileLines } from '@/hooks/useUserLines';
import { useAuth } from '@/context/auth';
import { lineToArray } from '@/functions/line';
import { DISCORD_URL, SITE_URL } from '@/consts/env';
import Line from '@/types/Line';
import { UserLineWithAuthor } from '@/types/Account';

interface Props {
	pseudo?: string;
}

/**
 * Page de profil, servant aussi de page « My lines ».
 *
 * C'est littéralement la même vue : la policy RLS ajoute les lignes privées
 * quand le visiteur est le propriétaire, et seules les actions d'édition
 * apparaissent en plus.
 */
const ProfileLines: React.FC<Props> = ({ pseudo }) => {
	const router = useRouter();
	const { lines, isOwner, loading, remove, toggleVisibility } = useProfileLines(pseudo);
	const { profile } = useAuth();

	// Le quota ne concerne que le propriétaire de la page, et n'est affiché que
	// s'il le subit vraiment.
	const isAdmin = !!profile?.is_admin;
	const quota = isOwner ? profile?.line_quota : undefined;
	const quotaReached = !!quota && lines.length >= quota;

	const handleEdit = (line: UserLineWithAuthor) => {
		localStorage.setItem('digimon-line', JSON.stringify(line.data, null, 4));
		router.push(`/build/?name=${encodeURIComponent(line.title || line.slug)}`);
	};

	const handleDelete = (line: UserLineWithAuthor) => {
		if (
			!window.confirm(`Delete "${line.title || line.slug}"? This cannot be undone.`)
		)
			return;
		remove(line.id);
	};

	/**
	 * Les lignes d'avant la couverture retombent sur leur premier Digimon. Peut
	 * rester vide (ligne sans aucun point) : l'appelant doit gérer ce cas, car
	 * LinePoint suppose un nom exploitable.
	 */
	const coverOf = (line: UserLineWithAuthor): string | undefined =>
		line.cover || lineToArray(line.data as unknown as Line)[0];

	const title =
		isOwner ? 'My lines'
		: pseudo ? `Lines by ${pseudo}`
		: 'Lines';

	return (
		<Layout
			title={title}
			metatitle={title}
			metadescription={
				pseudo ? `Evolution lines shared by ${pseudo}` : 'Shared evolution lines'
			}
		>
			{isOwner && !!pseudo && <PseudoEditor pseudo={pseudo} />}
			{!loading && !!quota && (
				<p className={quotaReached ? 'text-warning' : 'text-muted'}>
					<Icon name={quotaReached ? 'exclamation-triangle-fill' : 'archive'} />{' '}
					{lines.length} / {quota} lines.{' '}
				</p>
			)}
			{loading ?
				<Spinner animation="border" role="status" aria-label="Loading" />
			: !lines.length ?
				<p>
					{isOwner ?
						<>
							You have not saved any line yet.{' '}
							<Link href="/build">Build your first one</Link>, then use{' '}
							<b>Save</b>.
						</>
					:	<>{pseudo} has not published any line yet.</>}
				</p>
			:	<div className="line-wrapper">
					<Row className="line-row">
						{lines.map(line => {
							const cover = coverOf(line);
							const caption = (
								<span className="absolute-legend">
									{(isOwner || isAdmin) && (
										<Icon
											name={line.is_public ? 'globe' : 'lock'}
											title={
												line.is_public ? 'Published' : 'Private'
											}
										/>
									)}{' '}
									{line.title || line.slug}
								</span>
							);
							return (
								<Col key={line.id} className="profile-line">
									{
										cover ?
											<LinePoint
												name={cover}
												href={`/profile/${pseudo}/${line.slug}`}
												label={line.title || line.slug}
												available
											>
												{caption}
											</LinePoint>
											// Ligne sans aucun point : pas d'image à montrer.
										:	<Link
												href={`/profile/${pseudo}/${line.slug}`}
												title={line.title || line.slug}
												className="line-point pictured available"
											>
												{caption}
											</Link>

									}
									{isOwner && (
										<div className="profile-line-actions">
											<Button
												size="sm"
												variant={'primary'}
												title={
													line.is_public ?
														'Published — click to make it private'
													:	'Private — click to publish it'
												}
												onClick={() =>
													toggleVisibility(
														line.id,
														!line.is_public
													)
												}
											>
												<Icon
													name={
														line.is_public ? 'globe' : 'lock'
													}
												/>
											</Button>{' '}
											<Button
												size="sm"
												variant="primary"
												title="Edit in builder"
												onClick={() => handleEdit(line)}
											>
												<Icon name="pencil-fill" />
											</Button>{' '}
											<ShareButton
												compact
												size="sm"
												variant={
													line.is_public ? 'primary' : 'outline'
												}
												disabled={!line.is_public}
												title={line.title || line.slug}
												text={`An evolution line shared by ${pseudo}`}
												url={`${SITE_URL}/profile/${pseudo}/${line.slug}`}
											/>{' '}
											<Button
												size="sm"
												variant="outline-danger"
												title="Delete"
												onClick={() => handleDelete(line)}
											>
												<Icon name="trash3-fill" />
											</Button>
										</div>
									)}
									{!isOwner && line.is_public && (
										<div className="profile-line-actions">
											<ShareButton
												compact
												size="sm"
												title={line.title || line.slug}
												text={`An evolution line shared by ${pseudo}`}
												url={`${SITE_URL}/profile/${pseudo}/${line.slug}`}
											/>
										</div>
									)}
								</Col>
							);
						})}
						{isOwner && (
							<Col className="profile-line">
								<ButtonAdd
									as={Link}
									href="/build"
									title="Build a new line"
								/>
							</Col>
						)}
					</Row>
				</div>
			}
			{!loading && !isOwner && !!lines.length && (
				<Alert variant="dark" className="mt-4">
					Want your own? <Link href="/build">Build a line</Link> and save it to
					your account.
				</Alert>
			)}
		</Layout>
	);
};

export default ProfileLines;
