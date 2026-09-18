import test from 'node:test';
import assert from 'node:assert/strict';
import { openDb, pruneOldVisits } from '../server/db.js';
import { createVisitStore, isBotUserAgent, isPageView } from '../server/visits.js';
import { DEFAULT_FESTIVAL_SLUG } from '../shared/festivals/index.js';

// Each test gets its own database so ordering never matters.
function fresh() {
  const db = openDb(':memory:');
  return { db, store: createVisitStore(db) };
}

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15';

// A plausible browser navigation, overridable one header at a time.
const pageRequest = (headers = {}, path = '/outside-lands-2026') => ({
  path,
  headers: {
    host: 'setlistpicks.com',
    'user-agent': BROWSER_UA,
    'sec-fetch-dest': 'document',
    'sec-fetch-site': 'none',
    ...headers,
  },
});

const rows = (db) => db.prepare('SELECT * FROM visits ORDER BY id').all();

// ─── The store holds nothing identifying ──────────────────────────────────────

test('the visits table has exactly the columns it is meant to have', () => {
  // A guard, not a tautology: the point is that adding an ip, user_agent,
  // session or url column has to fail here first. creator_ip exists for the
  // rate limits in groups.js and must not spread to a table that records
  // every page someone opens.
  const { db } = fresh();
  const columns = db.prepare('PRAGMA table_info(visits)').all().map((c) => c.name);

  assert.deepEqual(columns, ['id', 'ts', 'source', 'detail', 'landing_kind', 'festival_slug', 'bot']);
  for (const forbidden of ['ip', 'creator_ip', 'user_agent', 'ua', 'session', 'session_id', 'url', 'path', 'referrer']) {
    assert.ok(!columns.includes(forbidden), `visits must not store ${forbidden}`);
  }
});

// ─── Recording ────────────────────────────────────────────────────────────────

test('a visit is stored with the verdict it was given', () => {
  const { db, store } = fresh();
  store.recordVisit({
    source: 'search', detail: 'google', landingKind: 'festival',
    festivalSlug: 'portola-2026', bot: false, now: 1700000000000,
  });

  assert.deepEqual(rows(db), [{
    id: 1, ts: 1700000000000, source: 'search', detail: 'google',
    landing_kind: 'festival', festival_slug: 'portola-2026', bot: 0,
  }]);
});

test('a request is classified and stored in one step', () => {
  const { db, store } = fresh();
  const parsed = { kind: 'festival', canonicalSlug: 'portola-2026' };
  const verdict = store.recordRequestVisit(
    pageRequest({ referer: 'https://www.google.com/search?q=portola', 'sec-fetch-site': 'cross-site' }),
    parsed,
  );

  assert.equal(verdict.source, 'search');
  assert.equal(verdict.detail, 'google');
  const [row] = rows(db);
  assert.equal(row.source, 'search');
  assert.equal(row.landing_kind, 'festival');
  assert.equal(row.festival_slug, 'portola-2026');
});

test('an invite link with no referrer is recorded as a shared group link', () => {
  const { db, store } = fresh();
  store.recordRequestVisit(
    pageRequest({ 'sec-fetch-site': 'cross-site' }, '/outside-lands-2026/9kg6kwvzzw'),
    { kind: 'group', canonicalSlug: 'outside-lands-2026', code: '9kg6kwvzzw' },
  );

  const [row] = rows(db);
  assert.equal(row.source, 'group-link');
  assert.equal(row.landing_kind, 'group');
  // The code itself is never stored — which group was opened is not the
  // question this table answers.
  assert.ok(!JSON.stringify(row).includes('9kg6kwvzzw'));
});

test('the front door is attributed to the festival it actually serves', () => {
  // `/` renders the default festival's page, so a visit there belongs to that
  // festival; landing_kind keeps the two apart.
  const { db, store } = fresh();
  store.recordRequestVisit(pageRequest({}, '/'), { kind: 'home' });

  const [row] = rows(db);
  assert.equal(row.festival_slug, DEFAULT_FESTIVAL_SLUG);
  assert.equal(row.landing_kind, 'home');
});

