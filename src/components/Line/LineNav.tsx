import React from 'react';
import LinePoint from '@/components/Line/LinePoint';
import Icon from '@/components/Icon';
import { LINE } from '@/consts/ui';

interface Props {
	prev?: string | null;
	next?: string | null;
	type?: string;
}
/** Links to the previous and the next entry of the index list. */
const LineNav: React.FC<Props> = ({ prev, next, type = LINE }) => {
	if (!prev && !next) return null;
	return (
		<div className="row mb-4">
			<div className="col-6 d-flex justify-content-start">
				{!!prev && (
					<LinePoint className="move-link" name={prev} type={type}>
						<span className="absolute-legend">
							<Icon name="arrow-left-circle-fill" /> Previous
						</span>
					</LinePoint>
				)}
			</div>
			<div className="col-6 d-flex justify-content-end">
				{!!next && (
					<LinePoint name={next} className="move-link" type={type}>
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
