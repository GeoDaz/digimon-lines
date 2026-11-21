import { RangeOptions } from '@/components/Field/Range';

export const consistencyLevels: RangeOptions = {
	0: { disabled: false, text: 'Full randomness' },
	1: { disabled: false, text: 'Low consistency' },
	2: { disabled: false, text: 'Medium consistency' },
	3: { disabled: true, text: 'High consistency' },
	4: { disabled: true, text: 'Random deck list' },
};
