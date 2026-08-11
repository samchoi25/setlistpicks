import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { renderPage } from './scripts/seo-prerender.js';
import { getFestival, DEFAULT_FESTIVAL_SLUG } from './shared/festivals/index.js';

/*
 * Dev only. The build deliberately leaves the template's placeholders in
 * place so scripts/build-pages.js can fill them once per festival; filling
 * them here too would bake one festival into every page.
 */
function seoPrerender() {
  return {
    name: 'seo-prerender',
    apply: 'serve',
    transformIndexHtml(html) {
      return renderPage(html, getFestival(DEFAULT_FESTIVAL_SLUG));
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
