/*
 * Keeps client/src/styles.css on its own design tokens.
 *
 * The :root block at the top of the stylesheet is the design system: every
 * colour is defined there once and referenced by name everywhere else. These
 * tests fail when a rule below it writes a colour literal instead, or names a
 * token that doesn't exist — the latter renders as nothing at all, which is
 * easy to miss by eye.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseRootTokens } from '../shared/theme.js';

const CSS = readFileSync(new URL('../client/src/styles.css', import.meta.url), 'utf8');
const BASE = parseRootTokens(CSS);

// Everything after the first :root block, comments stripped and the Google
// Fonts @import (a URL, not a colour) dropped.
const uncommented = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
const rootStart = uncommented.indexOf(':root {');
const RULES = uncommented.slice(uncommented.indexOf('}', rootStart) + 1);

function lineOf(fragment) {
  return CSS.split('\n').findIndex((l) => l.includes(fragment)) + 1;
}

test('no colour literals outside the :root token block', () => {
  const literals = RULES.match(/#[0-9a-f]{3,8}\b|\brgba?\([^)]*\)|\bhsla?\([^)]*\)/gi) ?? [];
  assert.deepEqual(
    literals.map((l) => `${l} (styles.css:${lineOf(l)})`),
    [],
    'add a token to :root in styles.css and reference it instead',
  );
});

// Custom properties set per element rather than in :root — grid geometry
// written inline by ScheduleGrid.jsx, the mobile column floor, and a block's
// text colour written inline by ShowBlock/LineupBlock.
const LOCAL_PROPS = new Set([
  '--stage-count', '--flow-count', '--total-slots', '--col-gap', '--stage-col-min',
  '--block-fg',
]);

test('every var() in styles.css names a defined token', () => {
  const used = new Set([...uncommented.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]));
  const missing = [...used].filter((name) => !BASE.has(name) && !LOCAL_PROPS.has(name));
  assert.deepEqual(missing, [], 'referenced but never defined in :root');
});

test('the scales are all defined', () => {
  for (const prefix of ['--text-', '--space-', '--radius-', '--shadow-', '--z-']) {
    assert.ok([...BASE.keys()].some((k) => k.startsWith(prefix)), `no ${prefix}* tokens in :root`);
  }
});
