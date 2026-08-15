import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert, Button, Form, Spinner, Table } from 'react-bootstrap';
import Layout from '@/components/Layout';
import Icon from '@/components/Icon';
import { useAuth } from '@/context/auth';
import { useToast } from '@/context/toast';
import { AdminProfile, listAdminProfiles, setLineQuota } from '@/functions/admin';

const PageAdmin = () => {
	const { profile, loading: authLoading, enabled } = useAuth();
	const { addToast } = useToast();

	const [profiles, setProfiles] = useState<AdminProfile[]>([]);
	const [loading, setLoading] = useState(true);
	const [drafts, setDrafts] = useState<Record<string, string>>({});
	const [savingId, setSavingId] = useState<string | null>(null);
	const [search, setSearch] = useState('');
	/** Terme réellement envoyé : on ne requête pas à chaque frappe. */
	const [query, setQuery] = useState('');

	const isAdmin = !!profile?.is_admin;

	const reload = useCallback(async () => {
		setLoading(true);
		try {
			const rows = await listAdminProfiles(query);
			setProfiles(rows);
			setDrafts(
				rows.reduce<Record<string, string>>((acc, row) => {
					acc[row.id] = String(row.line_quota);
					return acc;
				}, {})
			);
		} catch (error) {
			console.error('Failed to load the profiles:', error);
			addToast('Failed to load the profiles', 'danger');
		} finally {
			setLoading(false);
		}
	}, [addToast, query]);

	useEffect(() => {
		if (authLoading) return;
		if (!isAdmin) {
			setLoading(false);
			return;
		}
		reload();
	}, [authLoading, isAdmin, reload]);

	const handleSaveQuota = async (row: AdminProfile) => {
		const quota = Number(drafts[row.id]);
		if (!Number.isInteger(quota) || quota < 0 || quota > 10000) {
			addToast('The quota must be a whole number between 0 and 10000', 'warning');
			return;
		}
		setSavingId(row.id);
		try {
			await setLineQuota(row.id, quota);
			setProfiles(prev =>
				prev.map(p => (p.id === row.id ? { ...p, line_quota: quota } : p))
			);
			addToast(`Quota for ${row.pseudo} set to ${quota}`);
		} catch (error) {
			console.error('Failed to update the quota:', error);
			addToast('Failed to update the quota', 'danger');
		} finally {
			setSavingId(null);
		}
	};

	if (!enabled || (!authLoading && !isAdmin)) {
		return (
			<Layout title="Administration" metatitle="Administration">
				<Alert variant="warning">
					This page is reserved for administrators.{' '}
					<Link href="/">Back to the lines</Link>.
				</Alert>
			</Layout>
		);
	}

	const totalLines = profiles.reduce((sum, p) => sum + Number(p.line_count), 0);

	return (
		<Layout
			title="Administration"
			metatitle="Administration"
			metadescription="Accounts and saved line quotas."
		>
			<Form
				className="d-flex gap-2 mb-3"
				onSubmit={e => {
					e.preventDefault();
					setQuery(search);
				}}
			>
				<Form.Control
					type="search"
					value={search}
					placeholder="Search a pseudonym or an email"
					aria-label="Search a pseudonym or an email"
					onChange={e => {
						setSearch(e.target.value);
						// Un champ vidé remet la liste complète sans avoir à valider.
						if (!e.target.value) setQuery('');
					}}
				/>
				<Button type="submit" variant="primary" title="Search">
					<Icon name="search" />
				</Button>
			</Form>
			{loading || authLoading ?
				<Spinner animation="border" role="status" aria-label="Loading" />
			: !profiles.length ?
				<p className="text-muted">No account matches “{query}”.</p>
			:	<>
					<p className="text-muted">
						{profiles.length} account{profiles.length > 1 ? 's' : ''} ·{' '}
						{totalLines} saved line{totalLines > 1 ? 's' : ''}. Raise a quota
						to let someone save more lines.
					</p>
					<Table responsive hover className="align-middle">
						<thead>
							<tr>
								<th>Account</th>
								<th>Sign-in</th>
								<th>Lines</th>
								<th>Published</th>
								<th>Joined</th>
								<th>Quota</th>
							</tr>
						</thead>
						<tbody>
							{profiles.map(row => (
								<tr key={row.id}>
									<td>
										<Link href={`/profile/${row.pseudo}`}>
											{row.pseudo}
										</Link>
										{row.is_admin && (
											<>
												{' '}
												<Icon
													name="shield-fill-check"
													title="Administrator"
													className="text-primary"
												/>
											</>
										)}
										<br />
										<small className="text-muted break-word">
											{row.email}
										</small>
									</td>
									<td className="text-nowrap">
										{/* Plusieurs providers = identités liées sur la
										    même adresse, donc un seul compte. */}
										{(row.providers || '—')
											.split(', ')
											.map(provider => (
												<Icon
													key={provider}
													name={
														provider === 'google' ? 'google'
														: provider === 'discord' ?
															'discord'
														:	'envelope'
													}
													title={provider}
													className="me-2"
												/>
											))}
									</td>
									<td>
										{Number(row.line_count)} / {row.line_quota}
									</td>
									<td>{Number(row.public_count)}</td>
									<td>
										{new Date(row.created_at).toLocaleDateString()}
									</td>
									<td className="text-nowrap">
										<Form.Control
											type="number"
											min={0}
											max={10000}
											className="d-inline-block width-auto"
											style={{ width: 90 }}
											value={drafts[row.id] ?? ''}
											onChange={e =>
												setDrafts(prev => ({
													...prev,
													[row.id]: e.target.value,
												}))
											}
										/>{' '}
										<Button
											size="sm"
											variant="primary"
											title="Apply the new quota"
											disabled={
												savingId === row.id ||
												drafts[row.id] === String(row.line_quota)
											}
											onClick={() => handleSaveQuota(row)}
										>
											<Icon name="check-lg" />
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</Table>
					<p className="text-muted">
						This table only shows counts. To read someone&apos;s lines,
						including the unpublished ones, open their profile — an
						administrator right that the{' '}
						<Link href="/privacy">Privacy Policy</Link> discloses.
					</p>
				</>
			}
		</Layout>
	);
};

export default PageAdmin;
