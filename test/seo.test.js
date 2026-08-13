import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  renderPage, renderSitemap, pageTitle, pageDescription, canonicalUrl,
  renderJsonLd, PAGE_TOKENS,
} from '../scripts/seo-prerender.js';
import { buildPages } from '../scripts/build-pages.js';
import { listFestivals, getFestival, DEFAULT_FESTIVAL_SLUG } from '../shared/festivals/index.js';
import { buildFestival } from '../shared/festival.js';

const TEMPLATE = readFileSync(new URL('../client/index.html', import.meta.url), 'utf8');
// A specific real festival, not "whichever is default" — the assertions below
// are about this lineup's stages, venue and per-day stage names, and were
// silently coupled to the default until the two stopped being the same.
const real = getFestival('outside-lands-2026');

/*
 * A second festival, invented here. There is only one real one, so without
 * this nothing would prove that pages are actually per festival rather than
 * incidentally correct for the single lineup that exists.
 */
const other = buildFestival({
  slug: 'test-fest-2027',
  name: 'Test Fest 2027',
  shortName: 'Test Fest',
  year: 2027,
  venue: 'Somewhere Else',
  dateRange: 'July 1, 2027',
  officialUrl: 'https://example.invalid/',
  utcOffset: '-07:00',
  place: {
    name: 'A Field', streetAddress: '1 Road', addressLocality: 'Town',
    addressRegion: 'CA', postalCode: '90000', addressCountry: 'US',
  },
  headliners: ['Headliner One'],
  notableActs: [],
  stages: [{ id: 'main', name: 'Main Field', short: 'MF', color: '--ocean-deep' }],
  days: [{ id: 'sat', name: 'Saturday', date: 'Jul 1' }],
  sets: { sat: [['main', '13:00', '14:00', 'Headliner One']] },
});

test('a rendered page has no placeholders left', () => {
  for (const f of [real, other]) {
    const html = renderPage(TEMPLATE, f);
    for (const token of PAGE_TOKENS) {
      assert.ok(!html.includes(token), `${f.slug} still contains ${token}`);
    }
  }
});

test('title and description come from the festival', () => {
  const html = renderPage(TEMPLATE, real);
  // Compared escaped: a title containing '&' must appear as '&amp;'.
  assert.ok(html.includes(`<title>${escapeForHtml(pageTitle(real))}</title>`));
  assert.ok(pageTitle(real).includes('Outside Lands 2026'));
  assert.ok(pageTitle(real).includes('Charli xcx'));

  const desc = pageDescription(real);
  assert.ok(desc.includes('Golden Gate Park'), desc);
  assert.ok(desc.includes('8 stages'), desc);
  assert.match(desc, /\d+\+ more/, desc);
});

test('each festival is canonical at its own slug, never at /', () => {
  for (const f of [real, other]) {
    assert.equal(canonicalUrl(f), `https://setlistpicks.com/${f.slug}/`);
    const html = renderPage(TEMPLATE, f);
    assert.ok(html.includes(`<link rel="canonical" href="https://setlistpicks.com/${f.slug}/" />`));
    assert.ok(!html.includes('href="https://setlistpicks.com/" '));
  }
});

test('pages are indexable by default', () => {
  assert.ok(renderPage(TEMPLATE, real).includes('content="index, follow"'));
});

test('the prerendered lineup lists every act', () => {
  const html = renderPage(TEMPLATE, real);
  for (const set of real.SCHEDULE) {
    for (const name of set.artists) {
      assert.ok(html.includes(escapeForHtml(name)), `missing act: ${name}`);
    }
  }
});

test('the lineup uses each day\'s own stage name', () => {
  // Dolores' rebrands nightly; a page showing only the generic name would be
  // wrong for two of the three days.
  const html = renderPage(TEMPLATE, real);
  for (const name of ["Dolores&#039; x Hot Goth GF", "Dolores' x Hot Goth GF"]) {
    if (html.includes(name)) return;
  }
  assert.fail('per-day stage name not found in the prerendered lineup');
});

