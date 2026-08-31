import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isCacheableUrl, applyVotePatch, applyPerArtistPatch,
} from '../client/src/offline-cache.js';

/* ─── isCacheableUrl ─────────────────────────────────────────────────────── */

test('isCacheableUrl matches exactly the three read-only group endpoints', () => {
  assert.ok(isCacheableUrl('/api/groups/abc123'));
  assert.ok(isCacheableUrl('/api/groups/abc123/votes'));
  assert.ok(isCacheableUrl('/api/groups/abc123/votes/some%20member'));
});

test('isCacheableUrl rejects writes and everything else', () => {
  assert.ok(!isCacheableUrl('/api/groups'));               // createGroup (POST)
  assert.ok(!isCacheableUrl('/api/groups/abc123/join'));    // join (POST)
  assert.ok(!isCacheableUrl('/api/groups/abc123/members/x')); // rename/remove
  assert.ok(!isCacheableUrl('/api/schedule'));              // unused by the SPA
});

/* ─── applyVotePatch ─────────────────────────────────────────────────────── */

test('applyVotePatch sets a new score for an artist', () => {
  const before = { votes: { a1: 1 } };
  const after = applyVotePatch(before, 'a2', 3);
  assert.deepEqual(after, { votes: { a1: 1, a2: 3 } });
});

test('applyVotePatch clears a vote when the score is 0', () => {
  const before = { votes: { a1: 1, a2: 3 } };
  const after = applyVotePatch(before, 'a2', 0);
  assert.deepEqual(after, { votes: { a1: 1 } });
});

test('applyVotePatch tolerates a missing/empty cached body', () => {
  assert.deepEqual(applyVotePatch(null, 'a1', 1), { votes: { a1: 1 } });
  assert.deepEqual(applyVotePatch({}, 'a1', 1), { votes: { a1: 1 } });
});

/* ─── applyPerArtistPatch ────────────────────────────────────────────────── */

test('applyPerArtistPatch adds a voter to an artist with no prior votes', () => {
  const before = { members: [], perArtist: {} };
  const after = applyPerArtistPatch(before, 'a1', 'k1', 'Alice', 3);
  assert.deepEqual(after.perArtist, { a1: [{ key: 'k1', displayName: 'Alice', score: 3 }] });
});

test('applyPerArtistPatch replaces this member\'s prior vote, keeping others', () => {
  const before = { perArtist: { a1: [{ key: 'k1', displayName: 'Alice', score: 1 }, { key: 'k2', displayName: 'Bob', score: 3 }] } };
  const after = applyPerArtistPatch(before, 'a1', 'k1', 'Alice', 3);
  assert.deepEqual(after.perArtist.a1, [{ key: 'k2', displayName: 'Bob', score: 3 }, { key: 'k1', displayName: 'Alice', score: 3 }]);
});

test('applyPerArtistPatch removes the voter entirely when score is 0', () => {
  const before = { perArtist: { a1: [{ key: 'k1', displayName: 'Alice', score: 1 }] } };
  const after = applyPerArtistPatch(before, 'a1', 'k1', 'Alice', 0);
  assert.deepEqual(after.perArtist.a1, []);
});

test('applyPerArtistPatch leaves other artists untouched', () => {
  const before = { perArtist: { a1: [{ key: 'k1', displayName: 'Alice', score: 1 }] } };
  const after = applyPerArtistPatch(before, 'a2', 'k1', 'Alice', 3);
  assert.deepEqual(after.perArtist.a1, [{ key: 'k1', displayName: 'Alice', score: 1 }]);
  assert.deepEqual(after.perArtist.a2, [{ key: 'k1', displayName: 'Alice', score: 3 }]);
});
