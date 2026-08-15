import React from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { CONTACT_EMAIL, DISCORD_URL, LEGAL_UPDATED_AT, SITE_URL } from '@/consts/env';

const PageTerms = () => (
	<Layout
		title="Terms of Service"
		metatitle="Terms of Service"
		metadescription="The rules for using Digimon Lines and for sharing the lines you create."
	>
		<p className="text-muted">Last updated: {LEGAL_UPDATED_AT}</p>

		<p>
			These terms govern your use of Digimon Lines at{' '}
			<Link href="/">{SITE_URL}</Link>. By using the site you accept them. If you do
			not, please do not use the site.
		</p>

		<h2>1. What this service is</h2>
		<p>
			Digimon Lines is a free, non-commercial fan project that lets you browse and
			build evolution lines. There is no paid tier and no advertising. Donations are
			voluntary and buy no rights, guarantees, or priority of any kind.
		</p>

		<h2>2. Accounts</h2>
		<p>
			You need an account only to save and share your own lines. Signing in through
			Google or Discord also means respecting their own terms. You are responsible
			for what happens under your account, and you must not impersonate someone else
			or pick a pseudonym designed to do so. One person, one account.
		</p>

		<h2>3. The lines you create</h2>
		<p>
			<strong>Your lines remain yours.</strong> We claim no ownership over what you
			build. You simply grant us the permission we technically need to run the
			service: to store your lines, display them back to you, and — if and only if
			you mark a line public — display it to other visitors.
		</p>
		<p>
			This permission ends when you delete the line or your account. Copies that
			other people have already downloaded or exported are, of course, beyond our
			reach.
		</p>

		<h2>4. Public and private lines</h2>
		<p>
			A private line is visible only to you. A public line is visible to{' '}
			<strong>anyone with the link</strong>, may be listed on the site, and may be
			indexed by search engines. Treat publishing as permanent: assume a public line
			can be seen, saved, and shared by anyone once it is out.
		</p>

		<h2>5. Acceptable use</h2>
		<p>You agree not to:</p>
		<ul>
			<li>
				publish content that is illegal, hateful, harassing, sexually explicit, or
				that targets an individual;
			</li>
			<li>upload content you do not have the right to use;</li>
			<li>
				attempt to access other users&apos; private data, or probe, overload, or
				disrupt the site or its database;
			</li>
			<li>
				automate bulk requests or scrape the site in a way that degrades it for
				others.
			</li>
		</ul>
		<p>
			Accounts are limited to a number of saved lines, shown to you when you reach
			it. The limit exists to keep our free database within its storage budget, and
			we raise it gladly on request — just ask.
		</p>

		<h2>6. Moderation</h2>
		<p>
			We may remove content or suspend an account that breaks these terms. Where it
			is reasonable to do so we will tell you why, and you can reply to us at the
			address below. For anything not clear-cut, we would rather talk to you than
			delete first.
		</p>

		<h2>7. Intellectual property</h2>
		<p>
			Digimon, Digital Monsters, and all related names, characters, and images are
			trademarks or registered trademarks of Bandai Co., Ltd. © Bandai. Digimon Lines
			is not affiliated with, sponsored, endorsed, or approved by Bandai Co., Ltd.,
			Toei Animation, or any of their subsidiaries or affiliates. Franchise material
			is used here in a non-commercial fan context.
		</p>

		<h2>8. Availability and warranty</h2>
		<p>
			The site is provided &quot;as is&quot;, free of charge, with no guarantee of
			availability, accuracy, or data preservation. It runs on free and low-cost
			infrastructure and may be interrupted, changed, or discontinued. Export
			anything you would be upset to lose.
		</p>

		<h2>9. Liability</h2>
		<p>
			To the fullest extent permitted by law, we are not liable for indirect or
			consequential damages arising from your use of the site, including lost
			content. Nothing here limits liability that cannot lawfully be limited, and
			your statutory rights as a consumer are unaffected.
		</p>

		<h2>10. Ending your use</h2>
		<p>
			You may delete your account at any time; see our{' '}
			<Link href="/privacy">Privacy Policy</Link> for what that erases. We may close
			an account that seriously or repeatedly breaks these terms.
		</p>

		<h2>11. Changes</h2>
		<p>
			These terms may change. The date at the top of this page reflects the latest
			revision, and significant changes are announced on our{' '}
			<a href={DISCORD_URL} target="_blank" rel="noreferrer">
				Discord server
			</a>
			.
		</p>

		<h2>12. Governing law</h2>
		<p>
			These terms are governed by French law. If you are a consumer, this does not
			deprive you of the protections of your own country&apos;s mandatory law.
		</p>

		<h2>13. Contact</h2>
		<p>
			<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
		</p>
	</Layout>
);

export default PageTerms;
