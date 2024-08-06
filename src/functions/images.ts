import { DIGIEGG, DIGIMON, GROUP } from '@/consts/ui';

const imgDirs = [DIGIMON, GROUP, DIGIEGG];

export const formatPokemonFileName = (string: string) =>
	string
		.normalize('NFD')
		.replace(/(\s+)/g, '-')
		.replace(/[.'’:?%\u0300-\u036f]|-(t|T)otem|-(a|A)ntique/g, '')
		.toLowerCase();

const imgPathByLicence: Record<string, CallableFunction> = {
	digimon: (name: string, type: string) =>
		`/images/${imgDirs.includes(type) ? type : 'digimon'}/${name}.jpg`,
	pokemon: (name: string) =>
		`https://coupcritique.fr/images/pokemons/${formatPokemonFileName(name)}.png`,
};

export default imgPathByLicence;
