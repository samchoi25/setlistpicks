/*
 * Recording where visitors came from.
 *
 * What this counts
 * ----------------
 * Server-reached navigations: every HTML page the app actually serves. The
 * Service Worker is network-first for navigations (see scripts/build-sw.js),
 * so an online repeat visit still reaches this code, and a conditional GET
 * does too — res.send only sets an ETag, so a 304 is still a request we see.
 *
 * What it does not count, deliberately:
 *   - loads served from the SW cache, which only happens offline, where a
 *     client-side beacon could not have been sent either
 *   - bfcache / back-forward restores
 *   - in-app SPA route changes, which aren't arrivals at all
 *
 * The alternative was a beacon from the client. It was not taken: it would
 * add bytes to the bundle for numbers that are already complete, and it would
 * lose the two headers that make the classification work — a beacon is a
 * same-origin POST, so the navigation's own Referer and Sec-Fetch-Site are
 * gone by the time it fires, and `direct` could no longer be told apart from
 * `unknown`.
 */
import { db as defaultDb } from './db.js';
import { classifyVisit } from '../shared/traffic.js';
import { DEFAULT_FESTIVAL_SLUG } from '../shared/festivals/index.js';

/*
 * Conservative on purpose: a missed crawler shows up as one extra visit,
 * whereas a false positive quietly deletes a real person from the numbers.
 * Only self-identifying agents and the obvious scripted clients are matched.
 */
const BOT_RE = new RegExp([
  'bot\\b', 'bot/', 'crawler', 'crawl\\b', 'spider', 'slurp',
  // Link-preview fetchers. Matched narrowly — 'whatsapp/' is the preview
  // fetcher's UA, while a person browsing from inside WhatsApp must not be
  // swept up with it: a link pasted into a chat is the single most important
  // arrival this app has, and flagging those as bots would erase it.
  'facebookexternalhit', 'embedly', 'quora link preview', 'bitlybot',
  'skypeuripreview', 'whatsapp/', 'telegrambot', 'discordbot',
  // Automation and monitoring.
  'headlesschrome', 'lighthouse', 'pagespeed', 'gtmetrix', 'pingdom',
  'uptime', 'monitoring',
  // Scripted clients.
  'curl/', 'wget', 'python-requests', 'python-urllib', 'go-http-client',
  'node-fetch', 'axios/', 'okhttp', 'libwww-perl', 'java/',
].join('|'), 'i');

export function isBotUserAgent(ua) {
  // No user agent at all is a script, not a browser.
  if (!ua) return true;
  return BOT_RE.test(String(ua));
}

/*
 * Whether a request is a real page view worth a row.
 *
 * The catch-all this runs from answers anything that isn't /api or a static
 * file, which includes a browser's speculative prefetches and stray asset
 * 404s like /favicon.ico. Neither is somebody arriving.
 */
export function isPageView(req) {
  const h = req?.headers ?? {};

  // Chrome sends Sec-Purpose; older builds and some others send Purpose.
  const purpose = String(h['sec-purpose'] ?? h.purpose ?? '');
  if (/prefetch|prerender/i.test(purpose)) return false;

  const dest = h['sec-fetch-dest'];
  if (dest) return dest === 'document';

  // No Sec-Fetch-Dest (an older browser, or a bot): fall back to the path.
  // A dotted last segment is an asset request, not a page.
  const last = String(req?.path ?? '').split('/').pop();
  return !last.includes('.');
}

/*
 * Takes the database so tests can pass openDb(':memory:'), matching
 * createStore in groups.js — and, as there, the statement is prepared once
 * here rather than inside the handler.
 */
export function createVisitStore(db) {
  const insert = db.prepare(`
    INSERT INTO visits (ts, source, detail, landing_kind, festival_slug, bot)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  function recordVisit({
    source, detail = null, landingKind, festivalSlug = null, bot = false, now = Date.now(),
  }) {
    insert.run(now, source, detail, landingKind, festivalSlug, bot ? 1 : 0);
  }

  /*
   * Classify and store one request.
   *
   * `parsed` is the already-parsed route from the caller — parsePath has
   * run once by the time this is reached, and re-parsing to learn the same
   * thing would only risk the two answers drifting apart.
   *
   * Returns the stored row (or null when nothing was stored) so tests can
   * assert on the verdict without reading it back out of the database.
   */
  function recordRequestVisit(req, parsed) {
    try {
      if (!isPageView(req)) return null;

      const h = req.headers ?? {};
      const { source, detail } = classifyVisit({
        referrer: h.referer ?? h.referrer,
        host: h.host,
        fetchSite: h['sec-fetch-site'],
        landingKind: parsed?.kind,
      });

      // `/` serves the default festival's page, so that's the festival this
      // arrival belongs to. Which page it was stays visible in landing_kind.
      const festivalSlug = parsed?.kind === 'home'
        ? DEFAULT_FESTIVAL_SLUG
        : (parsed?.canonicalSlug ?? null);

      const row = {
        source,
        detail,
        landingKind: parsed?.kind ?? 'unknown',
        festivalSlug,
        bot: isBotUserAgent(h['user-agent']),
      };
      recordVisit(row);
      return row;
    } catch (e) {
      // Never let a counter take the page down with it.
      console.warn(`[visits] not recorded: ${e.message}`);
      return null;
    }
  }

  return { recordVisit, recordRequestVisit };
}

export const store = createVisitStore(defaultDb);

export const { recordVisit, recordRequestVisit } = store;
