// localStorage keyed by groupId so the same browser can be a member of
// multiple groups, and a returning visitor doesn't have to re-enter their
// name. Server is the source of truth — we just remember which member this
// browser is for each group.

const KEY = 'brsp.identities.v1';
/*
 * Active-group history, by version:
 *   v1  a single group id — predates festivals
 *   v2  { slug: groupId } — one in-progress group per festival
 *   v3  { slug: { groupId, at } } — same, plus when it was last opened, so `/`
 *       can send you to the group you actually used last rather than to
 *       whichever festival happens to be the default
 * Older shapes are carried forward on read.
 */
const ACTIVE_KEY_V1 = 'brsp.activeGroup.v1';
const ACTIVE_KEY_V2 = 'brsp.activeGroup.v2';
const ACTIVE_KEY = 'brsp.activeGroup.v3';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function writeAll(obj) {
  localStorage.setItem(KEY, JSON.stringify(obj));
}

export function getIdentity(groupId) {
  return readAll()[groupId] || null;
}

export function setIdentity(groupId, identity) {
  const all = readAll();
  all[groupId] = identity;
  writeAll(all);
}

export function clearIdentity(groupId) {
  const all = readAll();
  delete all[groupId];
  writeAll(all);
}

const LEGACY_SLUG = 'outside-lands-2026';

/*
 * Normalise any stored shape into { slug: { groupId, at } }.
 *
 * Pure so it can be tested without a browser. Entries carried over from v1/v2
 * have no timestamp and get `at: 0` — they lose to anything opened since, which
 * is the right tie-break: a visit recorded under the new scheme is by
 * definition more recent than one that predates it.
 */
export function normalizeActive({ v1, v2, v3 } = {}) {
  const out = {};
  const put = (slug, groupId, at) => {
    if (typeof slug !== 'string' || typeof groupId !== 'string' || !groupId) return;
    if (!out[slug] || at > out[slug].at) out[slug] = { groupId, at };
  };

  if (typeof v1 === 'string' && v1) put(LEGACY_SLUG, v1, 0);
  for (const [slug, groupId] of Object.entries(v2 ?? {})) put(slug, groupId, 0);
  for (const [slug, entry] of Object.entries(v3 ?? {})) {
    if (typeof entry === 'string') put(slug, entry, 0);
    else if (entry) put(slug, entry.groupId, Number(entry.at) || 0);
  }
  return out;
}

// The group opened most recently, across every festival, or null. Ties and
// untimestamped entries resolve to whichever sorts first — deterministic
// rather than arbitrary.
export function pickMostRecent(map) {
  const entries = Object.entries(map ?? {});
  if (!entries.length) return null;
  entries.sort(([slugA, a], [slugB, b]) => (b.at - a.at) || slugA.localeCompare(slugB));
  const [slug, { groupId }] = entries[0];
  return { slug, groupId };
}

const readJson = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || undefined;
  } catch {
    return undefined;
  }
};

function readActive() {
  const map = normalizeActive({
    v1: localStorage.getItem(ACTIVE_KEY_V1) || undefined,
    v2: readJson(ACTIVE_KEY_V2),
    v3: readJson(ACTIVE_KEY),
  });
  // Retire the old keys once their contents have been folded in.
  if (localStorage.getItem(ACTIVE_KEY_V1) || localStorage.getItem(ACTIVE_KEY_V2)) {
    localStorage.removeItem(ACTIVE_KEY_V1);
    localStorage.removeItem(ACTIVE_KEY_V2);
    writeActive(map);
  }
  return map;
}

function writeActive(map) {
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(map));
}

export function getActiveGroup(festivalSlug) {
  return readActive()[festivalSlug]?.groupId || null;
}

export function setActiveGroup(festivalSlug, groupId) {
  const map = readActive();
  map[festivalSlug] = { groupId, at: Date.now() };
  writeActive(map);
}

export function clearActiveGroup(festivalSlug) {
  const map = readActive();
  delete map[festivalSlug];
  writeActive(map);
}

// Where `/` should send a returning visitor.
export function getMostRecentGroup() {
  return pickMostRecent(readActive());
}

