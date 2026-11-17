import test from 'node:test';
import assert from 'node:assert/strict';
import { suggestFestivals, normalize } from '../shared/festival-search.js';
import { listPublicFestivals } from '../shared/festivals/index.js';

const slugs = (q, opts) => suggestFestivals(q, { limit: Infinity, ...opts }).map((f) => f.slug);

test('normalize folds case, accents, punctuation and &', () => {
  assert.equal(normalize('Sea.Hear.Now'), 'sea hear now');
  assert.equal(normalize('Bourbon & Beyond'), 'bourbon and beyond');
  assert.equal(normalize('Tiësto'), 'tiesto');
});

test('empty query returns every listed festival', () => {
  assert.equal(slugs('').length, listPublicFestivals().length);
});

test('an unlisted event never shows up in search', () => {
  assert.ok(!slugs('').includes('lucky-13'));
  assert.ok(!slugs('lucky').includes('lucky-13'));
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

test('coming-soon list: dated first by start, TBA after, ended entries dropped', async () => {
  const { listAnnouncedFestivals, ANNOUNCED_FESTIVALS } = await import('../shared/festivals/announced.js');
  const list = listAnnouncedFestivals(new Date('2026-11-16T12:00:00Z'));
  assert.equal(list.length, ANNOUNCED_FESTIVALS.length);
  const firstTba = list.findIndex((e) => !e.start);
  assert.ok(list.slice(firstTba).every((e) => !e.start), 'TBA entries come last');
  assert.equal(list.find((e) => e.id === 'lollapalooza-2027').dateRange, '2027 · Dates TBA');
  assert.ok(!list.some((e) => /bonnaroo/.test(e.id)), 'Bonnaroo is off in 2027');
  const later = listAnnouncedFestivals(new Date('2027-06-07T12:00:00Z'));
  assert.ok(!later.some((e) => e.id === 'tomorrowland-winter-2027'), 'drops once it has ended');
  assert.ok(later.some((e) => e.id === 'lollapalooza-2027'), 'TBA entries never expire');
});

test('coming-soon entries are searchable with the same matcher', async () => {
  const { suggestAnnounced } = await import('../shared/festival-search.js');
  const ids = (q) => suggestAnnounced(q).map((e) => e.id);
  assert.equal(ids('lolla')[0], 'lollapalooza-2027');
  assert.equal(ids('sonar')[0], 'sonar-2027');
  assert.ok(ids('barcelona').includes('sonar-2027'));
  assert.deepEqual(ids('edc'), ['edc-las-vegas-2027-week-1', 'edc-las-vegas-2027-week-2']);
  assert.ok(!ids('hardly strictly').length);
});

test('no coming-soon entry shadows a festival that already has a page', async () => {
  const { ANNOUNCED_FESTIVALS } = await import('../shared/festivals/announced.js');
  const slugsWithPages = new Set(listPublicFestivals().map((f) => f.slug));
  for (const e of ANNOUNCED_FESTIVALS) assert.ok(!slugsWithPages.has(e.id), e.id);
});
