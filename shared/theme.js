/*
 * Per-festival theming — which design tokens a festival may override, and how
 * that override reaches the page.
 *
 * client/src/styles.css stays authoritative for the *values*; this module holds
 * only names. test/theme.test.js parses the stylesheet's :root block and checks
 * every name below resolves there, so the two cannot drift apart. Keeping the
 * palette out of JS is deliberate: duplicating it here would mean two places to
 * change a colour and no way to tell which one was right.
 *
 * Deliberately free of `node:` imports — this is in the browser bundle via
 * festival-context.jsx. parseRootTokens() takes CSS text rather than a path so
 * the caller owns the filesystem.
 *
 * Three constraints bound a festival's palette. The first two are checked by
 * tests; the third is not checkable and is the one that surprises people:
 *
 *   1. A stage's header colour must reach 4.5:1 on that theme's --bg.
 *      .stage-header is 0.65rem/800 — small text, so 4.5 and not 3.
 *   2. --block-ink must reach 4.5:1 on every stage colour.
 *   3. Stage colours must stay mid-range, roughly L* 30-55. The vote
 *      affordance is a `mix-blend-mode: multiply` highlighter wash, and
 *      multiply onto near-black is near-black: a literal "metal festival =
 *      black stages" palette would render WANT and MUST-SEE identical.
 *
 * 1 and 2 pull in opposite directions for pale poster colours, which is why a
 * stage can carry a separate `headerColor` — the block keeps the poster's
 * actual colour, the header gets a darkened sibling of it.
 */

/*
 * What a festival may override. Names only — the values live in styles.css.
 *
 * --ink-soft, --ink-dim and --rule are absent on purpose: they derive from
 * --ink via color-mix, so overriding --ink already carries them.
 *
 * The layout tokens (--slot-h, --rule-h, --day-heading-h) are absent for a
 * sharper reason than tidiness. themeCss() emits `:root:root`, which outranks
 * the `@media (max-width: 640px)` block that redefines --day-heading-h for
 * mobile — so theming it would silently break the sticky stage-header offset
 * on phones, and only on phones.
 */
export const THEMEABLE_TOKENS = Object.freeze(new Set([
  '--bg', '--paper', '--ink', '--btn-primary', '--btn-secondary', '--block-ink',
  '--ocean-deep', '--pink-carnation', '--muted-olive', '--jungle-green',
  '--dusk-purple', '--sunset-coral', '--brick-clay', '--deep-teal', '--marigold-gold',
  '--font-display', '--font-body',
]));

/*
 * The nine stage colours, in the order styles.css defines them. A stage's
 * `color`/`headerColor` must name one of these (or a token the festival's own
 * theme block defines), which is what makes a typo fail at import rather than
 * rendering an unstyled block.
 */
export const STAGE_TOKENS = Object.freeze(new Set([
  '--ocean-deep', '--pink-carnation', '--muted-olive', '--jungle-green',
  '--dusk-purple', '--sunset-coral', '--brick-clay', '--deep-teal', '--marigold-gold',
]));

/*
 * Fonts a theme may choose, by key. A definition names the key ('anton'), not
 * the stack — that is what makes the allowlist enforceable, and it keeps the
 * definitions readable.
 *
 * Every entry carries a real local fallback. The service worker bails on
 * cross-origin requests, so Google Fonts is not precached and never has been:
 * offline, each of these degrades to the fallback exactly as Montserrat does
 * today. Any family added here must also be added to the @import at the top of
 * styles.css — test/theme.test.js checks that, because a font that is
 * allowlisted, validated and applied but never downloaded fails silently.
 */
export const FONT_STACKS = Object.freeze({
  georgia: "Georgia, 'Times New Roman', serif",
  montserrat: "'Montserrat', system-ui, sans-serif",
  anton: "'Anton', Impact, 'Arial Narrow Bold', sans-serif",
  'archivo-black': "'Archivo Black', Impact, sans-serif",
  oswald: "'Oswald', 'Arial Narrow', sans-serif",
  'playfair-display': "'Playfair Display', Georgia, serif",
  rye: "'Rye', Georgia, serif",
  'space-grotesk': "'Space Grotesk', system-ui, sans-serif",
});

// Families that come from Google Fonts and so must appear in the @import.
// 'georgia' and 'montserrat' are excluded: Georgia is a system face, and
// Montserrat is already in the request that every other family joins.
export const WEB_FONT_FAMILIES = Object.freeze({
  anton: 'Anton',
  'archivo-black': 'Archivo Black',
  oswald: 'Oswald',
  'playfair-display': 'Playfair Display',
  rye: 'Rye',
  'space-grotesk': 'Space Grotesk',
});

// A festival may invent tokens of its own, namespaced by slug, for colours the
// base palette has no name for. `--daisy-chain-fields-2026-poster-yellow`.
function namespacedRe(slug) {
  return new RegExp(`^--${slug}-[a-z0-9-]+$`);
}

export function isThemeableToken(slug, name) {
  return THEMEABLE_TOKENS.has(name) || namespacedRe(slug).test(name);
}

