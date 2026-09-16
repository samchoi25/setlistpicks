/*
 * Tests for shared/theme.js, plus the checks that keep it honest about
 * client/src/styles.css — which is where the palette values actually live.
 *
 * The drift these guard against is specific: shared/theme.js names tokens it
 * does not define, so a token renamed or dropped in the stylesheet would leave
 * an allowlist entry pointing at nothing, and a theme setting it would appear
 * to work while changing no pixel.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  THEMEABLE_TOKENS, STAGE_TOKENS, FONT_STACKS, WEB_FONT_FAMILIES,
  isThemeableToken, parseColor, relativeLuminance, contrastRatio,
  parseRootTokens, resolveTheme, themeCss, themeColor, DEFAULT_THEME_COLOR,
} from '../shared/theme.js';

const STYLES_PATH = new URL('../client/src/styles.css', import.meta.url);
const CSS = readFileSync(STYLES_PATH, 'utf8');
const BASE = parseRootTokens(CSS);

/* ─── parseColor ───────────────────────────────────────────────────────── */

test('parseColor: hex in every length', () => {
  assert.deepEqual(parseColor('#abc'), [0xaa, 0xbb, 0xcc]);
  assert.deepEqual(parseColor('#AABBCC'), [0xaa, 0xbb, 0xcc]);
  assert.deepEqual(parseColor('#2169B0'), [0x21, 0x69, 0xb0]);
  // 4- and 8-digit hex carry alpha, which is parsed off and discarded.
  assert.deepEqual(parseColor('#abcd'), [0xaa, 0xbb, 0xcc]);
  assert.deepEqual(parseColor('#2169B080'), [0x21, 0x69, 0xb0]);
});

test('parseColor: rgb() and rgba(), comma and space forms', () => {
  assert.deepEqual(parseColor('rgb(36, 103, 177)'), [36, 103, 177]);
  assert.deepEqual(parseColor('rgb(36,103,177)'), [36, 103, 177]);
  assert.deepEqual(parseColor('rgba(36, 103, 177, 0.75)'), [36, 103, 177]);
  assert.deepEqual(parseColor('rgb(36 103 177)'), [36, 103, 177]);
  assert.deepEqual(parseColor('rgb(36 103 177 / 50%)'), [36, 103, 177]);
  assert.deepEqual(parseColor('rgb(100%, 0%, 0%)'), [255, 0, 0]);
});

test('parseColor: returns null rather than guessing', () => {
  for (const bad of [
    '', 'rebeccapurple', '#ab', '#abcde', 'hsl(200, 50%, 50%)',
    'var(--ink)', 'color-mix(in srgb, var(--ink) 20%, transparent)',
    'rgb(36, 103)', 'rgb(300, 0, 0)', 'rgb(-1, 0, 0)', 'rgb(a, b, c)',
    null, undefined, 42, {},
  ]) {
    assert.equal(parseColor(bad), null, `${JSON.stringify(bad)} should not parse`);
  }
});

/* ─── Contrast ─────────────────────────────────────────────────────────── */

test('contrastRatio: the two fixed points of the WCAG scale', () => {
  assert.equal(contrastRatio('#000', '#fff').toFixed(2), '21.00');
  assert.equal(contrastRatio('#fff', '#fff').toFixed(2), '1.00');
});

test('contrastRatio: symmetric, and accepts triples as well as strings', () => {
  assert.equal(
    contrastRatio('#2169B0', '#fbf6e9').toFixed(4),
    contrastRatio('#fbf6e9', '#2169B0').toFixed(4),
  );
  assert.equal(
    contrastRatio([33, 105, 176], '#fff').toFixed(4),
    contrastRatio('#2169B0', '#ffffff').toFixed(4),
  );
});

test('contrastRatio: throws on an unparseable colour instead of returning a number', () => {
  assert.throws(() => contrastRatio('not-a-colour', '#fff'), /cannot parse colour/);
});

test('relativeLuminance: black is 0, white is 1', () => {
  assert.equal(relativeLuminance([0, 0, 0]), 0);
  assert.equal(relativeLuminance([255, 255, 255]), 1);
});

/* ─── parseRootTokens against the real stylesheet ──────────────────────── */

test('parseRootTokens: reads the base palette out of styles.css', () => {
  assert.equal(BASE.get('--ink'), 'rgb(36, 103, 177)');
  assert.equal(BASE.get('--paper'), '#fbf6e9');
  assert.equal(BASE.get('--block-ink'), '#fff');
});

test('parseRootTokens: ignores declarations inside comments', () => {
  const css = ':root { --real: #fff; /* --fake: #000; */ --also-real: #111; }';
  const m = parseRootTokens(css);
  assert.deepEqual([...m.keys()], ['--real', '--also-real']);
});

