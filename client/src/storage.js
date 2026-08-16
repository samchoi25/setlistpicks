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
 * Offline read cache — the last-known group meta/votes for groups this
 * browser has loaded while online, keyed by groupId (mirrors `identities`
 * above). Used only as a fallback when a live fetch isn't possible; the
 * server is still the source of truth whenever reachable.
 *
 * Capped at CACHE_CAP entries, evicting the least-recently-written group —
 * a browser realistically tracks one or two groups at a time, so this is a
 * generous ceiling against unbounded growth rather than a tuned limit.
 */
const CACHE_KEY = 'brsp.groupCache.v1';
const CACHE_CAP = 5;

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
export function mergeCacheEntry(existing, groupId, patch, cap = CACHE_CAP) {
  const all = { ...existing };
  const prev = all[groupId] || {};
  const maxCachedAt = Math.max(0, ...Object.values(all).map((e) => e.cachedAt || 0));
  all[groupId] = { ...prev, ...patch, cachedAt: Math.max(Date.now(), maxCachedAt + 1) };

  const entries = Object.entries(all).sort(([, a], [, b]) => b.cachedAt - a.cachedAt);
  return Object.fromEntries(entries.slice(0, cap));
}

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeCache(obj) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
}

export function getCachedGroup(groupId) {
  return readCache()[groupId] || null;
}

export function setCachedGroup(groupId, patch) {
  writeCache(mergeCacheEntry(readCache(), groupId, patch));
}

export function clearCachedGroup(groupId) {
  const all = readCache();
  delete all[groupId];
  writeCache(all);
}
