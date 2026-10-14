import React from 'react';
import LinePoint from '@/components/Line/LinePoint';
import Icon from '@/components/Icon';
import { LINE } from '@/consts/ui';
import { VbThumb } from '@/types/Line';

type NavTarget = string | VbThumb | null;

interface Props {
	prev?: NavTarget;
	next?: NavTarget;
	type?: string;
}

const targetProps = (target: string | VbThumb) =>
	typeof target === 'string' ?
		{ name: target }
	:	{ name: target.digimon, line: target.name, label: target.title };

/** Links to the previous and the next entry of the index list. */
const LineNav: React.FC<Props> = ({ prev, next, type = LINE }) => {
	if (!prev && !next) return null;
	return (
		<div className="row mb-4">
			<div className="col-6 d-flex justify-content-start">
				{!!prev && (
					<LinePoint className="move-link" {...targetProps(prev)} type={type}>
						<span className="absolute-legend">
							<Icon name="arrow-left-circle-fill" /> Previous
						</span>
					</LinePoint>
				)}
			</div>
			<div className="col-6 d-flex justify-content-end">
				{!!next && (
					<LinePoint {...targetProps(next)} className="move-link" type={type}>
						<span className="absolute-legend">
							Next <Icon name="arrow-right-circle-fill" />
						</span>
					</LinePoint>
				)}
			</div>
		</div>
	);
};

export default LineNav;