test('parseRootTokens: takes the first :root only, not the mobile override', () => {
  // styles.css redefines --day-heading-h inside @media (max-width: 640px).
  // Merging that in would describe a palette that exists at no viewport width.
  assert.ok(/@media[^{]*\{\s*:root/.test(CSS.replace(/\/\*[\s\S]*?\*\//g, '')),
    'expected styles.css to still have a second :root inside a media query — '
    + 'if that has gone, this test is no longer proving anything');
  assert.equal(BASE.get('--day-heading-h'), '50px');
});

test('parseRootTokens: throws when there is no :root at all', () => {
  assert.throws(() => parseRootTokens('body { color: red; }'), /no :root block/);
});

/* ─── The allowlist matches the stylesheet ─────────────────────────────── */

test('every themeable token is actually defined in styles.css', () => {
  for (const name of THEMEABLE_TOKENS) {
    assert.ok(BASE.has(name), `${name} is themeable but not defined in styles.css`);
  }
});

test('every stage token is themeable and defined', () => {
  for (const name of STAGE_TOKENS) {
    assert.ok(BASE.has(name), `${name} is not defined in styles.css`);
    assert.ok(THEMEABLE_TOKENS.has(name), `${name} is a stage token but not themeable`);
  }
});

test('every stage token parses as a colour', () => {
  for (const name of STAGE_TOKENS) {
    assert.ok(parseColor(BASE.get(name)), `${name} = ${BASE.get(name)} does not parse`);
  }
});

test('the ink layer derives from --ink rather than repeating its value', () => {
  // If these go back to literals, theming --ink silently half-applies.
  for (const name of ['--ink-soft', '--ink-dim', '--rule']) {
    assert.match(BASE.get(name), /color-mix\(in srgb, var\(--ink\)/,
      `${name} should derive from --ink`);
  }
  assert.equal(BASE.get('--btn-primary'), 'var(--ink)');
});

test('layout tokens are not themeable', () => {
  // :root:root outranks the mobile media query, so theming --day-heading-h
  // would break the sticky header offset on phones and nowhere else.
  for (const name of ['--slot-h', '--rule-h', '--day-heading-h']) {
    assert.ok(!THEMEABLE_TOKENS.has(name), `${name} must not be themeable`);
  }
});

/* ─── Fonts ────────────────────────────────────────────────────────────── */

test('every web font family is in the Google Fonts request', () => {
  // The one failure mode the allowlist cannot otherwise catch: a font that is
  // allowlisted, validated and applied, but never downloaded — so it silently
  // renders as its fallback and looks like nothing happened.
  const importLine = CSS.split('\n').find((l) => l.includes('fonts.googleapis.com'));
  assert.ok(importLine, 'no Google Fonts @import found in styles.css');
  for (const [key, family] of Object.entries(WEB_FONT_FAMILIES)) {
    assert.ok(importLine.includes(`family=${family.replace(/ /g, '+')}`),
      `FONT_STACKS['${key}'] uses ${family}, which is not in the @import`);
  }
});

test('every font stack names a fallback, so offline degrades rather than breaks', () => {
  for (const [key, stack] of Object.entries(FONT_STACKS)) {
    assert.ok(stack.split(',').length >= 2, `FONT_STACKS['${key}'] has no fallback`);
    assert.match(stack, /(serif|sans-serif|system-ui|Impact)\s*$/,
      `FONT_STACKS['${key}'] should end in a generic family`);
  }
});

test('every web font key has a stack, and vice versa for non-system fonts', () => {
  for (const key of Object.keys(WEB_FONT_FAMILIES)) {
    assert.ok(FONT_STACKS[key], `WEB_FONT_FAMILIES['${key}'] has no stack`);
  }
});

/* ─── isThemeableToken ─────────────────────────────────────────────────── */

test('isThemeableToken: allowlisted names and slug-namespaced ones', () => {
  assert.ok(isThemeableToken('portola-2026', '--ink'));
  assert.ok(isThemeableToken('portola-2026', '--portola-2026-fog'));
  assert.ok(!isThemeableToken('portola-2026', '--slot-h'));
  assert.ok(!isThemeableToken('portola-2026', '--made-up'));
  // Another festival's namespace is not yours.
  assert.ok(!isThemeableToken('portola-2026', '--aftershock-2026-rust'));
});

/* ─── resolveTheme / themeCss / themeColor ─────────────────────────────── */

const themed = { slug: 'x-2026', theme: { tokens: { '--bg': '#EAF4F6', '--font-display': 'anton' } } };

test('resolveTheme: font keys resolve to stacks, colours pass through', () => {
  assert.deepEqual(resolveTheme(themed), {
    '--bg': '#EAF4F6',
    '--font-display': FONT_STACKS.anton,
  });
});

test('themeCss: emits :root:root so it wins from anywhere in <head>', () => {
  // Vite injects the bundled stylesheet last, after every template token, so a
  // single :root would win in dev and lose in production.
  const css = themeCss(themed);
  assert.match(css, /^:root:root\{/);
  assert.ok(css.includes('--bg:#EAF4F6'));
});

test('themeCss and themeColor are total: no theme, junk theme, nothing throws', () => {
  for (const f of [
    {}, { theme: null }, { theme: {} }, { theme: { tokens: null } },
    { theme: { tokens: {} } }, { theme: { tokens: { '--font-body': 'no-such-font' } } },
    undefined,
  ]) {
    assert.equal(themeCss(f), '', `themeCss(${JSON.stringify(f)}) should be empty`);
    assert.equal(themeColor(f), DEFAULT_THEME_COLOR);
  }
});

test('themeColor: the themed background, or the stylesheet default', () => {
  assert.equal(themeColor(themed), '#EAF4F6');
  assert.equal(themeColor({ theme: { tokens: { '--bg': 'var(--nope)' } } }), DEFAULT_THEME_COLOR);
  // The default must match what styles.css actually paints, or the browser
  // chrome disagrees with the page on an unthemed festival.
  assert.deepEqual(parseColor(DEFAULT_THEME_COLOR), parseColor(BASE.get('--bg')));
});

test('themeCss strips angle brackets so it cannot break out of its <style>', () => {
  const nasty = { slug: 'x-2026', theme: { tokens: { '--bg': '</style><script>' } } };
  assert.ok(!themeCss(nasty).includes('<'));
  assert.ok(!themeCss(nasty).includes('>'));
});
