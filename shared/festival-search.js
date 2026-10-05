/*
 * Local festival lookup — type-ahead suggestions over the festival registry,
 * with no network call. Every festival definition is already in the bundle
 * (shared/festivals/index.js), so the whole search runs in memory.
 *
 * Matching is forgiving on purpose: case, accents and punctuation are ignored
 * ("sea hear now" finds Sea.Hear.Now, "bourbon and" finds Bourbon & Beyond),
 * initials work ("acl", "hsb"), and a multi-word query matches when every word
 * hits somewhere — name, short name, slug, alias, venue or city.
 */
import { listFestivals, FESTIVAL_ALIASES } from './festivals/index.js';
import { festivalStartsAt, hasFestivalEnded } from './festival.js';

// Lowercase, strip accents, treat `&` as "and", and collapse everything that
// isn't a letter or digit to single spaces.
export function normalize(str) {
  return String(str ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const words = (str) => normalize(str).split(' ').filter(Boolean);

// "Austin City Limits Music Festival 2026" → "acl" style initials. Digits-only
// words (the year) are skipped so "acl" isn't "aclmf2".
function initialsOf(str) {
  return words(str).filter((w) => !/^\d+$/.test(w)).map((w) => w[0]).join('');
}

const aliasesBySlug = new Map();
for (const [alias, slug] of Object.entries(FESTIVAL_ALIASES)) {
  if (!aliasesBySlug.has(slug)) aliasesBySlug.set(slug, []);
  aliasesBySlug.get(slug).push(alias);
}

/*
 * Precomputed, per-festival search fields. Built once per festival list and
 * cached, since the registry never changes at runtime.
 */
function indexEntry(festival) {
  const primary = [festival.shortName, festival.name];
  const secondary = [
    festival.slug,
    ...(aliasesBySlug.get(festival.slug) ?? []),
    festival.venue,
    festival.place?.name,
    festival.place?.addressLocality,
    festival.place?.addressRegion,
  ].filter(Boolean);
  return {
    festival,
    primaryText: primary.map(normalize).join(' '),
    primaryWords: primary.flatMap(words),
    secondaryWords: secondary.flatMap(words),
    // Compact forms so "seahearnow" or "louderthan" still find their festival.
    compact: primary.map((s) => normalize(s).replace(/ /g, '')),
    initials: primary.map(initialsOf).filter((s) => s.length > 1),
    startsAt: +festivalStartsAt(festival),
  };
}

let cachedFor = null;
let cachedIndex = null;
function getIndex(festivals) {
  if (cachedFor !== festivals) {
    cachedFor = festivals;
    cachedIndex = festivals.map(indexEntry);
  }
  return cachedIndex;
}

// Higher is better; 0 means no match. Whole-query matches against the name
// outrank per-word matches, which outrank venue/city hits.
function score(entry, query, tokens) {
  const compactQuery = query.replace(/ /g, '');
  const shortName = normalize(entry.festival.shortName);
  if (shortName === query) return 1000;
  let s = 0;
  if (shortName.startsWith(query)) s = 900;
  else if (entry.primaryText.startsWith(query)) s = 800;
  else if (entry.initials.some((i) => i === compactQuery)) s = 750;
  else if (entry.compact.some((c) => c.startsWith(compactQuery))) s = 700;
  else if (entry.initials.some((i) => i.startsWith(compactQuery)) && compactQuery.length > 1) s = 600;
  if (s) return s;

  // Every token must land on some word; a token that only hits the venue/city
  // counts for less than one that hits the name.
  let total = 0;
  for (const t of tokens) {
    if (entry.primaryWords.some((w) => w === t)) total += 100;
    else if (entry.primaryWords.some((w) => w.startsWith(t))) total += 80;
    else if (entry.secondaryWords.some((w) => w.startsWith(t))) total += 40;
    else if (t.length >= 3 && entry.primaryText.includes(t)) total += 20;
    else return 0;
  }
  return total / tokens.length;
}

/*
 * Suggest festivals for a partial query, best match first.
 *
 *   suggestFestivals('acl')       → [ACL Week 1, ACL Week 2]
 *   suggestFestivals('san fran')  → every San Francisco festival
 *   suggestFestivals('')          → every festival, upcoming first
 *
 * Options:
 *   limit         max results (default 8; pass Infinity for all)
 *   includeEnded  keep festivals that have already finished (default true —
 *                 they still sort after upcoming ones at the same score)
 *   festivals     the list to search (default: the whole registry)
 *   now           reference time for "ended", for tests
 *
 * Returns the built festival objects themselves, so callers can read slug,
 * shortName, dateRange, venue, etc. directly.
 */
export function suggestFestivals(rawQuery, {
  limit = 8,
  includeEnded = true,
  festivals = listFestivals(),
  now = new Date(),
} = {}) {
  const query = normalize(rawQuery);
  const tokens = query ? query.split(' ') : [];

  const ranked = [];
  for (const entry of getIndex(festivals)) {
    const ended = hasFestivalEnded(entry.festival, now);
    if (ended && !includeEnded) continue;
    const s = query ? score(entry, query, tokens) : 1;
    if (s > 0) ranked.push({ entry, s, ended });
  }

  ranked.sort((a, b) => (b.s - a.s)
    || (a.ended - b.ended)
    // Upcoming: soonest first. Ended: most recent first.
    || (a.ended ? b.entry.startsAt - a.entry.startsAt : a.entry.startsAt - b.entry.startsAt));

  return ranked.slice(0, limit).map((r) => r.entry.festival);
}
