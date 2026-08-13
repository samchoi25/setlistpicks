/*
 * Festival registry — the single list of festivals the app serves.
 *
 * Adding a festival means adding a definition module and one line here.
 * Everything else (routing, SEO pages, sitemap, the grid) reads from this.
 */
import { buildFestival } from '../festival.js';
import outsideLands2026 from './outside-lands-2026.js';
import daisyChainFields2026 from './daisy-chain-fields-2026.js';

const DEFINITIONS = [outsideLands2026, daisyChainFields2026];

// A slug must never be mistakable for a group code, which is exactly 10
// characters from this alphabet. `outside-lands-2026` is safe because it
// contains hyphens and digits outside the set, but a bare 10-letter slug like
// 'coachellas' would be ambiguous in `/:something`. Fail loudly at import
// rather than silently shadowing group links.
export const GROUP_CODE_ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz';
export const GROUP_CODE_RE = new RegExp(`^[${GROUP_CODE_ALPHABET}]{10}$`);

// Paths that must keep their own meaning and can never become a festival slug.
export const RESERVED_SLUGS = new Set([
  'api', 'admin', 'healthz', 'ws', 'assets', 'static',
  'robots.txt', 'sitemap.xml', 'og-image.png', 'favicon.ico',
]);

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validate(def) {
  const { slug } = def;
  if (!slug || !SLUG_RE.test(slug)) {
    throw new Error(`Festival slug '${slug}' must be lowercase kebab-case`);
  }
  if (GROUP_CODE_RE.test(slug)) {
    throw new Error(
      `Festival slug '${slug}' is indistinguishable from a group code`,
    );
  }
  if (RESERVED_SLUGS.has(slug)) {
    throw new Error(`Festival slug '${slug}' is reserved`);
  }
  const stageIds = def.stages.map((s) => s.id);
  if (new Set(stageIds).size !== stageIds.length) {
    throw new Error(`${slug}: duplicate stage id`);
  }
  const dayIds = def.days.map((d) => d.id);
  if (new Set(dayIds).size !== dayIds.length) {
    throw new Error(`${slug}: duplicate day id`);
  }
  return def;
}

const bySlug = new Map();
for (const def of DEFINITIONS) {
  validate(def);
  if (bySlug.has(def.slug)) throw new Error(`Duplicate festival slug '${def.slug}'`);
  bySlug.set(def.slug, buildFestival(def));
}

/*
 * Aliases point a shorter, year-less path at a specific edition — `/outside-lands`
 * resolves to whichever year is current. Keeping the canonical slug year-scoped
 * means next year's edition gets its own URLs instead of overwriting this one's.
 */
export const FESTIVAL_ALIASES = Object.freeze({
  'outside-lands': 'outside-lands-2026',
  'daisy-chain-fields': 'daisy-chain-fields-2026',
});

// Where `/` sends visitors until there is a festival picker.
export const DEFAULT_FESTIVAL_SLUG = 'outside-lands-2026';

export function listFestivals() {
  return [...bySlug.values()];
}

// Resolves a canonical slug or an alias. Returns undefined for anything else,
// so callers can fall through to a 404 or a group-code lookup.
export function getFestival(slug) {
  if (!slug) return undefined;
  return bySlug.get(FESTIVAL_ALIASES[slug] ?? slug);
}

export function isFestivalSlug(slug) {
  return getFestival(slug) !== undefined;
}

/*
 * Look up a set by its id across every festival. Ids carry their festival slug
 * (`outside-lands-2026:fri-landsend-0`), so one flat map is unambiguous — which
 * is the point of namespacing them: without it every festival would define
 * `fri-landsend-0` and a vote would be impossible to attribute.
 */
const setsById = new Map();
for (const festival of bySlug.values()) {
  for (const set of festival.SCHEDULE) setsById.set(set.id, set);
}

export function getSetById(id) {
  return setsById.get(id);
}

// True only for the canonical slug, not an alias — used to decide whether a
// request should be redirected to the canonical URL.
export function isCanonicalSlug(slug) {
  return bySlug.has(slug);
}
