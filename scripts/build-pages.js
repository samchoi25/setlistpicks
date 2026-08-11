/*
 * Post-build: turn the one template Vite produced into a page per festival.
 *
 * Vite emits dist/index.html with the {{TOKENS}} still in place (the prerender
 * plugin only fills them while serving). This reads that file as a template and
 * writes:
 *
 *   dist/index.html            the default festival, a fallback — `/` redirects
 *                              to its slug, so this is only hit for unknown paths
 *   dist/<slug>/index.html     one indexable page per festival
 *   dist/sitemap.xml           generated from the registry
 *
 * Static pages rather than templating per request: the content only changes
 * when the lineup does, so there is no reason to rebuild it on every hit.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listFestivals, getFestival, DEFAULT_FESTIVAL_SLUG } from '../shared/festivals/index.js';
import { renderPage, renderSitemap, PAGE_TOKENS } from './seo-prerender.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

export function buildPages({ dist = DIST, log = console.log } = {}) {
  const templatePath = path.join(dist, 'index.html');
  const template = readFileSync(templatePath, 'utf8');

  const missing = PAGE_TOKENS.filter((t) => !template.includes(t));
  if (missing.length) {
    throw new Error(
      `dist/index.html is missing ${missing.join(', ')} — the template was `
      + 'already filled in, so per-festival pages would all be identical.',
    );
  }

  const written = [];
  for (const festival of listFestivals()) {
    const dir = path.join(dist, festival.slug);
    mkdirSync(dir, { recursive: true });
    const html = renderPage(template, festival);
    assertResolved(html, `${festival.slug}/index.html`);
    writeFileSync(path.join(dir, 'index.html'), html);
    written.push(`${festival.slug}/index.html`);
  }

  // Fallback copy at the root for any path that is not a known festival.
  const fallback = renderPage(template, getFestival(DEFAULT_FESTIVAL_SLUG));
  assertResolved(fallback, 'index.html');
  writeFileSync(templatePath, fallback);
  written.push('index.html');

  writeFileSync(path.join(dist, 'sitemap.xml'), renderSitemap(listFestivals()));
  written.push('sitemap.xml');

  log(`[build-pages] ${written.join(', ')}`);
  return written;
}

function assertResolved(html, label) {
  const left = PAGE_TOKENS.filter((t) => html.includes(t));
  if (left.length) throw new Error(`${label} still contains ${left.join(', ')}`);
}

// Only run when invoked directly, so tests can import buildPages().
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildPages();
}
