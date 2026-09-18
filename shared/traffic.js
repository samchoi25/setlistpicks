/*
 * Where a visitor came from, in one place.
 *
 * The raw signals are messy: `Referer` is absent for a typed URL, absent again
 * when a messaging app strips it, and trimmed to the bare origin by most
 * referrer policies. Storing those strings would mean re-deciding what they
 * mean every time anyone reads the numbers, so this module decides once and
 * the database only ever holds the verdict.
 *
 * Deliberately pure — no request object, no DOM, no database — so both sides
 * could use it and `node --test` can exercise every branch, the same shape as
 * shared/routes.js.
 */

// The complete set. `unknown` is a real answer, not a dumping ground: it means
// "the browser told us nothing", which is a different fact from "the visitor
// typed the address" and must never be folded into `direct`.
export const VISIT_SOURCES = Object.freeze([
  'group-link', 'search', 'social', 'referral', 'direct', 'internal', 'unknown',
]);

const MAX_DETAIL_LEN = 64;

// Matched against the normalised hostname. Google alone spans ~190 ccTLDs, so
// these are patterns rather than a flat list, and each maps to one stable
// label — google.co.uk and google.com must not read as two different engines.
const SEARCH_HOSTS = [
  [/(^|\.)google\./, 'google'],
  [/(^|\.)bing\.com$/, 'bing'],
  [/(^|\.)duckduckgo\.com$/, 'duckduckgo'],
  [/(^|\.)search\.yahoo\./, 'yahoo'],
  [/(^|\.)ecosia\.org$/, 'ecosia'],
  [/(^|\.)search\.brave\.com$/, 'brave'],
  [/(^|\.)startpage\.com$/, 'startpage'],
  [/(^|\.)qwant\.com$/, 'qwant'],
  [/(^|\.)yandex\./, 'yandex'],
  [/(^|\.)baidu\.com$/, 'baidu'],
  // Answer engines sit here rather than in their own bucket: from the app's
  // side they behave exactly like a search result — someone asked a question
  // and got sent here.
  [/(^|\.)chatgpt\.com$/, 'chatgpt'],
  [/(^|\.)perplexity\.ai$/, 'perplexity'],
  [/(^|\.)claude\.ai$/, 'claude'],
];

// Social *and* messaging. The messaging entries are thin on purpose: WhatsApp,
// iMessage, Signal and most native share sheets send no referrer at all, so a
// shared link from them surfaces as `group-link` or `unknown` below, never
// here. What lands here is the web clients and link shims.
const SOCIAL_HOSTS = [
  [/(^|\.)reddit\.com$/, 'reddit'],
  [/(^|\.)redd\.it$/, 'reddit'],
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)facebook\.com$/, 'facebook'],
  [/(^|\.)fb\.me$/, 'facebook'],
  [/^t\.co$/, 'twitter'],
  [/(^|\.)twitter\.com$/, 'twitter'],
  [/(^|\.)x\.com$/, 'twitter'],
  [/(^|\.)tiktok\.com$/, 'tiktok'],
  [/(^|\.)threads\.(net|com)$/, 'threads'],
  [/(^|\.)bsky\.app$/, 'bluesky'],
  [/(^|\.)youtube\.com$/, 'youtube'],
  [/(^|\.)youtu\.be$/, 'youtube'],
  [/(^|\.)linkedin\.com$/, 'linkedin'],
  [/^lnkd\.in$/, 'linkedin'],
  [/(^|\.)pinterest\./, 'pinterest'],
  [/(^|\.)tumblr\.com$/, 'tumblr'],
  [/(^|\.)discord\.com$/, 'discord'],
  [/^t\.me$/, 'telegram'],
  [/(^|\.)snapchat\.com$/, 'snapchat'],
  [/(^|\.)web\.whatsapp\.com$/, 'whatsapp'],
];

/*
 * Lowercase, drop any port, drop a leading `www.`, and cap the length.
 *
 * The cap matters because a referral's hostname is the one field here that
 * isn't drawn from a fixed list — it comes off the wire, so it gets bounded
 * before it can reach a column.
 */
function normaliseHost(host) {
  if (!host) return null;
  const bare = String(host).toLowerCase().split(':')[0].replace(/^www\./, '');
  return bare ? bare.slice(0, MAX_DETAIL_LEN) : null;
}

/*
 * The hostname of a referrer, or null if there isn't a usable one.
 *
 * Everything after the host is discarded right here, before any caller can
 * reach it: a referring URL's path and query are the one place a referrer can
 * carry something personal (a search term, a session token someone pasted),
 * and nothing downstream has a use for them.
 */
function referrerHost(referrer) {
  if (!referrer) return null;
  let url;
  try {
    url = new URL(String(referrer));
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  return normaliseHost(url.hostname);
}

function matchHost(table, host) {
  for (const [pattern, label] of table) {
    if (pattern.test(host)) return label;
  }
  return null;
}

/*
 * Classify one arrival.
 *
 *   referrer    the Referer header (or document.referrer) — may be absent
 *   host        this app's own host, for telling in-app links apart
 *   fetchSite   the Sec-Fetch-Site header: none | same-origin | same-site | cross-site
 *   landingKind the `kind` from parsePath() for the URL being landed on
 *
 * Returns { source, detail } where source is one of VISIT_SOURCES and detail
 * is a short label, a bare hostname, or null. Never throws.
 */
export function classifyVisit({ referrer, host, fetchSite, landingKind } = {}) {
  const from = referrerHost(referrer);
  const own = normaliseHost(host);
  const site = fetchSite ? String(fetchSite).toLowerCase() : null;
  const isGroupLanding = landingKind === 'group' || landingKind === 'legacy-group';

  if (from) {
    // Checked before everything else so a group page opened from inside the
    // app doesn't read as a link someone shared.
    if (own && from === own) return { source: 'internal', detail: null };

    const engine = matchHost(SEARCH_HOSTS, from);
    if (engine) return { source: 'search', detail: engine };

    const platform = matchHost(SOCIAL_HOSTS, from);
    if (platform) return { source: 'social', detail: platform };

    // Note this catches a group invite shared somewhere that preserves the
    // referrer, which lands as `social`/`referral` rather than `group-link`.
    // That's intended: the "it was an invite" fact is carried separately by
    // the landing kind, so the two can be read together.
    return { source: 'referral', detail: from };
  }

  // No usable referrer from here down.

  // A strict referrer policy on an in-app link strips the header but can't
  // change what the browser knows about the navigation.
  if (site === 'same-origin' || site === 'same-site') {
    return { source: 'internal', detail: null };
  }

  // Nobody types ten random characters. A group URL reached with no referrer
  // is a link pasted into WhatsApp, iMessage, Signal or a native share sheet
  // — all of which send no Referer at all. This is the app's main sharing
  // path, so it gets its own answer rather than being guessed at.
  if (isGroupLanding) return { source: 'group-link', detail: null };

  // `none` means the browser is telling us this navigation had no initiator:
  // typed, bookmarked, or opened from an app that hands over a bare URL.
  if (site === 'none') return { source: 'direct', detail: null };

  // Either Sec-Fetch-Site said cross-site (so there *was* a referrer and it
  // was stripped) or the header is missing entirely (an older browser, a bot).
  // Both are genuinely unknown, and calling them `direct` would quietly
  // inflate the one number a site owner is most tempted to over-read.
  return { source: 'unknown', detail: null };
}
