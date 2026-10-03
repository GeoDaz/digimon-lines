import { DigimonGame } from '@/types/GameDigimon';

export const digimonGames: { [key: string]: DigimonGame } = {
	dsts: {
		key: 'dsts',
		title: 'Digimon Story: Time Stranger',
		shortTitle: 'Time Stranger',
		generations: [
			'In-Training I',
			'In-Training II',
			'Rookie',
			'Champion',
			'Ultimate',
			'Mega',
			'Mega +',
			'Armor',
			'Hybrid',
		],
		labels: { generation: 'Stage', attribute: 'Attribute', type: 'Type' },
		extra: { key: 'personality', label: 'Base Personality' },
	},
	dscs: {
		key: 'dscs',
		title: 'Digimon Story: Cyber Sleuth',
		shortTitle: 'Cyber Sleuth',
		generations: [
			'Training 1',
			'Training 2',
			'Rookie',
			'Armor',
			'Champion',
			'Ultimate',
			'Mega',
			'Ultra',
		],
		labels: { generation: 'Stage', attribute: 'Attribute', type: 'Type' },
		typeIcons: true,
		typeFilter: true,
		extra: { key: 'memory', label: 'Memory' },
	},
};