/*
 * Recency index for the offline data cache (client/src/offline-cache.js),
 * which stores the actual group-meta/votes payloads in Cache Storage, not
 * here. Cache Storage has no built-in eviction, so this tracks which groups
 * are "recent" the same way the old localStorage-only groupCache did, and
 * offline-cache.js deletes whatever falls out of the window.
 *
 * Capped at CACHE_INDEX_CAP entries — a browser realistically tracks one or
 * two groups at a time, so this is a generous ceiling against unbounded
 * growth rather than a tuned limit.
 */
const CACHE_INDEX_KEY = 'brsp.offlineCacheIndex.v1';
const CACHE_INDEX_CAP = 5;

/*
 * Merge `patch` into `existing[groupId]` (creating it if absent), stamp
 * `cachedAt`, and evict down to `cap` entries by keeping the most recently
 * written. Pure so the cap/merge behavior is testable without localStorage.
 *
 * cachedAt is bumped to one past the current max rather than a bare
 * `Date.now()` — two writes landing in the same millisecond (routine in a
 * tight loop, e.g. several WS messages in a row) would otherwise tie, and a
 * tie-break on insertion order would evict the wrong entry.
 */
export function mergeCacheEntry(existing, groupId, patch, cap = CACHE_INDEX_CAP) {
  const all = { ...existing };
  const prev = all[groupId] || {};
  const maxCachedAt = Math.max(0, ...Object.values(all).map((e) => e.cachedAt || 0));
  all[groupId] = { ...prev, ...patch, cachedAt: Math.max(Date.now(), maxCachedAt + 1) };

  const entries = Object.entries(all).sort(([, a], [, b]) => b.cachedAt - a.cachedAt);
  return Object.fromEntries(entries.slice(0, cap));
}

function readCacheIndex() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_INDEX_KEY)) || {};
  } catch {
    return {};
  }
}

function writeCacheIndex(obj) {
  localStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(obj));
}

// Bumps `groupId` to most-recently-cached and evicts down to the cap.
// Returns the ids that fell out, so offline-cache.js can delete their Cache
// Storage entries too.
export function touchOfflineCacheIndex(groupId, cap = CACHE_INDEX_CAP) {
  const before = readCacheIndex();
  const after = mergeCacheEntry(before, groupId, {}, cap);
  writeCacheIndex(after);
  return Object.keys(before).filter((id) => !(id in after));
}

/*
 * Per-festival group history — every group this browser has opened for a
 * festival, so a group switcher can list them most-recently-viewed first.
 * Unlike `activeGroup` above (one in-progress group per festival), this
 * keeps every group seen, up to HISTORY_CAP, so a crew member can belong to
 * several crews for the same festival and jump between them.
 */
const HISTORY_KEY = 'brsp.groupHistory.v1';
const HISTORY_CAP = 20;

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
  } catch {
    return {};
  }
}

function writeHistory(obj) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(obj));
}

// Record that `groupId` (named `name`) was just opened, bumping it to the
// top of its festival's history. Capped per festival, evicting whichever
// group was viewed longest ago.
export function recordGroupVisit(festivalSlug, groupId, name, cap = HISTORY_CAP) {
  const all = readHistory();
  const forFestival = { ...(all[festivalSlug] || {}) };
  forFestival[groupId] = { name, at: Date.now() };

  const entries = Object.entries(forFestival).sort(([, a], [, b]) => b.at - a.at);
  all[festivalSlug] = Object.fromEntries(entries.slice(0, cap));
  writeHistory(all);
}

// Update a group's name in history without touching when it was last
// viewed, so a rename doesn't reorder the switcher just because someone
// edited the name.
export function renameGroupInHistory(festivalSlug, groupId, name) {
  const all = readHistory();
  const entry = all[festivalSlug]?.[groupId];
  if (!entry) return;
  all[festivalSlug] = { ...all[festivalSlug], [groupId]: { ...entry, name } };
  writeHistory(all);
}

export function removeGroupFromHistory(festivalSlug, groupId) {
  const all = readHistory();
  if (!all[festivalSlug]?.[groupId]) return;
  const rest = { ...all[festivalSlug] };
  delete rest[groupId];
  all[festivalSlug] = rest;
  writeHistory(all);
}

// This festival's groups, most-recently-viewed first.
export function getGroupHistory(festivalSlug) {
  const forFestival = readHistory()[festivalSlug] || {};
  return Object.entries(forFestival)
    .map(([groupId, { name, at }]) => ({ groupId, name, at }))
    .sort((a, b) => b.at - a.at);
}
