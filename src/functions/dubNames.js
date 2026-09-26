// Noms doublés (dub) des digimons et liste de recherche qui en découle.
//
// Écrit en JS pur pour être partagé entre les pages (via src/functions/search.ts)
// et le loader webpack cmd/sharedDataLoader.js, qui les précalcule au build.

/**
 * Noms doublés dans les deux sens (jap -> dub et dub -> jap), complétés par les
 * noms composés : si greymon a un nom doublé, greymon_x en reçoit un aussi.
 *
 * @param {Record<string, string>} baseDubNames contenu de public/json/dubnames.json
 * @param {string[]} nameList noms des images de public/images/digimon
 * @returns {Record<string, string>}
 */
const computeDubNames = (baseDubNames, nameList) => {
	const dubNames = {
		...baseDubNames,
		...Object.fromEntries(Object.entries(baseDubNames).map(([k, v]) => [v, k])),
	};
	nameList.forEach(name => {
		const dubName = dubNames[name];
		if (!dubName) return;
		nameList.forEach(subName => {
			if (
				subName != name &&
				!dubNames[subName] &&
				subName.match(`(^|_)${name}(_|$)`)
			) {
				const subDubName = subName.replace(name, dubName);
				dubNames[subName] = subDubName;
			}
		});
	});
	return dubNames;
};

/**
 * Ajoute (en place) le sens inverse de chaque entrée.
 *
 * @param {Record<string, string>} dubList
 * @returns {Record<string, string>}
 */
const addReverseDubNames = dubList => {
	Object.entries(dubList).forEach(([key, value]) => {
		dubList[value] = key;
	});
	return dubList;
};

/**
 * Liste de recherche : chaque nom pointe sur lui-même, chaque nom doublé sur le
 * nom d'origine. Ne modifie pas dubList.
 *
 * @param {string[]} baseSearchList
 * @param {Record<string, string>} dubList
 * @returns {{ mapped: Record<string, string>, values: string[], keys: string[] }}
 */
const buildSearchList = (baseSearchList, dubList) =>
	baseSearchList.reduce(
		(result, name) => {
			// self map
			result.mapped[name] = name;

			// dub map
			const dubName = dubList[name];
			if (!dubName) return result;
			if (result.mapped[dubName]) return result;

			result.mapped[dubName] = name;
			result.keys.push(dubName);
			return result;
		},
		{
			mapped: /** @type {Record<string, string>} */ ({}),
			values: baseSearchList.slice(),
			keys: baseSearchList.slice(),
		}
	);

module.exports = {
	computeDubNames,
	addReverseDubNames,
	buildSearchList,
};
