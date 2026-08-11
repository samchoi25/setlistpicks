import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePath, canonicalRedirect, isGroupPath, festivalPath, groupPath,
} from '../shared/routes.js';
import { DEFAULT_FESTIVAL_SLUG } from '../shared/festivals/index.js';

const CODE = '9kg6kwvzzw';
const SLUG = 'outside-lands-2026';

test('the front door', () => {
  for (const p of ['/', '']) {
    assert.deepEqual(parsePath(p), { kind: 'home' }, p);
  }
});

test('a festival path resolves to its festival', () => {
  const r = parsePath(`/${SLUG}`);
  assert.equal(r.kind, 'festival');
  assert.equal(r.canonicalSlug, SLUG);
  assert.equal(r.isAlias, false);
});

test('a group path carries both slug and code', () => {
  const r = parsePath(`/${SLUG}/${CODE}`);
  assert.equal(r.kind, 'group');
  assert.equal(r.canonicalSlug, SLUG);
  assert.equal(r.code, CODE);
});

test('an alias parses and is flagged as one', () => {
  const r = parsePath(`/outside-lands/${CODE}`);
  assert.equal(r.kind, 'group');
  assert.equal(r.slug, 'outside-lands');
  assert.equal(r.canonicalSlug, SLUG);
  assert.equal(r.isAlias, true);
});

test('a bare code is recognised as a legacy link', () => {
  assert.deepEqual(parsePath(`/${CODE}`), { kind: 'legacy-group', code: CODE });
});

test('trailing slashes do not change the meaning', () => {
  assert.equal(parsePath(`/${SLUG}/`).kind, 'festival');
  assert.equal(parsePath(`/${SLUG}/${CODE}/`).kind, 'group');
  assert.equal(parsePath(`/${CODE}/`).kind, 'legacy-group');
});

test('query strings and fragments are ignored', () => {
  assert.equal(parsePath(`/${SLUG}/${CODE}?utm=x`).kind, 'group');
  assert.equal(parsePath(`/${SLUG}/${CODE}#top`).kind, 'group');
});

test('malformed and hostile paths are unknown, not guessed at', () => {
  for (const p of [
    '/nope',                       // unknown slug
    '/nope/' + CODE,               // unknown slug with a valid code
    `/${SLUG}/${CODE}/extra`,      // too deep
    `/${SLUG}/not-a-code`,         // bad code
    `/${SLUG}/9kg6kwvzz`,          // code one char short
    `/${SLUG}/9kg6kwvzzwx`,        // one too long
    `/${SLUG}/9kg6kwvzz0`,         // 0 is not in the alphabet
    '//' + CODE,                   // empty interior segment
    '/api', '/admin', '/healthz',  // reserved
    '/Outside-Lands-2026',         // wrong case
    '/../etc/passwd',
  ]) {
    assert.equal(parsePath(p).kind, 'unknown', p);
  }
});

test('reserved paths never resolve to a festival', () => {
  for (const p of ['/api', '/assets', '/sitemap.xml', '/robots.txt']) {
    assert.equal(parsePath(p).kind, 'unknown', p);
  }
});

test('home redirects to the default festival', () => {
  assert.equal(
    canonicalRedirect(parsePath('/'), { defaultSlug: DEFAULT_FESTIVAL_SLUG }),
    `/${DEFAULT_FESTIVAL_SLUG}`,
  );
});

test('canonical paths are left alone', () => {
  const opts = { defaultSlug: DEFAULT_FESTIVAL_SLUG };
  assert.equal(canonicalRedirect(parsePath(`/${SLUG}`), opts), null);
  assert.equal(canonicalRedirect(parsePath(`/${SLUG}/${CODE}`), opts), null);
  assert.equal(canonicalRedirect(parsePath('/nope'), opts), null);
});

test('an alias redirects to the canonical slug, keeping the code', () => {
  assert.equal(canonicalRedirect(parsePath('/outside-lands')), `/${SLUG}`);
  assert.equal(
    canonicalRedirect(parsePath(`/outside-lands/${CODE}`)),
    `/${SLUG}/${CODE}`,
  );
});

test('a legacy link redirects once its festival is known', () => {
  // This is what keeps links already shared with people working.
  assert.equal(
    canonicalRedirect(parsePath(`/${CODE}`), { lookupFestival: () => SLUG }),
    `/${SLUG}/${CODE}`,
  );
});

test('a legacy link for a group that no longer exists is not redirected', () => {
  // Better to fall through to the app's own "expired link" handling than to
  // bounce someone to a festival page that will not have their group.
  assert.equal(
    canonicalRedirect(parsePath(`/${CODE}`), { lookupFestival: () => null }),
    null,
  );
  assert.equal(canonicalRedirect(parsePath(`/${CODE}`), {}), null);
});

test('group paths are the ones marked noindex', () => {
  assert.equal(isGroupPath(`/${SLUG}/${CODE}`), true);
  assert.equal(isGroupPath(`/${CODE}`), true);
  assert.equal(isGroupPath(`/${SLUG}`), false);
  assert.equal(isGroupPath('/'), false);
  assert.equal(isGroupPath('/nope'), false);
});

test('builders and parser agree', () => {
  assert.equal(festivalPath(SLUG), `/${SLUG}`);
  assert.equal(groupPath(SLUG, CODE), `/${SLUG}/${CODE}`);
  assert.equal(parsePath(festivalPath(SLUG)).kind, 'festival');
  const r = parsePath(groupPath(SLUG, CODE));
  assert.equal(r.kind, 'group');
  assert.equal(r.code, CODE);
});
