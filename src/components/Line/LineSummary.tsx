import React from 'react';
import Link from '@/components/Link';
import type { LineSummary as Summary, SummaryMember } from '@/functions/lineSummary';
import { listNames } from '@/functions/seo';

interface Props {
	summary: Summary;
	heading: string;
	intro: string;
}

const MemberName: React.FC<{ member: SummaryMember }> = ({ member }) =>
	member.game ?
		<Link
			href={`/games/${member.game.key}/${member.game.slug}`}
			title={`${member.label} in ${member.game.title}`}
		>
			{member.label}
		</Link>
	:	<>{member.label}</>;

const LineSummary: React.FC<Props> = ({ summary, heading, intro }) => (
	<section className="line-summary">
		<h2>{heading}</h2>
		<p>{intro}</p>
		<ul className="line-summary-levels">
			{summary.levels.map(level => (
				<li key={level.level}>
					<strong>{level.level}</strong> ({level.members.length}):{' '}
					{level.members.map((member, i) => (
						<React.Fragment key={member.name}>
							{i > 0 && ', '}
							<MemberName member={member} />
						</React.Fragment>
					))}
				</li>
			))}
		</ul>
		{!!summary.evolutions.length && (
			<details className="line-summary-evolutions">
				<summary>
					<h3>Digivolutions ({summary.evolutions.length})</h3>
				</summary>
				<ul>
					{summary.evolutions.map(evolution => (
						<li key={evolution.label}>
							{evolution.label} digivolves into {listNames(evolution.to)}.
						</li>
					))}
				</ul>
			</details>
		)}
	</section>
);

export default LineSummary;
