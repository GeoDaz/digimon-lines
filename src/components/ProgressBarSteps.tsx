import React from 'react';
import { makeClassName } from '@/functions';
import { Option } from '@/types/Ui';

interface Props {
	onChange: Function;
	steps: Option[];
	selected: number | string;
	index: number;
	className?: string;
	title?: string;
}
const ProgressBarSteps: React.FC<Props> = ({
	onChange,
	steps,
	selected,
	index,
	className,
	title,
}) => (
	<div className={makeClassName('progress-bar', className)} title={title}>
		<div
			className="progress"
			style={{ width: `calc(${index} * var(--progress-bar-step-width))` }}
		/>
		{steps.map(step => (
			<div
				key={step.key}
				className={'step ' + (selected >= step.key ? 'selected' : '')}
				onClick={e => onChange(step.key)}
			>
				<span className="legend">{step.value} %</span>
			</div>
		))}
	</div>
);
export default ProgressBarSteps;
