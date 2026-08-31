import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildSw } from '../scripts/build-sw.js';

function stagedDist(assetNames) {
  const dir = mkdtempSync(path.join(tmpdir(), 'setlistpicks-dist-sw-'));
  const assetsDir = path.join(dir, 'assets');
  mkdirSync(assetsDir, { recursive: true });
  for (const name of assetNames) writeFileSync(path.join(assetsDir, name), '');
  return dir;
}

test('buildSw writes dist/sw.js precaching the shell and every asset', () => {
  const dist = stagedDist(['index-abc123.js', 'index-def456.css']);
  const { version, precacheUrls } = buildSw({ dist, log: () => {} });

  assert.ok(version);
  assert.deepEqual(
    precacheUrls.sort(),
    ['/', '/assets/index-abc123.js', '/assets/index-def456.css'].sort(),
  );

  const source = readFileSync(path.join(dist, 'sw.js'), 'utf8');
  assert.ok(source.includes(`app-shell-${version}`));
  assert.ok(source.includes('/assets/index-abc123.js'));
});

test('the version changes when the asset list changes, not otherwise', () => {
  const distA = stagedDist(['index-abc123.js']);
  const distB = stagedDist(['index-abc123.js']);
  const distC = stagedDist(['index-xyz999.js']);

  const a = buildSw({ dist: distA, log: () => {} });
  const b = buildSw({ dist: distB, log: () => {} });
  const c = buildSw({ dist: distC, log: () => {} });

  assert.equal(a.version, b.version, 'identical asset lists should hash the same');
  assert.notEqual(a.version, c.version, 'a different asset list must invalidate old caches');
});

test('generated sw.js is syntactically valid and never touches /api/', () => {
  const dist = stagedDist(['index-abc123.js']);
  buildSw({ dist, log: () => {} });
  const source = readFileSync(path.join(dist, 'sw.js'), 'utf8');

  assert.doesNotThrow(() => new vm.Script(source));
  assert.ok(source.includes("startsWith('/api/')"));
  // The activate handler must only ever sweep its own app-shell-* caches —
  // sweeping anything else would delete offline-cache.js's data cache.
  assert.ok(source.includes("k.startsWith('app-shell-')"));
});