test('one festival\'s page contains nothing from another', () => {
  const mine = renderPage(TEMPLATE, other);
  assert.ok(mine.includes('Test Fest 2027'));
  assert.ok(mine.includes('Headliner One'));
  for (const leaked of ['Outside Lands', 'Charli xcx', 'Golden Gate Park', 'Dolores']) {
    assert.ok(!mine.includes(leaked), `leaked from another festival: ${leaked}`);
  }
});

test('JSON-LD is valid and derived from the schedule', () => {
  for (const f of [real, other]) {
    const raw = renderJsonLd(f);
    const json = JSON.parse(raw.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, ''));
    assert.equal(json['@type'], 'MusicFestival');
    assert.equal(json.name, f.name);
    assert.equal(json.url, canonicalUrl(f));
    assert.equal(json.subEvent.length, f.SCHEDULE.length);
    assert.equal(json.location.name, f.place.name);
    // Bounds come from the grid, so they cannot drift from the set times.
    assert.ok(json.startDate.startsWith(`${f.year}-`), json.startDate);
    assert.ok(json.endDate > json.startDate);
    // Co-billed slots list one performer each.
    const merged = f.SCHEDULE.find((s) => s.artists.length > 1);
    if (merged) {
      const ev = json.subEvent.find((e) => e.name === merged.artist);
      assert.equal(ev.performer.length, merged.artists.length);
    }
  }
});

test('the sitemap lists every festival at its canonical URL', () => {
  const xml = renderSitemap(listFestivals());
  assert.ok(xml.startsWith('<?xml'));
  for (const f of listFestivals()) {
    assert.ok(xml.includes(`<loc>${canonicalUrl(f)}</loc>`), f.slug);
  }
  assert.equal((xml.match(/<url>/g) ?? []).length, listFestivals().length);
  assert.ok(!xml.includes('<loc>https://setlistpicks.com/</loc>'), '/ is not canonical');
});

test('the sitemap dates each festival from when its data was verified', () => {
  const xml = renderSitemap([real]);
  assert.ok(xml.includes(`<lastmod>${real.dataVerifiedOn}</lastmod>`));
});

/* ─── build-pages ────────────────────────────────────────────────────────── */

function stagedDist() {
  const dir = mkdtempSync(path.join(tmpdir(), 'setlistpicks-dist-'));
  writeFileSync(path.join(dir, 'index.html'), TEMPLATE);
  return dir;
}

test('the build writes a page per festival, a fallback and a sitemap', () => {
  const dist = stagedDist();
  buildPages({ dist, log: () => {} });

  for (const f of listFestivals()) {
    const file = path.join(dist, f.slug, 'index.html');
    assert.ok(existsSync(file), `missing ${f.slug}/index.html`);
    const html = readFileSync(file, 'utf8');
    assert.ok(html.includes(`<title>${escapeForHtml(pageTitle(f))}</title>`), f.slug);
  }

  const fallback = readFileSync(path.join(dist, 'index.html'), 'utf8');
  assert.ok(fallback.includes(escapeForHtml(pageTitle(getFestival(DEFAULT_FESTIVAL_SLUG)))));

  const xml = readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
  assert.ok(xml.includes(canonicalUrl(real)));
});

test('the build refuses a template that was already filled in', () => {
  // Guards the ordering trap: if the Vite plugin ever runs at build time
  // again, every festival page would silently be the default one.
  const dist = mkdtempSync(path.join(tmpdir(), 'setlistpicks-dist-'));
  writeFileSync(path.join(dist, 'index.html'), renderPage(TEMPLATE, real));
  assert.throws(() => buildPages({ dist, log: () => {} }), /already filled/i);
});

test('generated pages leave no placeholder behind', () => {
  const dist = stagedDist();
  buildPages({ dist, log: () => {} });
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
  for (const file of walk(dist).filter((f) => f.endsWith('.html'))) {
    const html = readFileSync(file, 'utf8');
    for (const token of PAGE_TOKENS) {
      assert.ok(!html.includes(token), `${file} contains ${token}`);
    }
  }
});

function escapeForHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
