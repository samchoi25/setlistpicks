/*
 * Festival registry — the single list of festivals the app serves.
 *
 * Adding a festival means adding a definition module and one line here.
 * Everything else (routing, SEO pages, sitemap, the grid) reads from this.
 *
 * Setup checklist for a new festival:
 *   1. Definition module: lineup by day (bare strings until set times land),
 *      headliners, place, dates, groupNames. Cite the source in its header.
 *   2. One import + one DEFINITIONS entry below.
 *   3. Artist links — Spotify, Apple Music, SoundCloud, shown on long-press.
 *        node scripts/artist-links.js <slug>                  # coverage report
 *        node scripts/artist-links.js <slug> --aeg <dataPath> --itunes
 *      generates entries to review and paste into the festival's
 *      `artistLinks`; see the script's header for sources. Look the rest up
 *      by hand, and leave out any act you can't confidently identify.
 *      test/festivals.test.js fails a public festival below 75% coverage
 *      unless it's listed in ARTIST_LINKS_PENDING there.
 *   4. npm test, then check both the festival page and a long-press popup.
 */
import { buildFestival, festivalEndsAt, festivalStartsAt } from '../festival.js';
import {
  isThemeableToken, knownStageTokens, parseColor, FONT_STACKS,
} from '../theme.js';
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
import suwanneeHulaween2026 from './suwannee-hulaween-2026.js';
import escapeHalloween2026 from './escape-halloween-2026.js';
import coachella2027Week1 from './coachella-2027-week-1.js';
import coachella2027Week2 from './coachella-2027-week-2.js';
import stagecoach2027 from './stagecoach-2027.js';
import lucky13 from './lucky-13.js';
import sharedArtistLinks from './artist-links.js';

const DEFINITIONS = [
  outsideLands2026, daisyChainFields2026, portola2026,
  austinCityLimits2026Week1, austinCityLimits2026Week2,
  hardlyStrictlyBluegrass2026,
  seaHearNow2026, louderThanLife2026, bourbonAndBeyond2026, aftershock2026,
  suwanneeHulaween2026, escapeHalloween2026,
  coachella2027Week1, coachella2027Week2,
  stagecoach2027,
  lucky13,
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
  for (const flag of ['userSets', 'secretVotes', 'unlisted', 'snow', 'photos', 'photosAnytime']) {
    if (def[flag] !== undefined && typeof def[flag] !== 'boolean') {
      throw new Error(`${slug}: ${flag} must be a boolean`);
    }
  }
  if (def.logo !== undefined && !(typeof def.logo === 'string' && /^\/[\w./-]+\.(png|svg|webp|jpg)$/.test(def.logo))) {
    throw new Error(`${slug}: logo must be a site path to an image, like /logos/${slug}.png`);
  }
  if (def.maxPicks !== undefined && !(Number.isInteger(def.maxPicks) && def.maxPicks > 0)) {
    throw new Error(`${slug}: maxPicks must be a positive integer`);
  }
  if (def.memberNameWords !== undefined) {
    const { adjectives, nouns } = def.memberNameWords ?? {};
    for (const [key, list] of [['adjectives', adjectives], ['nouns', nouns]]) {
      if (!Array.isArray(list) || !list.length || !list.every((w) => typeof w === 'string' && w.trim())) {
        throw new Error(`${slug}: memberNameWords.${key} must be a non-empty array of words`);
      }
    }
  }
  if (!Array.isArray(def.groupNames) || def.groupNames.length === 0) {
    throw new Error(`${slug}: groupNames must be a non-empty array`);
  }
  validateTheme(def);
  return def;
}

/*
 * Theme and stage-colour checks. Deliberately names, allowlists and
 * parseability only — no contrast. Contrast needs the base palette's *values*,
 * which live in styles.css, and this module is in the browser bundle: reaching
 * them here would mean shipping the palette twice and letting the copies
 * disagree. test/schedule.test.js does the contrast checking, where it can read
 * the stylesheet.
 *
 * Throwing at import rather than leaving this to the tests is the point: a
 * mistyped token then fails the dev server, the build and the API on startup,
 * instead of rendering a transparent block that only a person looking at the
 * right festival would notice.
 */
