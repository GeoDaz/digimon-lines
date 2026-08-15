import React from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { CONTACT_EMAIL, DISCORD_URL, LEGAL_UPDATED_AT, SITE_URL } from '@/consts/env';

const PagePrivacy = () => (
	<Layout
		title="Privacy Policy"
		metatitle="Privacy Policy"
		metadescription="How Digimon Lines handles your account data and the lines you create."
	>
		<p className="text-muted">Last updated: {LEGAL_UPDATED_AT}</p>

		<p>
			Digimon Lines is a free, non-commercial fan project available at{' '}
			<Link href="/">{SITE_URL}</Link>. This page explains exactly what data we
			collect, why, and what you can do about it. We collect as little as possible:
			you can browse the entire site, including every line published on it, without
			an account and without giving us anything.
		</p>

		<h2>1. What we collect</h2>

		<h3>If you create an account</h3>
		<p>
			Accounts exist only so you can save your own lines and share them. You sign in
			through Google or Discord — we never see or store a password. From your
			provider we receive and store:
		</p>
		<ul>
			<li>your email address (used to identify your account, never displayed publicly);</li>
			<li>your display name, which becomes your public pseudonym;</li>
			<li>your avatar image URL, if your provider supplies one;</li>
			<li>a provider account identifier.</li>
		</ul>

		<h3>The lines you create</h3>
		<p>
			The content of each line you save, its title, and whether you marked it public
			or private. A private line is not visible to other users — this is enforced at
			the database level, not merely hidden in the interface. The site
			administrators can read it, so that they can moderate content when it is
			reported to them.
		</p>

		<h3>Audience measurement</h3>
		<p>
			We use Vercel Analytics, which counts page views without cookies, without
			advertising identifiers, and without building a profile of you. It does not
			track you across other websites.
		</p>

		<h2>2. What we never do</h2>
		<ul>
			<li>We do not sell, rent, or share your data with advertisers.</li>
			<li>We do not run advertising or third-party ad trackers.</li>
			<li>
				We do not handle payment data. Donations go through Ko-fi, on their own
				site and under their own privacy policy.
			</li>
		</ul>

		<h2>3. Cookies and local storage</h2>
		<p>
			We set no advertising or analytics cookies. When you sign in, your session
			token is kept in your browser&apos;s local storage so you stay logged in. It is
			strictly necessary for the account feature and is removed when you sign out.
		</p>

		<h2>4. Where your data is stored</h2>
		<p>
			Accounts and lines are stored in a PostgreSQL database hosted by Supabase in
			the <strong>Canada Central</strong> region. The site itself is served by
			Netlify&apos;s content delivery network from the location nearest to you.
		</p>
		<p>
			For visitors in the European Economic Area: Canada benefits from a European
			Commission adequacy decision, so this transfer does not require additional
			safeguards on your part.
		</p>

		<h2>5. Why we are allowed to process it (EEA/UK visitors)</h2>
		<ul>
			<li>
				<strong>Account and lines</strong> — performance of a contract: we cannot
				save your lines without storing them.
			</li>
			<li>
				<strong>Aggregate analytics</strong> — legitimate interest in knowing
				whether the site works and is used, using data that does not identify you.
			</li>
		</ul>

		<h2>6. How long we keep it</h2>
		<p>
			Your account and lines are kept until you ask us to delete them. Deleting your
			account erases your profile and every line attached to it, including public
			ones. Deletion from the live database is immediate and permanent. Residual
			copies may persist briefly in our host&apos;s routine backups before those
			rotate out.
		</p>

		<h2>7. Your rights</h2>
		<p>
			You can ask us to access, correct, export, or delete your data, and object to
			its processing. Write to{' '}
			<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or contact us on our{' '}
			<a href={DISCORD_URL} target="_blank" rel="noreferrer">
				Discord server
			</a>
			. We answer within 30 days. If you are in the EEA and believe we have mishandled
			your data, you may lodge a complaint with your national data protection
			authority.
		</p>

		<h2>8. Children</h2>
		<p>
			The site is open to everyone, but accounts are not intended for children under
			13 (or under 16 in some EEA countries). If you believe a child has created an
			account, contact us and we will remove it.
		</p>

		<h2>9. Third parties we rely on</h2>
		<ul>
			<li>
				<strong>Supabase</strong> — database and authentication.
			</li>
			<li>
				<strong>Netlify</strong> — hosting and content delivery.
			</li>
			<li>
				<strong>Google and Discord</strong> — sign-in providers, only if you choose
				to use them.
			</li>
			<li>
				<strong>Vercel Analytics</strong> — cookieless audience measurement.
			</li>
		</ul>
		<p>
			Some Digimon artwork is loaded directly from external sources by your browser,
			which means those servers can see your IP address, as with any image on the web.
		</p>

		<h2>10. Changes</h2>
		<p>
			If we change this policy in a way that affects you, we will update the date at
			the top of this page and announce it on our Discord server.
		</p>

		<h2>11. Contact</h2>
		<p>
			<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
		</p>

		<p className="mt-4">
			See also our <Link href="/terms">Terms of Service</Link>.
		</p>
	</Layout>
);

export default PagePrivacy;
