import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyVisit, VISIT_SOURCES } from '../shared/traffic.js';

const HOST = 'setlistpicks.com';

// Most cases only vary one or two signals, so the rest default to the common
// shape: a stranger landing on a festival page.
const visit = (over = {}) => classifyVisit({
  host: HOST, fetchSite: 'cross-site', landingKind: 'festival', ...over,
});

test('every source it can return is in the published list', () => {
  const seen = [
    visit({ referrer: `https://${HOST}/x` }),
    visit({ referrer: 'https://www.google.com/search?q=x' }),
    visit({ referrer: 'https://www.reddit.com/r/sf/' }),
    visit({ referrer: 'https://sfgate.com/story' }),
    visit({ landingKind: 'group' }),
    visit({ fetchSite: 'none' }),
    visit({}),
  ].map((r) => r.source);

  assert.deepEqual([...new Set(seen)].sort(), [...VISIT_SOURCES].sort());
});

// ─── Search ───────────────────────────────────────────────────────────────────

test('a search engine is recognised and labelled', () => {
  assert.deepEqual(visit({ referrer: 'https://www.google.com/search?q=outside+lands' }),
    { source: 'search', detail: 'google' });
  assert.deepEqual(visit({ referrer: 'https://duckduckgo.com/' }),
    { source: 'search', detail: 'duckduckgo' });
  assert.deepEqual(visit({ referrer: 'https://www.bing.com/search?q=x' }),
    { source: 'search', detail: 'bing' });
});

test("Google's country domains all fold into one label", () => {
  // Otherwise the same engine would be spread across ~190 rows in the admin
  // table and look like nothing but noise.
  for (const host of ['www.google.com', 'www.google.co.uk', 'google.de', 'news.google.com']) {
    assert.deepEqual(visit({ referrer: `https://${host}/search?q=x` }),
      { source: 'search', detail: 'google' }, host);
  }
});

// ─── Social ───────────────────────────────────────────────────────────────────

test('social and messaging hosts map to a stable platform label', () => {
  const cases = [
    ['https://www.reddit.com/r/sanfrancisco/comments/x', 'reddit'],
    ['https://l.instagram.com/?u=x', 'instagram'],
    ['https://t.co/abc123', 'twitter'],
    ['https://x.com/someone/status/1', 'twitter'],
    ['https://m.facebook.com/', 'facebook'],
    ['https://t.me/somechat', 'telegram'],
  ];
  for (const [referrer, detail] of cases) {
    assert.deepEqual(visit({ referrer }), { source: 'social', detail }, referrer);
  }
});

// ─── Referral ─────────────────────────────────────────────────────────────────

test('an unrecognised site is a referral, kept as a bare hostname', () => {
  assert.deepEqual(visit({ referrer: 'https://www.sfgate.com/music/article/best-sets.php' }),
    { source: 'referral', detail: 'sfgate.com' });
});

test('nothing past the hostname survives into the stored detail', () => {
  // The path and query are where a referrer can carry something personal —
  // a search term someone typed, a token they pasted. They must not reach
  // the database at all.
  const { detail } = visit({
    referrer: 'https://example.org/inbox/messages?user=alice@example.com&token=s3cret#frag',
  });
  assert.equal(detail, 'example.org');
  for (const leaked of ['alice', 'token', 's3cret', 'inbox', '?', '/']) {
    assert.ok(!detail.includes(leaked), `leaked from the referrer URL: ${leaked}`);
  }
});

test('a referring hostname is bounded in length', () => {
  const long = `${'a'.repeat(300)}.example.com`;
  assert.ok(visit({ referrer: `https://${long}/` }).detail.length <= 64);
});

// ─── Internal ─────────────────────────────────────────────────────────────────

test('a link from the app itself is internal, however it is detected', () => {
  // Same-host referrer…
  assert.deepEqual(visit({ referrer: `https://${HOST}/outside-lands-2026` }),
    { source: 'internal', detail: null });
  // …and the same navigation under a referrer policy that strips the header.
  assert.deepEqual(visit({ fetchSite: 'same-origin' }),
    { source: 'internal', detail: null });
  assert.deepEqual(visit({ fetchSite: 'same-site' }),
    { source: 'internal', detail: null });
});

test('the app host matches whether or not either side carries www or a port', () => {
  assert.equal(visit({ referrer: 'https://www.setlistpicks.com/x' }).source, 'internal');
  assert.equal(visit({ referrer: 'http://localhost/x', host: 'localhost:8080' }).source, 'internal');
});

test('an in-app hop to a group page is internal, not a shared link', () => {
  // The most likely misreading: a visitor clicking through to their own group
  // would otherwise inflate the number the owner cares most about.
  assert.deepEqual(
    visit({ referrer: `https://${HOST}/outside-lands-2026`, landingKind: 'group' }),
    { source: 'internal', detail: null },
  );
});

// ─── Group links ──────────────────────────────────────────────────────────────

test('a referrer-less arrival on an invite link is a shared group link', () => {
  // Nobody types ten random characters; WhatsApp, iMessage and Signal send
  // no referrer at all, so this is what a pasted invite looks like.
  for (const landingKind of ['group', 'legacy-group']) {
    assert.deepEqual(visit({ landingKind }), { source: 'group-link', detail: null }, landingKind);
  }
});

test('an invite link that kept its referrer is attributed to where it came from', () => {
  // Intentional: that it was an invite is recorded separately as the landing
  // kind, so both facts survive instead of one overwriting the other.
  assert.deepEqual(visit({ referrer: 'https://www.reddit.com/r/sf/', landingKind: 'group' }),
    { source: 'social', detail: 'reddit' });
});

test('an invite link opened straight from the address bar still reads as direct', () => {
  assert.deepEqual(visit({ landingKind: 'group', fetchSite: 'same-origin' }),
    { source: 'internal', detail: null });
});

// ─── Direct vs unknown ────────────────────────────────────────────────────────

test('only a browser saying the navigation had no initiator counts as direct', () => {
  assert.deepEqual(visit({ fetchSite: 'none' }), { source: 'direct', detail: null });
});

test('a stripped referrer is unknown and is never folded into direct', () => {
  // Both of these have an empty referrer, and the lazy reading would call
  // them direct. They are not: something sent this visitor, we just cannot
  // see what, and counting them as direct overstates people arriving under
  // their own steam.
  assert.deepEqual(visit({ fetchSite: 'cross-site' }), { source: 'unknown', detail: null });
  assert.deepEqual(visit({ fetchSite: undefined }), { source: 'unknown', detail: null });
});

// ─── Robustness ───────────────────────────────────────────────────────────────

test('malformed or non-web referrers fall through instead of throwing', () => {
  for (const referrer of ['', 'not a url', '://', 'android-app://com.example', 'javascript:1', null]) {
    const r = visit({ referrer });
    assert.ok(VISIT_SOURCES.includes(r.source), `${referrer} -> ${r.source}`);
    assert.notEqual(r.source, 'referral', `${referrer} should not become a referral`);
  }
});

test('no arguments at all still returns a usable verdict', () => {
  assert.deepEqual(classifyVisit(), { source: 'unknown', detail: null });
  assert.deepEqual(classifyVisit({}), { source: 'unknown', detail: null });
});

test('the fetch site header is read case-insensitively', () => {
  assert.equal(visit({ fetchSite: 'None' }).source, 'direct');
  assert.equal(visit({ fetchSite: 'Same-Origin' }).source, 'internal');
});