function validateTheme(def) {
  const { slug, theme } = def;

  if (theme !== undefined) {
    if (theme === null || typeof theme !== 'object' || Array.isArray(theme)) {
      throw new Error(`${slug}: theme must be an object`);
    }
    const { tokens } = theme;
    if (tokens === null || typeof tokens !== 'object' || Array.isArray(tokens)) {
      throw new Error(`${slug}: theme.tokens must be an object`);
    }
    for (const [name, value] of Object.entries(tokens)) {
      if (!isThemeableToken(slug, name)) {
        throw new Error(
          `${slug}: '${name}' is not a themeable token — add it to `
          + `THEMEABLE_TOKENS in shared/theme.js, or namespace it as --${slug}-*`,
        );
      }
      if (name === '--font-display' || name === '--font-body') {
        if (!FONT_STACKS[value]) {
          throw new Error(
            `${slug}: '${name}: ${value}' names no font — pick one of `
            + `${Object.keys(FONT_STACKS).join(', ')}, or add it to FONT_STACKS `
            + 'and to the @import in client/src/styles.css',
          );
        }
      } else if (!parseColor(value)) {
        throw new Error(`${slug}: '${name}: ${value}' is not a colour this understands`);
      }
    }
  }

  // Independent of whether there is a theme at all: every stage colour must
  // name a token something actually defines.
  const known = knownStageTokens(def);
  for (const stage of def.stages) {
    for (const field of ['color', 'headerColor']) {
      const name = stage[field];
      if (name === undefined) continue;
      if (!known.has(name)) {
        throw new Error(
          `${slug}: stage '${stage.id}' ${field} '${name}' is not a known token — `
          + 'it must be one of the stage colours in client/src/styles.css, or a '
          + "token this festival's own theme block defines",
        );
      }
    }
  }
}

/*
 * Festivals that take their artist links from the shared artist-links.js map
 * instead of carrying their own. Three of these four definitions are generated
 * wholesale by scripts/gen-greencopper-festival.py, which emits no artistLinks,
 * so links written into the festival file would not survive the next refresh —
 * attaching them here keeps them out of the generator's way. Listed explicitly
 * rather than applied to every map-less festival so an unrelated festival can
 * never pick up links from a same-named act on one of these bills.
 */
const SHARED_ARTIST_LINK_SLUGS = new Set([
  'louder-than-life-2026', 'bourbon-and-beyond-2026', 'aftershock-2026', 'sea-hear-now-2026',
]);

const bySlug = new Map();
for (const def of DEFINITIONS) {
  validate(def);
  if (bySlug.has(def.slug)) throw new Error(`Duplicate festival slug '${def.slug}'`);
  const websocketsEnabled = def.websocketsEnabled ?? WEBSOCKETS_ENABLED_DEFAULT;
  // Every festival takes photos of its acts (see photosOpenFor in
  // shared/festival.js for when); a definition can opt out with photos: false.
  const photos = def.photos ?? true;
  const artistLinks = def.artistLinks
    ?? (SHARED_ARTIST_LINK_SLUGS.has(def.slug) ? sharedArtistLinks : undefined);
  bySlug.set(def.slug, buildFestival({ ...def, websocketsEnabled, artistLinks, photos }));
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
  'hulaween': 'suwannee-hulaween-2026',
  'suwannee-hulaween': 'suwannee-hulaween-2026',
  'escape-halloween': 'escape-halloween-2026',
  'stagecoach': 'stagecoach-2027',
  // Coachella is two festivals, one per weekend. The bare name goes to
  // Weekend One, the first to happen; Weekend Two keeps its own URL.
  'coachella': 'coachella-2027-week-1',
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
  const ranked = listPublicFestivals()
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

// Everything except `unlisted` events (private parties — see lucky-13.js).
// What any public listing should use: search, the switcher, the sitemap and
// the default page. listFestivals() stays complete for routing and admin.
export function listPublicFestivals() {
  return listFestivals().filter((f) => !f.unlisted);
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
