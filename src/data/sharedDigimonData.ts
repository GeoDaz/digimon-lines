// Données communes à toutes les pages qui affichent des digimons : fiches,
// relations (ranked), noms doublés et liste des images.
//
// Ce module n'est chargé que par un import() dynamique (hooks/useSharedDigimonData) :
// webpack en fait un chunk à part, nommé d'après un hash de son contenu et servi
// depuis /_next/static (Cache-Control immutable, mis en cache par Cloudflare).
// Il est donc téléchargé une fois par visiteur et par version des données, au
// lieu d'être répété dans le HTML / le /_next/data de chaque page.
import { Digimon, DigimonItem } from '@/types/Digimon';
import { StringObject } from '@/types/Ui';

export interface RawSharedDigimonData {
	digimons: { [name: string]: Digimon };
	ranked: { [level: string]: { [name: string]: DigimonItem } };
	names: string[];
	dubNames: StringObject;
}

const { names, dubNames } = require('./digimonNames');

const data: RawSharedDigimonData = {
	digimons: require('../../public/json/digimons/index.json'),
	ranked: require('../../public/json/digimons/ranked.json'),
	names,
	dubNames,
};

export default data;