test('a path with no festival stores no festival', () => {
  const { db, store } = fresh();
  store.recordRequestVisit(pageRequest({}, '/nope'), { kind: 'unknown' });
  assert.equal(rows(db)[0].festival_slug, null);
});

// ─── Crawlers ─────────────────────────────────────────────────────────────────

test('a crawler is flagged rather than dropped', () => {
  const { db, store } = fresh();
  store.recordRequestVisit(
    pageRequest({ 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }),
    { kind: 'festival', canonicalSlug: 'portola-2026' },
  );

  assert.equal(rows(db).length, 1, 'the row should still be written');
  assert.equal(rows(db)[0].bot, 1);
});

test('people browsing from inside a messaging app are not mistaken for its link fetcher', () => {
  // The single most damaging false positive available: a link pasted into a
  // chat is this app's main sharing path, and flagging those arrivals as
  // crawlers would hide them from the default admin view entirely.
  assert.equal(isBotUserAgent(BROWSER_UA), false);
  assert.equal(isBotUserAgent(`${BROWSER_UA} [FB_IAB/Orca-Android]`), false);
  // The fetcher itself does identify as one.
  assert.equal(isBotUserAgent('WhatsApp/2.23.20.0 A'), true);
  assert.equal(isBotUserAgent('facebookexternalhit/1.1'), true);
  // No user agent at all is a script, not a person.
  assert.equal(isBotUserAgent(''), true);
  assert.equal(isBotUserAgent(undefined), true);
});

// ─── What doesn't count as an arrival ─────────────────────────────────────────

test('a prefetch is not an arrival', () => {
  const { db, store } = fresh();
  for (const headers of [{ 'sec-purpose': 'prefetch;prerender' }, { purpose: 'prefetch' }]) {
    store.recordRequestVisit(pageRequest(headers), { kind: 'festival' });
  }
  assert.equal(rows(db).length, 0);
});

test('only document requests count', () => {
  const { db, store } = fresh();
  store.recordRequestVisit(pageRequest({ 'sec-fetch-dest': 'image' }, '/og-image.png'), { kind: 'unknown' });
  store.recordRequestVisit(pageRequest({ 'sec-fetch-dest': 'empty' }), { kind: 'festival' });
  assert.equal(rows(db).length, 0);
});

test('without Sec-Fetch-Dest, a request for a file is not counted as a page', () => {
  // Older browsers and crawlers send no Sec-Fetch-Dest, and the catch-all
  // this runs from answers stray asset 404s like /favicon.ico.
  assert.equal(isPageView({ path: '/favicon.ico', headers: {} }), false);
  assert.equal(isPageView({ path: '/apple-touch-icon.png', headers: {} }), false);
  assert.equal(isPageView({ path: '/outside-lands-2026', headers: {} }), true);
  assert.equal(isPageView({ path: '/', headers: {} }), true);
});

// ─── Failure is never the page's problem ──────────────────────────────────────

test('a request it cannot read is skipped, not thrown', () => {
  const { db, store } = fresh();
  const warn = console.warn;
  console.warn = () => {};
  try {
    assert.equal(store.recordRequestVisit(null, null), null);
  } finally {
    console.warn = warn;
  }
  assert.equal(rows(db).length, 0);
});

test('a request with no headers is recorded as unknown rather than guessed at', () => {
  const { db, store } = fresh();
  assert.equal(store.recordRequestVisit({ path: '/' }, undefined).source, 'unknown');
  const [row] = rows(db);
  assert.equal(row.landing_kind, 'unknown');
  assert.equal(row.bot, 1, 'no user agent means a script, not a person');
});

// ─── Retention ────────────────────────────────────────────────────────────────

test('visits older than the retention window are pruned, and newer ones are not', () => {
  const { db, store } = fresh();
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const base = { source: 'direct', landingKind: 'home' };

  store.recordVisit({ ...base, now: now - 181 * day });
  store.recordVisit({ ...base, now: now - 179 * day });
  store.recordVisit({ ...base, now });

  assert.equal(pruneOldVisits(db, now), 1);
  assert.equal(rows(db).length, 2);
  // Idempotent — a second sweep finds nothing left to do.
  assert.equal(pruneOldVisits(db, now), 0);
});
