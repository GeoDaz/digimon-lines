import { DIGIEGG, DIGIMON, GROUP } from '@/consts/ui';
import { formatPokemonFileName } from './file';

const imgDirs = [DIGIMON, GROUP, DIGIEGG];

const imgPathByLicence: Record<string, CallableFunction> = {
	digimon: (name: string, type: string) =>
		`/images/${imgDirs.includes(type) ? type : 'digimon'}/${name}.jpg`,
	pokemon: (name: string) =>
		`https://coupcritique.fr/images/pokemons/${formatPokemonFileName(name)}.png`,
};

export default imgPathByLicence;
