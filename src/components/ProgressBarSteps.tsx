import React from 'react';
import { makeClassName } from '@/functions';
import Option from '@/types/Option';

interface Props {
	onChange: Function;
	steps: Array<Option>;
	selected: number | string;
	progress?: number;
	className?: string;
}
const ProgressBarSteps: React.FC<Props> = ({
	onChange,
	steps,
	selected,
	progress,
	className,
}) => (
	<div className={makeClassName('progress-bar', className)}>
		<div className="progress" style={{ width: `calc(${progress}% - 40px)` }} />
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
