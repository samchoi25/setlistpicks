/*
 * Festival registry — the single list of festivals the app serves.
 *
 * Adding a festival means adding a definition module and one line here.
 * Everything else (routing, SEO pages, sitemap, the grid) reads from this.
 */
import { buildFestival, festivalEndsAt, festivalStartsAt } from '../festival.js';
import outsideLands2026 from './outside-lands-2026.js';
import daisyChainFields2026 from './daisy-chain-fields-2026.js';
import portola2026 from './portola-2026.js';
import austinCityLimits2026Week1 from './austin-city-limits-2026-week-1.js';
import austinCityLimits2026Week2 from './austin-city-limits-2026-week-2.js';
import hardlyStrictlyBluegrass2026 from './hardly-strictly-bluegrass-2026.js';
import seaHearNow2026 from './sea-hear-now-2026.js';
import louderThanLife2026 from './louder-than-life-2026.js';
import bourbonAndBeyond2026 from './bourbon-and-beyond-2026.js';
import aftershock2026 from './aftershock-2026.js';

const DEFINITIONS = [
  outsideLands2026, daisyChainFields2026, portola2026,
  austinCityLimits2026Week1, austinCityLimits2026Week2,
  hardlyStrictlyBluegrass2026,
  seaHearNow2026, louderThanLife2026, bourbonAndBeyond2026, aftershock2026,
];

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

// Sitewide default for the WebSocket live-vote-sync feature. A festival
// definition can override with `websocketsEnabled: true` once it's ready
// to turn live sync on; until then every festival inherits this off switch.
export const WEBSOCKETS_ENABLED_DEFAULT = false;

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
  if (def.websocketsEnabled !== undefined && typeof def.websocketsEnabled !== 'boolean') {
    throw new Error(`${slug}: websocketsEnabled must be a boolean`);
  }
  if (!Array.isArray(def.groupNames) || def.groupNames.length === 0) {
    throw new Error(`${slug}: groupNames must be a non-empty array`);
  }
  return def;
}

const bySlug = new Map();
for (const def of DEFINITIONS) {
  validate(def);
  if (bySlug.has(def.slug)) throw new Error(`Duplicate festival slug '${def.slug}'`);
  const websocketsEnabled = def.websocketsEnabled ?? WEBSOCKETS_ENABLED_DEFAULT;
  bySlug.set(def.slug, buildFestival({ ...def, websocketsEnabled }));
}

/*
 * Aliases point a shorter, year-less path at a specific edition — `/outside-lands`
 * resolves to whichever year is current. Keeping the canonical slug year-scoped
 * means next year's edition gets its own URLs instead of overwriting this one's.
 */
export const FESTIVAL_ALIASES = Object.freeze({
  'outside-lands': 'outside-lands-2026',
  'daisy-chain-fields': 'daisy-chain-fields-2026',
  'portola': 'portola-2026',
  'hardly-strictly-bluegrass': 'hardly-strictly-bluegrass-2026',
  'sea-hear-now': 'sea-hear-now-2026',
  'louder-than-life': 'louder-than-life-2026',
  'bourbon-and-beyond': 'bourbon-and-beyond-2026',
  'aftershock': 'aftershock-2026',
});

/*
 * The festival a group belongs to when nothing says otherwise: the only
 * edition that existed before festivals were a concept. It is what a database
 * predating multi-festival support must backfill its rows to, so it is frozen
 * to that edition forever and must not be repointed at whatever is current —
 * doing so silently reattributes every legacy group's votes.
 */
export const LEGACY_FESTIVAL_SLUG = 'outside-lands-2026';

/*
 * Which festival `/` shows a first-time visitor, until there is a picker.
 *
 * Derived rather than hardcoded: people arrive in the days before gates open,
 * so the useful answer is the next festival that hasn't finished, and a
 * hardcoded slug goes stale every few weeks. Evaluated once at import — the
 * server picks up the new answer when it restarts, the client when it is
 * rebuilt, and both happen on every deploy.
 *
 * Once the whole calendar is in the past there is no upcoming edition, so
 * fall back to the one that ended most recently rather than nothing.
 */
function pickDefaultFestival(now = Date.now()) {
  const ranked = [...bySlug.values()]
    .map((f) => ({ slug: f.slug, startsAt: +festivalStartsAt(f), endsAt: +festivalEndsAt(f) }))
    // By when gates open, not when the festival finishes: two festivals can
    // share an end date while one opened days earlier, and that earlier one is
    // the one people are looking up first.
    .sort((a, b) => a.startsAt - b.startsAt || a.endsAt - b.endsAt);
  const upcoming = ranked.filter((f) => f.endsAt >= now);
  return (upcoming[0] ?? ranked[ranked.length - 1]).slug;
}

export const DEFAULT_FESTIVAL_SLUG = pickDefaultFestival();

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
