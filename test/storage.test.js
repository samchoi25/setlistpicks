import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeActive, pickMostRecent } from '../client/src/storage.js';

/*
 * The stored shape and the "most recent group" choice, tested as pure
 * functions — no localStorage needed. This is what `/` depends on to send a
 * returning visitor back where they were.
 */

test('nothing stored means nothing to resume', () => {
  assert.deepEqual(normalizeActive(), {});
  assert.equal(pickMostRecent({}), null);
  assert.equal(pickMostRecent(undefined), null);
});

test('the most recently opened group wins, across festivals', () => {
  const map = normalizeActive({
    v3: {
      'outside-lands-2026': { groupId: 'aaaaaaaaaa', at: 100 },
      'daisy-chain-fields-2026': { groupId: 'bbbbbbbbbb', at: 900 },
    },
  });
  assert.deepEqual(pickMostRecent(map), {
    slug: 'daisy-chain-fields-2026',
    groupId: 'bbbbbbbbbb',
  });
});

test('recency, not festival order, decides', () => {
  // The opposite ordering must give the opposite answer, or the test would
  // pass on a implementation that just returns the first entry.
  const map = normalizeActive({
    v3: {
      'outside-lands-2026': { groupId: 'aaaaaaaaaa', at: 900 },
      'daisy-chain-fields-2026': { groupId: 'bbbbbbbbbb', at: 100 },
    },
  });
  assert.equal(pickMostRecent(map).slug, 'outside-lands-2026');
});

test('a v1 value is carried over as the festival that existed then', () => {
  const map = normalizeActive({ v1: 'aaaaaaaaaa' });
  assert.deepEqual(map, { 'outside-lands-2026': { groupId: 'aaaaaaaaaa', at: 0 } });
  assert.deepEqual(pickMostRecent(map), {
    slug: 'outside-lands-2026',
    groupId: 'aaaaaaaaaa',
  });
});

test('a v2 map is carried over, one entry per festival', () => {
  const map = normalizeActive({
    v2: { 'outside-lands-2026': 'aaaaaaaaaa', 'daisy-chain-fields-2026': 'bbbbbbbbbb' },
  });
  assert.equal(map['outside-lands-2026'].groupId, 'aaaaaaaaaa');
  assert.equal(map['daisy-chain-fields-2026'].groupId, 'bbbbbbbbbb');
});

test('anything opened since beats an untimestamped carry-over', () => {
  // A v1/v2 entry has no timestamp. It must lose to a real visit, otherwise a
  // stale pre-upgrade group would outrank the group you used a minute ago.
  const map = normalizeActive({
    v2: { 'outside-lands-2026': 'aaaaaaaaaa' },
    v3: { 'daisy-chain-fields-2026': { groupId: 'bbbbbbbbbb', at: 1 } },
  });
  assert.equal(pickMostRecent(map).slug, 'daisy-chain-fields-2026');
});

test('a newer v3 entry wins over the same festival carried from v2', () => {
  const map = normalizeActive({
    v2: { 'outside-lands-2026': 'oldoldoldd' },
    v3: { 'outside-lands-2026': { groupId: 'newnewnewn', at: 5 } },
  });
  assert.deepEqual(map['outside-lands-2026'], { groupId: 'newnewnewn', at: 5 });
});

test('ties break deterministically rather than by object order', () => {
  const a = pickMostRecent(normalizeActive({
    v3: { zzz: { groupId: 'aaaaaaaaaa', at: 5 }, aaa: { groupId: 'bbbbbbbbbb', at: 5 } },
  }));
  const b = pickMostRecent(normalizeActive({
    v3: { aaa: { groupId: 'bbbbbbbbbb', at: 5 }, zzz: { groupId: 'aaaaaaaaaa', at: 5 } },
  }));
  assert.deepEqual(a, b);
});

test('malformed entries are ignored, not returned as a broken redirect', () => {
  const map = normalizeActive({
    v3: {
      good: { groupId: 'aaaaaaaaaa', at: 5 },
      missingId: { at: 9 },
      nullEntry: null,
      numericId: { groupId: 12345, at: 9 },
      emptyId: { groupId: '', at: 9 },
      badAt: { groupId: 'bbbbbbbbbb', at: 'soon' },
    },
  });
  assert.deepEqual(Object.keys(map).sort(), ['badAt', 'good']);
  assert.equal(map.badAt.at, 0, 'an unparseable timestamp falls back to 0');
  assert.equal(pickMostRecent(map).groupId, 'aaaaaaaaaa');
});

test('a v3 entry still holding a bare string is tolerated', () => {
  const map = normalizeActive({ v3: { 'outside-lands-2026': 'aaaaaaaaaa' } });
  assert.deepEqual(map, { 'outside-lands-2026': { groupId: 'aaaaaaaaaa', at: 0 } });
});
