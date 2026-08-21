// Relation mirroring for public/json/digimons/ranked.json.
//
// A relation between two digimons is stored on both sides: forward on the source
// (`to`, `x`, `armors`), backward on the target (`from`, or `fusionFrom` when the
// target is a fusion), and on both entries for the variants. Both sides are kept
// in the file (instead of deriving one of them at runtime) so the list stays cheap
// to render, which means every write has to update both of them.
//
// Written in plain JS so the cmd/ maintenance scripts can require it directly,
// the same helpers being used by the dev-only /api/*-digimon routes.

// Relations declaring an evolution on the source. They are all mirrored the same
// way, by a backward relation on the target.
const FORWARD_KEYS = ['to', 'x', 'armors'];

// A forward relation is mirrored by either of these, never by both: a fusion
// keeps `fusionFrom` as its backward side.
const BACKWARD_KEYS = ['from', 'fusionFrom'];

// A mode goes with a `modes` or with a `from` on the other side depending on the
// digimon, so the mirroring never writes it. It is still read as a forward
// relation, so that a `from` explained by a mode doesn't grow a `to`.
const READONLY_FORWARD_KEYS = ['modes'];

// Relations mirrored by the same key on the other side.
const SYMMETRIC_KEYS = ['variants'];

// Every key holding names of other digimons, mirrored or not: they all have to
// follow a rename or a deletion.
const RELATION_KEYS = FORWARD_KEYS.concat(
	READONLY_FORWARD_KEYS,
	BACKWARD_KEYS,
	SYMMETRIC_KEYS
);

// Key the mirroring writes when a side is missing.
const DEFAULT_FORWARD_KEY = 'to';
const DEFAULT_BACKWARD_KEY = 'from';

// Key order applied to every entry we rewrite, matching the DigimonItem type.
const KEY_ORDER = ['name', 'variants', 'modes', 'x', 'armors', 'from', 'fusionFrom', 'to'];

const relations = (item, key) => (Array.isArray(item[key]) ? item[key] : []);

const hasRelation = (item, key, name) => relations(item, key).includes(name);

const hasAnyRelation = (item, keys, name) =>
	keys.some(key => hasRelation(item, key, name));

// Whether `item` already declares `name` as one of its evolutions, whichever key
// holds it. A mode counts, even though the mirroring never writes one.
const hasForwardRelation = (item, name) =>
	hasAnyRelation(item, FORWARD_KEYS.concat(READONLY_FORWARD_KEYS), name);

// Whether `item` already declares coming from `name`.
const hasBackwardRelation = (item, name) => hasAnyRelation(item, BACKWARD_KEYS, name);

const addRelation = (item, key, name) => {
	if (item.name === name || hasRelation(item, key, name)) return false;
	item[key] = relations(item, key).concat(name);
	return true;
};

const removeRelation = (item, key, name) => {
	if (!hasRelation(item, key, name)) return false;
	const next = relations(item, key).filter(value => value !== name);
	if (next.length) {
		item[key] = next;
	} else {
		delete item[key];
	}
	return true;
};

// Names listed twice or pointing at the digimon itself, which a hand edit or two
// saves racing each other can leave behind.
const spuriousRelations = item =>
	RELATION_KEYS.reduce((list, key) => {
		relations(item, key).forEach((value, i, values) => {
			if (value === item.name || values.indexOf(value) !== i) {
				list.push({ key, value });
			}
		});
		return list;
	}, []);

// Rebuild an entry with its keys in the canonical order and without any spurious
// relation, so entries edited by an API call keep the same shape as the rest of
// the file.
const normalizeItem = item => {
	const next = {};
	const copy = key => {
		if (item[key] === undefined) return;
		next[key] = RELATION_KEYS.includes(key)
			? relations(item, key).filter(
					(value, i, values) =>
						value !== item.name && values.indexOf(value) === i
				)
			: item[key];
		if (Array.isArray(next[key]) && !next[key].length) delete next[key];
	};
	KEY_ORDER.forEach(copy);
	Object.keys(item).forEach(key => {
		if (next[key] === undefined) copy(key);
	});
	return next;
};

