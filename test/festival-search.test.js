import test from 'node:test';
import assert from 'node:assert/strict';
import { suggestFestivals, normalize } from '../shared/festival-search.js';
import { listFestivals } from '../shared/festivals/index.js';

const slugs = (q, opts) => suggestFestivals(q, { limit: Infinity, ...opts }).map((f) => f.slug);

test('normalize folds case, accents, punctuation and &', () => {
  assert.equal(normalize('Sea.Hear.Now'), 'sea hear now');
  assert.equal(normalize('Bourbon & Beyond'), 'bourbon and beyond');
  assert.equal(normalize('Tiësto'), 'tiesto');
});

test('empty query returns every festival', () => {
  assert.equal(slugs('').length, listFestivals().length);
});

test('prefix of the short name ranks first', () => {
  assert.equal(slugs('port')[0], 'portola-2026');
  assert.equal(slugs('OUTSIDE')[0], 'outside-lands-2026');
});

test('punctuation and compact spellings match', () => {
  assert.equal(slugs('sea hear')[0], 'sea-hear-now-2026');
  assert.equal(slugs('seahearnow')[0], 'sea-hear-now-2026');
  assert.equal(slugs('bourbon and')[0], 'bourbon-and-beyond-2026');
});

test('initials match', () => {
  assert.deepEqual(slugs('acl').slice(0, 2).sort(),
    ['austin-city-limits-2026-week-1', 'austin-city-limits-2026-week-2']);
  assert.equal(slugs('hsb')[0], 'hardly-strictly-bluegrass-2026');
});

test('venue and city match, below name matches', () => {
  const sf = slugs('san francisco');
  for (const s of ['outside-lands-2026', 'portola-2026', 'hardly-strictly-bluegrass-2026']) {
    assert.ok(sf.includes(s), `${s} is in San Francisco`);
  }
  assert.ok(slugs('louisville').includes('louder-than-life-2026'));
});

test('every word must match', () => {
  assert.deepEqual(slugs('outside zilker'), []);
  assert.deepEqual(slugs('zzzz'), []);
});

test('limit and includeEnded are honoured', () => {
  assert.equal(suggestFestivals('', { limit: 2 }).length, 2);
  const farFuture = new Date('2099-01-01');
  assert.deepEqual(suggestFestivals('', { includeEnded: false, now: farFuture }), []);
});
