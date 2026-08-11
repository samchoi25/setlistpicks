import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { renderLineupHtml, renderJsonLd } from './scripts/seo-prerender.js';
import { getFestival, DEFAULT_FESTIVAL_SLUG } from './shared/festivals/index.js';

// Phase 4 emits one page per festival; for now `/` is the default festival.
function seoPrerender() {
  return {
    name: 'seo-prerender',
    transformIndexHtml(html) {
      const festival = getFestival(DEFAULT_FESTIVAL_SLUG);
      const lineupHtml = renderLineupHtml(festival);
      const jsonLd = renderJsonLd(festival);
      return html
        .replace('<div id="app"></div>', `<div id="app"></div>\n${lineupHtml}`)
        .replace('</head>', `${jsonLd}\n  </head>`);
    },
  };
}

export default defineConfig({
  root: 'client',
  plugins: [react(), seoPrerender()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': 'http://localhost:8080',
      '/ws': { target: 'ws://localhost:8080', ws: true },
    },
  },
});