/**
 * Three way merge of the relations of one entry.
 *
 * The editors send the whole entry, built from the list they loaded: an entry
 * mirrored since then holds relations their copy doesn't know about, and saving
 * it as is would drop them (and, through the mirroring, the opposite side too).
 * So the submitted relations are only trusted for what they change compared to
 * `baseItem`, the entry the edit started from: a name it dropped is removed, and
 * a name `storedItem` gained meanwhile is kept.
 *
 * `baseItem` is what the client had, `storedItem` what the file holds now. Pass
 * nothing as `baseItem` to take `item` as is.
 */
const mergeItemRelations = (storedItem, item, baseItem) => {
	if (!baseItem) return normalizeItem(item);
	const merged = { ...item };
	RELATION_KEYS.forEach(key => {
		const submitted = relations(item, key);
		const removed = relations(baseItem, key).filter(
			value => !submitted.includes(value)
		);
		// Names the file gained since the client loaded it, minus the ones this
		// edit removed on purpose.
		const gained = relations(storedItem, key).filter(
			value => !submitted.includes(value) && !removed.includes(value)
		);
		if (!gained.length) return;
		merged[key] = submitted.concat(gained);
	});
	return normalizeItem(merged);
};

// name -> { level, item } lookup over the whole ranked list.
const indexItems = ranked => {
	const index = {};
	Object.keys(ranked).forEach(level => {
		Object.keys(ranked[level]).forEach(name => {
			index[name] = { level, item: ranked[level][name] };
		});
	});
	return index;
};

const rewriteItems = (ranked, index, names) => {
	names.forEach(name => {
		const entry = index[name];
		if (!entry) return;
		ranked[entry.level][name] = normalizeItem(entry.item);
	});
};

/**
 * Mirror every relation of the entry named `name` onto the other entries.
 *
 * `previousItem` is the entry as it was stored before the edit: the relations it
 * held and the new one doesn't are removed from the other side as well. Pass
 * nothing when the entry is new; its incoming relations are picked up either way.
 *
 * The entry must already be placed in `ranked`. Returns the names of every entry
 * changed by the mirroring, `name` included when its own arrays were completed.
 */
const syncRelations = (ranked, name, previousItem) => {
	const index = indexItems(ranked);
	const entry = index[name];
	if (!entry) return [];
	const item = entry.item;
	const changed = new Set();

	// Relations dropped by this edit: remove the now orphan opposite side first,
	// so the incoming pass below doesn't restore them.
	if (previousItem) {
		FORWARD_KEYS.forEach(key => {
			relations(previousItem, key).forEach(target => {
				if (!index[target]) return;
				// Keep the mirror while another forward key still holds the target.
				if (hasForwardRelation(item, target)) return;
				BACKWARD_KEYS.forEach(backward => {
					if (removeRelation(index[target].item, backward, name)) {
						changed.add(target);
					}
				});
			});
		});
		BACKWARD_KEYS.forEach(key => {
			relations(previousItem, key).forEach(source => {
				if (!index[source]) return;
				// Keep the mirror while the other backward key still holds the source.
				if (hasBackwardRelation(item, source)) return;
				FORWARD_KEYS.forEach(forward => {
					if (removeRelation(index[source].item, forward, name)) {
						changed.add(source);
					}
				});
			});
		});
		SYMMETRIC_KEYS.forEach(key => {
			relations(previousItem, key).forEach(other => {
				if (hasRelation(item, key, other) || !index[other]) return;
				if (removeRelation(index[other].item, key, name)) changed.add(other);
			});
		});
	}

	// Relations held by this entry: complete the opposite side.
	FORWARD_KEYS.forEach(key => {
		relations(item, key).forEach(target => {
			if (!index[target] || hasBackwardRelation(index[target].item, name)) return;
			if (addRelation(index[target].item, DEFAULT_BACKWARD_KEY, name)) {
				changed.add(target);
			}
		});
	});
	BACKWARD_KEYS.forEach(key => {
		relations(item, key).forEach(source => {
			if (!index[source] || hasForwardRelation(index[source].item, name)) return;
			if (addRelation(index[source].item, DEFAULT_FORWARD_KEY, name)) {
				changed.add(source);
			}
		});
	});
	SYMMETRIC_KEYS.forEach(key => {
		relations(item, key).forEach(other => {
			if (!index[other]) return;
			if (addRelation(index[other].item, key, name)) changed.add(other);
		});
	});

	// Relations the other entries point at this one: complete this entry.
	Object.keys(index).forEach(other => {
		if (other === name) return;
		const otherItem = index[other].item;
		// A mode is left out: its opposite side can be a `modes` as well as a
		// `from`, only the editor knows which one.
		if (hasAnyRelation(otherItem, FORWARD_KEYS, name) && !hasBackwardRelation(item, other)) {
			if (addRelation(item, DEFAULT_BACKWARD_KEY, other)) changed.add(name);
		}
		if (hasBackwardRelation(otherItem, name) && !hasForwardRelation(item, other)) {
			if (addRelation(item, DEFAULT_FORWARD_KEY, other)) changed.add(name);
		}
		SYMMETRIC_KEYS.forEach(key => {
			if (!hasRelation(otherItem, key, name)) return;
			if (addRelation(item, key, other)) changed.add(name);
		});
	});

	rewriteItems(ranked, index, changed);
	return Array.from(changed);
};

