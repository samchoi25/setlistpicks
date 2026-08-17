import test from 'node:test';
import assert from 'node:assert/strict';
import {
  listFestivals, getFestival, isFestivalSlug, isCanonicalSlug,
  FESTIVAL_ALIASES, RESERVED_SLUGS, DEFAULT_FESTIVAL_SLUG, GROUP_CODE_RE,
  WEBSOCKETS_ENABLED_DEFAULT,
} from '../shared/festivals/index.js';
import { festivalEndsAt, hasFestivalEnded } from '../shared/festival.js';

test('registry is non-empty and slugs are unique', () => {
  const slugs = listFestivals().map((f) => f.slug);
  assert.ok(slugs.length > 0);
  assert.equal(new Set(slugs).size, slugs.length);
});

test('no slug can be mistaken for a group code', () => {
  // Group codes are exactly 10 chars from a restricted alphabet. A slug that
  // matched would shadow real group links under `/:something`.
  for (const f of listFestivals()) {
    assert.ok(!GROUP_CODE_RE.test(f.slug), `slug '${f.slug}' looks like a group code`);
  }
  for (const alias of Object.keys(FESTIVAL_ALIASES)) {
    assert.ok(!GROUP_CODE_RE.test(alias), `alias '${alias}' looks like a group code`);
  }
});

test('GROUP_CODE_RE accepts real codes and rejects near-misses', () => {
  assert.ok(GROUP_CODE_RE.test('9kg6kwvzzw'));
  assert.ok(!GROUP_CODE_RE.test('9kg6kwvzz'), 'too short');
  assert.ok(!GROUP_CODE_RE.test('9kg6kwvzzwx'), 'too long');
  assert.ok(!GROUP_CODE_RE.test('9kg6kwvzz0'), '0 is not in the alphabet');
  assert.ok(!GROUP_CODE_RE.test('9kg6kwvzzo'), 'o is not in the alphabet');
  assert.ok(!GROUP_CODE_RE.test('outside-la'), 'hyphen is not in the alphabet');
});

test('no slug collides with a reserved path', () => {
  for (const f of listFestivals()) {
    assert.ok(!RESERVED_SLUGS.has(f.slug), `slug '${f.slug}' is reserved`);
  }
  for (const alias of Object.keys(FESTIVAL_ALIASES)) {
    assert.ok(!RESERVED_SLUGS.has(alias), `alias '${alias}' is reserved`);
  }
});

test('slugs are lowercase kebab-case', () => {
  for (const f of listFestivals()) {
    assert.match(f.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, f.slug);
  }
});

test('every alias points at a real canonical festival', () => {
  for (const [alias, target] of Object.entries(FESTIVAL_ALIASES)) {
    assert.ok(isCanonicalSlug(target), `alias '${alias}' → unknown '${target}'`);
    assert.equal(getFestival(alias).slug, target);
    assert.ok(!isCanonicalSlug(alias), `alias '${alias}' must not also be canonical`);
  }
});

test('the default festival exists', () => {
  assert.ok(isCanonicalSlug(DEFAULT_FESTIVAL_SLUG));
});

test('websockets default off sitewide, with no festival opted in yet', () => {
  assert.equal(WEBSOCKETS_ENABLED_DEFAULT, false);
  for (const f of listFestivals()) {
    assert.equal(f.websocketsEnabled, false, `${f.slug}.websocketsEnabled`);
  }
});

test('lookups reject unknown and malformed slugs', () => {
  for (const bad of ['', undefined, null, 'nope', 'Outside-Lands-2026', '../etc', 'api']) {
    assert.equal(getFestival(bad), undefined, String(bad));
    assert.equal(isFestivalSlug(bad), false, String(bad));
  }
});

test('each festival carries the metadata the SEO pages need', () => {
  for (const f of listFestivals()) {
    for (const key of ['name', 'shortName', 'venue', 'dateRange']) {
      assert.equal(typeof f[key], 'string', `${f.slug}.${key}`);
      assert.ok(f[key].length > 0, `${f.slug}.${key} is empty`);
    }
    assert.ok(Array.isArray(f.headliners) && f.headliners.length > 0, `${f.slug}.headliners`);
    assert.ok(f.DAYS.length > 0, `${f.slug}.DAYS`);
    // Zero stages is legitimate for a lineup announced before any stage
    // assignment (see dayModeOf()/buildUntimedDay() in shared/festival.js) —
    // just an array, not necessarily a non-empty one.
    assert.ok(Array.isArray(f.STAGES), `${f.slug}.STAGES`);
  }
});

test('every headliner named in metadata actually appears in the lineup', () => {
  // Guards against a copy/paste festival definition advertising acts it does
  // not schedule, which would put wrong names in <title> and JSON-LD.
  for (const f of listFestivals()) {
    const acts = new Set(f.SCHEDULE.flatMap((s) => s.artists));
    for (const name of [...f.headliners, ...(f.notableActs ?? [])]) {
      assert.ok(acts.has(name), `${f.slug}: '${name}' is advertised but not scheduled`);
    }
  }
});

test('buildFestival is memoised per slug', () => {
  // The built object is compared by identity in React and frozen; a second
  // build would silently break memoisation.
  assert.equal(getFestival('outside-lands-2026'), getFestival('outside-lands-2026'));
  assert.ok(Object.isFrozen(getFestival('outside-lands-2026')));
});

test('festivalEndsAt / hasFestivalEnded: the boundary is midnight after the last day, in the festival\'s own timezone', () => {
  const f = getFestival('daisy-chain-fields-2026'); // single day: 2026-08-29, utcOffset -07:00
  const end = festivalEndsAt(f);
  assert.equal(end.toISOString(), new Date('2026-08-29T23:59:59-07:00').toISOString());

  assert.equal(hasFestivalEnded(f, new Date('2026-08-29T12:00:00-07:00')), false, 'still happening');
  assert.equal(hasFestivalEnded(f, new Date('2026-08-29T23:59:58-07:00')), false, 'one second before the cutoff');
  assert.equal(hasFestivalEnded(f, new Date('2026-08-30T00:00:01-07:00')), true, 'the next day');
});
