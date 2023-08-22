import React from 'react';
import { legend } from '@/consts/colors';
import Icon from './Icon';
import Popup from './Popup';

const ColorLegend: React.FC = () => (
	<div className="color-legend ms-3">
		<p className="mb-1">Legend&nbsp;:</p>
		<div className="legend">
			{legend.map(({ color, text }, i) => (
				<Popup
					key={i}
					trigger={
						<span className="d-inline-block me-3">
							<Icon
								name="circle-fill"
								className="click"
								style={{ color }}
							/>
						</span>
					}
				>
					<span>{text}</span>
				</Popup>
			))}
		</div>
	</div>
);
export default ColorLegend;
