import test from 'node:test';
import assert from 'node:assert/strict';
import {
  listFestivals, getFestival, isFestivalSlug, isCanonicalSlug,
  FESTIVAL_ALIASES, RESERVED_SLUGS, DEFAULT_FESTIVAL_SLUG, LEGACY_FESTIVAL_SLUG, GROUP_CODE_RE,
  WEBSOCKETS_ENABLED_DEFAULT,
} from '../shared/festivals/index.js';
import { festivalEndsAt, festivalStartsAt, hasFestivalEnded } from '../shared/festival.js';

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

test('the default festival is the next one to open that has not ended', () => {
  const now = Date.now();
  const def = getFestival(DEFAULT_FESTIVAL_SLUG);
  const live = listFestivals().filter((f) => +festivalEndsAt(f) >= now);

  if (live.length === 0) {
    // Whole calendar in the past: fall back to the one that ended last rather
    // than leaving `/` with no festival to show.
    const last = listFestivals()
      .sort((a, b) => +festivalEndsAt(a) - +festivalEndsAt(b))
      .pop();
    assert.equal(DEFAULT_FESTIVAL_SLUG, last.slug);
    return;
  }

  assert.ok(live.some((f) => f.slug === def.slug), 'default has not already ended');
  for (const f of live) {
    assert.ok(
      +festivalStartsAt(def) <= +festivalStartsAt(f),
      `${f.slug} opens before the default ${def.slug}`,
    );
  }
});

test('the legacy slug is frozen to the edition that predates multi-festival', () => {
  // Repointing it silently reattributes every group in a database that has
  // not run the festival_slug migration yet.
  assert.equal(LEGACY_FESTIVAL_SLUG, 'outside-lands-2026');
  assert.ok(isCanonicalSlug(LEGACY_FESTIVAL_SLUG));
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

test('artist links are well-formed and only name platforms the popup renders', () => {
  // ArtistPopup keys off exactly these three; a fourth key, or an http:// URL
  // on the wrong host, would silently render nothing or leak a bad link.
  const HOSTS = {
    spotify: 'open.spotify.com',
    appleMusic: 'music.apple.com',
    soundcloud: 'soundcloud.com',
  };
  for (const f of listFestivals()) {
    for (const [name, links] of Object.entries(f.artistLinks ?? {})) {
      const where = `${f.slug}: '${name}'`;
      assert.ok(links && typeof links === 'object', `${where} has no link object`);
      assert.ok(Object.keys(links).length > 0, `${where} has an empty link object`);
      for (const [platform, url] of Object.entries(links)) {
        assert.ok(HOSTS[platform], `${where} names unknown platform '${platform}'`);
        assert.equal(new URL(url).protocol, 'https:', `${where}.${platform} is not https`);
        // A leading www. is equivalent and appears in one older entry; what
        // matters is that the link points at the service it claims to.
        const host = new URL(url).hostname.replace(/^www\./, '');
        assert.equal(host, HOSTS[platform], `${where}.${platform} wrong host`);
      }
    }
  }
});

test('the four 2026-season festivals get their links from the shared map', () => {
  // Those festivals' links live in artist-links.js and are attached by the
  // registry, because three of the four definitions are regenerated wholesale
  // by scripts/gen-greencopper-festival.py and would lose an inline map. If
  // that wiring breaks, every popup quietly loses its listen row — so assert
  // real coverage rather than mere presence.
  const expected = {
    'louder-than-life-2026': 0.8,
    'bourbon-and-beyond-2026': 0.7,
    'aftershock-2026': 0.8,
    'sea-hear-now-2026': 0.8,
  };
  for (const [slug, floor] of Object.entries(expected)) {
    const f = getFestival(slug);
    const acts = [...new Set(f.SCHEDULE.flatMap((s) => s.artists))];
    const linked = acts.filter((a) => f.artistLinks?.[a]);
    const ratio = linked.length / acts.length;
    assert.ok(ratio >= floor,
      `${slug}: only ${linked.length}/${acts.length} acts have links (want >= ${floor})`);
  }
});

test('the shared artist-links map has no keys nothing is billed under', () => {
  // Keys must match the `sets` artist string verbatim — casing, punctuation and
  // all — or the popup looks up a name that is never rendered. A stray key is
  // the silent failure mode of a typo, so assert every one is actually billed
  // somewhere across the four festivals that share the map.
  const slugs = ['louder-than-life-2026', 'bourbon-and-beyond-2026',
                 'aftershock-2026', 'sea-hear-now-2026'];
  const billed = new Set(slugs.flatMap(
    (slug) => getFestival(slug).SCHEDULE.flatMap((s) => s.artists)));
  for (const name of Object.keys(getFestival(slugs[0]).artistLinks ?? {})) {
    assert.ok(billed.has(name), `artist-links.js key '${name}' is not billed anywhere`);
  }
});

test('festivals with their own artist links keep them', () => {
  // The shared map is attached only where a definition has none of its own;
  // portola and the ACL weeks must not be overwritten by it.
  for (const slug of ['portola-2026', 'austin-city-limits-2026-week-1']) {
    const f = getFestival(slug);
    assert.ok(Object.keys(f.artistLinks ?? {}).length > 0, `${slug} lost its artistLinks`);
  }
  // ...and a festival on neither list gets nothing attached.
  assert.equal(getFestival('outside-lands-2026').artistLinks, undefined);
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