// Token names a stage's colour may legitimately point at.
export function knownStageTokens(def) {
  const own = Object.keys(def.theme?.tokens ?? {});
  return new Set([...STAGE_TOKENS, ...own]);
}

/* ─── Colour maths (WCAG 2.x) ──────────────────────────────────────────── */

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const FN_RE = /^rgba?\(([^)]*)\)$/i;

/*
 * Returns [r, g, b] in 0-255, or null if the value is not a colour this
 * understands. Alpha parses but is discarded: everything here composites onto
 * an opaque surface, and a contrast ratio against a translucent colour would be
 * a number with no meaning.
 */
export function parseColor(value) {
  if (typeof value !== 'string') return null;
  const v = value.trim();

  const hex = v.match(HEX_RE);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  const fn = v.match(FN_RE);
  if (fn) {
    // Both the legacy comma form and the modern space form, which may carry
    // `/ alpha`. Split on the slash first so the alpha never lands in a slot.
    const parts = fn[1].split('/')[0].trim().split(/[\s,]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const chan = parts.slice(0, 3).map((p) => {
      if (p.endsWith('%')) return Math.round((parseFloat(p) / 100) * 255);
      return Math.round(parseFloat(p));
    });
    if (chan.some((c) => !Number.isFinite(c) || c < 0 || c > 255)) return null;
    return chan;
  }

  return null;
}

export function relativeLuminance([r, g, b]) {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

// Takes either colour strings or [r,g,b] triples. Throws on an unparseable
// string rather than returning a plausible-looking number.
export function contrastRatio(a, b) {
  const rgb = (x) => {
    if (Array.isArray(x)) return x;
    const parsed = parseColor(x);
    if (!parsed) throw new Error(`contrastRatio: cannot parse colour '${x}'`);
    return parsed;
  };
  const la = relativeLuminance(rgb(a));
  const lb = relativeLuminance(rgb(b));
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/* ─── Reading the base palette out of styles.css ───────────────────────── */

/*
 * Pure string -> Map, so this module stays free of node:fs and safe in the
 * browser bundle; the caller reads the file.
 *
 * Matches only the FIRST :root block. styles.css has a second one inside
 * `@media (max-width: 640px)` that overrides --day-heading-h for mobile, and
 * merging the two would produce a palette that exists at no viewport width.
 * Comments are stripped first — the :root block is heavily commented, and a
 * `--foo: bar` inside a comment would otherwise parse as a declaration.
 */
export function parseRootTokens(cssText) {
  const stripped = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
  const block = stripped.match(/:root\s*\{([^}]*)\}/);
  if (!block) throw new Error('parseRootTokens: no :root block found');
  const out = new Map();
  for (const decl of block[1].split(';')) {
    const m = decl.match(/^\s*(--[\w-]+)\s*:\s*(.+?)\s*$/);
    if (m) out.set(m[1], m[2]);
  }
  return out;
}

/* ─── Resolving and emitting a theme ───────────────────────────────────── */

/*
 * All three of the functions below are TOTAL: they must not throw for any
 * festival object, valid or not. test/seo.test.js builds a fixture with
 * buildFestival() directly, bypassing the registry's validate(), and renderPage
 * runs on it. Validation belongs in shared/festivals/index.js; rendering just
 * renders whatever it is handed.
 */

// A festival's theme as a flat {token: value} map. Font keys resolve to their
// stack here; an unknown key is dropped rather than emitted as a bare word that
// would read as a font family name.
export function resolveTheme(festival) {
  const tokens = festival?.theme?.tokens;
  if (!tokens || typeof tokens !== 'object') return {};
  const out = {};
  for (const [name, value] of Object.entries(tokens)) {
    if (name === '--font-display' || name === '--font-body') {
      const stack = FONT_STACKS[value];
      if (stack) out[name] = stack;
    } else if (typeof value === 'string') {
      out[name] = value;
    }
  }
  return out;
}

/*
 * `:root:root`, not `:root`. Vite drops the authored stylesheet link and
 * injects the bundled one as the LAST element of <head> — after every template
 * token — so an equal-specificity rule emitted from the template loses the
 * cascade in production while winning in dev, where the authored link stays
 * put. Doubling the pseudo-class (0,2,0 against 0,1,0) makes placement
 * irrelevant. Do not "simplify" this back to one :root.
 */
export function themeCss(festival) {
  const tokens = resolveTheme(festival);
  const decls = Object.entries(tokens).map(([k, v]) => `${k}:${v}`).join(';');
  // Belt and braces: validate() makes angle brackets impossible, but this also
  // runs on unvalidated test fixtures, and the output goes inside a <style>.
  return decls ? `:root:root{${decls}}`.replace(/[<>]/g, '') : '';
}

// The browser-chrome colour. Matches the themed page background so the two
// don't disagree at the top of the viewport on mobile.
export const DEFAULT_THEME_COLOR = '#f1e9d7';

export function themeColor(festival) {
  const bg = resolveTheme(festival)['--bg'];
  return bg && parseColor(bg) ? bg : DEFAULT_THEME_COLOR;
}
