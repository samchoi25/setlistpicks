// localStorage keyed by groupId so the same browser can be a member of
// multiple groups, and a returning visitor doesn't have to re-enter their
// name. Server is the source of truth — we just remember which member this
// browser is for each group.

const KEY = 'brsp.identities.v1';
// v1 held a single group id. With several festivals you can be mid-plan in
// more than one, so v2 maps festival slug -> group id.
const ACTIVE_KEY_V1 = 'brsp.activeGroup.v1';
const ACTIVE_KEY = 'brsp.activeGroup.v2';

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

function readActive() {
  let map = {};
  try {
    map = JSON.parse(localStorage.getItem(ACTIVE_KEY)) || {};
  } catch {
    map = {};
  }
  // One-time carry-over: a v1 value predates slugs, so it can only have been
  // for the festival that existed then.
  const legacy = localStorage.getItem(ACTIVE_KEY_V1);
  if (legacy) {
    localStorage.removeItem(ACTIVE_KEY_V1);
    if (!map[LEGACY_SLUG]) {
      map[LEGACY_SLUG] = legacy;
      localStorage.setItem(ACTIVE_KEY, JSON.stringify(map));
    }
  }
  return map;
}

const LEGACY_SLUG = 'outside-lands-2026';

export function getActiveGroup(festivalSlug) {
  return readActive()[festivalSlug] || null;
}

export function setActiveGroup(festivalSlug, groupId) {
  const map = readActive();
  map[festivalSlug] = groupId;
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(map));
}

export function clearActiveGroup(festivalSlug) {
  const map = readActive();
  delete map[festivalSlug];
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(map));
}
