import { StringObject } from '@/types/Ui';

// Icônes d'attribut / de field servies depuis public/images/items : le nom de
// fichier est le slug de la valeur (« Dragon's Roar » -> dragons_roar.png), donc
// ces listes disent seulement quelles valeurs ont une icône. Une valeur absente
// retombe sur son texte.
export const attributeIcons: string[] = [
	'data',
	'free',
	'no_data',
	'unknown',
	'vaccine',
	'variable',
	'virus',
];

export const fieldIcons: string[] = [
	'dark_area',
	'deep_savers',
	'dragons_roar',
	'jungle_troopers',
	'metal_empire',
	'nature_spirits',
	'nightmare_soldiers',
	'virus_busters',
	'wind_guardians',
];

// Attribut déduit du niveau, quand celui-ci le détermine : les Baby I / II n'ont
// pas de donnée d'attribut, les Armor sont Free et les Hybrid sont Variable.
export const levelAttributes: StringObject = {
	'baby i': 'No Data',
	'baby ii': 'No Data',
	armor: 'Free',
	hybrid: 'Variable',
};
