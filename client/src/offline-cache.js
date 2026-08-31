// Cache-API-backed offline store for the three read-only group endpoints —
// group meta, everyone's votes, and one member's votes. This is what makes
// "readonly actions" (viewing a group's schedule and current picks) work
// with no connection; the Service Worker (scripts/build-sw.js) is a
// separate, independent cache that only covers the app shell (JS/CSS/HTML),
// never /api/*. Keeping them separate means there is exactly one place
// (this file, via client/src/api.js) that knows how group/vote data gets
// invalidated, rather than that logic being split between a `fetch` handler
// and app code.
import { touchOfflineCacheIndex } from './storage.js';

const CACHE_NAME = 'brsp-offline-v1';

// Exactly the GET endpoints that display read-only data — never a write, and
// never /api/schedule (unused by the SPA; the lineup is bundled into the JS
// at build time and needs no network fetch at all).
const CACHEABLE_PATTERNS = [
  /^\/api\/groups\/[^/]+$/,
  /^\/api\/groups\/[^/]+\/votes$/,
  /^\/api\/groups\/[^/]+\/votes\/[^/]+$/,
];

// `location` doesn't exist outside a browser (e.g. under `node --test`), and
// every URL here is always same-origin and absolute-path anyway — a fixed
// dummy base just satisfies the URL constructor's requirement for one.
const BASE = typeof location !== 'undefined' ? location.origin : 'http://localhost';

function pathnameOf(url) {
  return new URL(url, BASE).pathname;
}

export function isCacheableUrl(url) {
  return CACHEABLE_PATTERNS.some((re) => re.test(pathnameOf(url)));
}

// A cacheable URL is always /api/groups/<groupId>[/votes[/<memberKey>]] —
// the id is always the third path segment.
function groupIdOf(url) {
  return pathnameOf(url).split('/')[3];
}

function hasCacheStorage() {
  return typeof caches !== 'undefined';
}

export async function getCachedJson(url) {
  if (!hasCacheStorage()) return null;
  const cache = await caches.open(CACHE_NAME);
  const res = await cache.match(url);
  return res ? res.json() : null;
}

// Write-through from api.js on a successful GET — stores the real cloned
// Response, then evicts whichever group(s) fell out of the recency window.
export async function putResponse(url, response) {
  if (!hasCacheStorage() || !isCacheableUrl(url)) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(url, response);
  await purgeGroups(cache, touchOfflineCacheIndex(groupIdOf(url)));
}

// Synthetic write — used by vote patching and WS sync, where there's no real
// network Response to clone, just a JSON body to store.
export async function putJson(url, json) {
  await putResponse(url, new Response(JSON.stringify(json), {
    headers: { 'content-type': 'application/json' },
  }));
}

// Shallow-merge `patch` over whatever's cached at `url` (or {} if nothing
// is), then write it back. The one primitive the WS sync handler needs.
export async function mergeIntoCache(url, patch) {
  const existing = (await getCachedJson(url)) || {};
  await putJson(url, { ...existing, ...patch });
}

async function purgeGroups(cache, evictedGroupIds) {
  if (!evictedGroupIds.length) return;
  const requests = await cache.keys();
  await Promise.all(
    requests
      .filter((r) => evictedGroupIds.includes(groupIdOf(r.url)))
      .map((r) => cache.delete(r)),
  );
}

/*
 * Pure patch helpers — apply one vote's new value to an already-fetched
 * votes/allVotes body. Exported standalone so they're unit-testable without
 * touching Cache Storage at all.
 */

// GET /api/groups/:id/votes/:memberKey → { votes: { [artistId]: score } }
export function applyVotePatch(votesBody, artistId, score) {
  const votes = { ...(votesBody?.votes ?? {}) };
  if (score > 0) votes[artistId] = score;
  else delete votes[artistId];
  return { ...votesBody, votes };
}

// GET /api/groups/:id/votes → { members, perArtist: { [artistId]: [{key, displayName, score}] } }
export function applyPerArtistPatch(allVotesBody, artistId, memberKey, displayName, score) {
  const perArtist = { ...(allVotesBody?.perArtist ?? {}) };
  const voters = (perArtist[artistId] ?? []).filter((v) => v.key !== memberKey);
  if (score > 0) voters.push({ key: memberKey, displayName, score });
  return { ...allVotesBody, perArtist: { ...perArtist, [artistId]: voters } };
}
