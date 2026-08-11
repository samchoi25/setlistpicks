/*
 * URL shapes, in one place.
 *
 * The group-code pattern used to be written out separately in server/index.js
 * and client/src/App.jsx. They agreed, but nothing kept them in sync — and a
 * disagreement would mean the server serving a page the client refuses to
 * route, or vice versa. Both now parse through here.
 *
 *   /                       the front door
 *   /:slug                  a festival — resume or start a group
 *   /:slug/:code            a group within a festival
 *   /:code                  legacy: a group link shared before slugs existed
 */
import {
  GROUP_CODE_RE, getFestival, isCanonicalSlug,
} from './festivals/index.js';

export { GROUP_CODE_RE };

export const festivalPath = (slug) => `/${slug}`;
export const groupPath = (slug, code) => `/${slug}/${code}`;

function splitPath(pathname) {
  // Tolerate a trailing slash and a missing leading one; reject anything with
  // an empty interior segment ('//a') so odd input can't parse as valid.
  const trimmed = String(pathname ?? '').split('?')[0].split('#')[0];
  const parts = trimmed.split('/').filter((p, i, all) => !(p === '' && (i === 0 || i === all.length - 1)));
  return parts;
}

/*
 * Classify a pathname. Returns a tagged object rather than a regex match so
 * callers branch on intent, not on capture-group positions.
 *
 *   { kind: 'home' }
 *   { kind: 'festival',     slug, canonicalSlug, isAlias }
 *   { kind: 'group',        slug, canonicalSlug, isAlias, code }
 *   { kind: 'legacy-group', code }   — needs a lookup to know its festival
 *   { kind: 'unknown' }
 */
export function parsePath(pathname) {
  const parts = splitPath(pathname);

  if (parts.length === 0) return { kind: 'home' };
  if (parts.some((p) => p === '')) return { kind: 'unknown' };

  const [first, second, ...rest] = parts;
  if (rest.length) return { kind: 'unknown' };

  // The registry is consulted before the code pattern. A slug can never look
  // like a code — the registry rejects one that could at import time — but
  // resolving festivals first keeps that guarantee local to one place.
  const festival = getFestival(first);
  if (festival) {
    const shape = {
      slug: first,
      canonicalSlug: festival.slug,
      isAlias: !isCanonicalSlug(first),
    };
    if (second === undefined) return { kind: 'festival', ...shape };
    if (GROUP_CODE_RE.test(second)) return { kind: 'group', ...shape, code: second };
    return { kind: 'unknown' };
  }

  if (second === undefined && GROUP_CODE_RE.test(first)) {
    return { kind: 'legacy-group', code: first };
  }

  return { kind: 'unknown' };
}

/*
 * Where a parsed path should end up, or null if it is already canonical.
 * Aliases and legacy links resolve to the canonical group URL so a shared link
 * settles on one address instead of several equivalent ones.
 *
 * `lookupFestival` maps a bare group code to its festival slug; it is the only
 * part that needs a database, which is why it is injected rather than imported.
 */
export function canonicalRedirect(parsed, { defaultSlug, lookupFestival } = {}) {
  switch (parsed.kind) {
    case 'home':
      return defaultSlug ? festivalPath(defaultSlug) : null;
    case 'festival':
      return parsed.isAlias ? festivalPath(parsed.canonicalSlug) : null;
    case 'group':
      return parsed.isAlias ? groupPath(parsed.canonicalSlug, parsed.code) : null;
    case 'legacy-group': {
      const slug = lookupFestival?.(parsed.code);
      return slug ? groupPath(slug, parsed.code) : null;
    }
    default:
      return null;
  }
}

// Group pages are noindex: they are private to a crew and would otherwise
// dilute the festival page they all duplicate.
export function isGroupPath(pathname) {
  const kind = parsePath(pathname).kind;
  return kind === 'group' || kind === 'legacy-group';
}