/**
 * Drop every relation pointing at `name`, to be called once its entry has been
 * removed from `ranked`. Returns the names of the entries changed.
 */
const removeRelationsTo = (ranked, name) => {
	const index = indexItems(ranked);
	const changed = new Set();
	Object.keys(index).forEach(other => {
		RELATION_KEYS.forEach(key => {
			if (removeRelation(index[other].item, key, name)) changed.add(other);
		});
	});
	rewriteItems(ranked, index, changed);
	return Array.from(changed);
};

/**
 * Rename every relation pointing at `oldName`, to be called when an entry is
 * renamed. Returns the names of the entries changed.
 */
const renameRelationsTo = (ranked, oldName, newName) => {
	const index = indexItems(ranked);
	const changed = new Set();
	Object.keys(index).forEach(other => {
		const item = index[other].item;
		RELATION_KEYS.forEach(key => {
			if (!hasRelation(item, key, oldName)) return;
			item[key] = relations(item, key)
				.map(value => (value === oldName ? newName : value))
				// The new name may already be listed, don't duplicate it.
				.filter((value, i, list) => list.indexOf(value) === i)
				.filter(value => value !== other);
			if (!item[key].length) delete item[key];
			changed.add(other);
		});
	});
	rewriteItems(ranked, index, changed);
	return Array.from(changed);
};

/**
 * Mirror the relations of the whole list. Returns the report of what is (or,
 * with `dryRun`, what would be) completed, plus the relations pointing at a
 * digimon absent from the list, which cannot be mirrored.
 */
const mirrorAllRelations = (ranked, { dryRun = false } = {}) => {
	const index = indexItems(ranked);
	const added = [];
	const dangling = [];
	const changed = new Set();

	const complete = (source, key, target) => {
		added.push({ name: source, key, target });
		if (dryRun) return;
		addRelation(index[source].item, key, target);
		changed.add(source);
	};

	const spurious = [];

	Object.keys(index).forEach(name => {
		const item = index[name].item;

		// Rewriting the entry is enough to drop them, normalizeItem cleans up.
		spuriousRelations(item).forEach(({ key, value }) => {
			spurious.push({ name, key, target: value });
			if (!dryRun) changed.add(name);
		});

		FORWARD_KEYS.forEach(key => {
			relations(item, key).forEach(target => {
				if (!index[target]) return dangling.push({ name, key, target });
				if (hasBackwardRelation(index[target].item, name)) return;
				complete(target, DEFAULT_BACKWARD_KEY, name);
			});
		});

		BACKWARD_KEYS.forEach(key => {
			relations(item, key).forEach(source => {
				if (!index[source]) return dangling.push({ name, key, target: source });
				if (hasForwardRelation(index[source].item, name)) return;
				complete(source, DEFAULT_FORWARD_KEY, name);
			});
		});

		SYMMETRIC_KEYS.forEach(key => {
			relations(item, key).forEach(other => {
				if (!index[other]) return dangling.push({ name, key, target: other });
				if (hasRelation(index[other].item, key, name)) return;
				complete(other, key, name);
			});
		});
	});

	if (!dryRun) rewriteItems(ranked, index, changed);
	return { added, dangling, spurious, changed: Array.from(changed) };
};

module.exports = {
	FORWARD_KEYS,
	BACKWARD_KEYS,
	READONLY_FORWARD_KEYS,
	SYMMETRIC_KEYS,
	RELATION_KEYS,
	KEY_ORDER,
	normalizeItem,
	mergeItemRelations,
	spuriousRelations,
	indexItems,
	syncRelations,
	removeRelationsTo,
	renameRelationsTo,
	mirrorAllRelations,
};
