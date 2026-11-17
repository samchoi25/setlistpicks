import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { listFestivals, getFestival } from '../shared/festivals/index.js';
import {
  parseRootTokens, contrastRatio, resolveTheme, knownStageTokens, parseColor,
  stageHeaderColor, stageBlockInk,
} from '../shared/theme.js';

const BASE = parseRootTokens(
  readFileSync(new URL('../client/src/styles.css', import.meta.url), 'utf8'),
);

// What a token is worth for a given festival: its own theme first, then the
// base palette. Mirrors what the cascade does — themeCss() emits :root:root,
// which outranks the :root the stylesheet defines. Follows var() references,
// including a fallback when the first name isn't defined anywhere, the way
// stageHeaderColor()/stageBlockInk() rely on.
function tokenValue(festival, name) {
  return resolveValue(festival, `var(${name})`);
}

function resolveValue(festival, value, depth = 0) {
  const m = value?.match(/^var\((--[\w-]+)(?:,\s*(.+))?\)$/);
  if (!m || depth > 8) return value;
  const own = resolveTheme(festival)[m[1]] ?? BASE.get(m[1]);
  return resolveValue(festival, own ?? m[2], depth + 1);
}

// --ink-soft is --ink composited at an alpha onto whatever it sits on.
function inkSoftOn(festival, ground) {
  const alpha = Number(BASE.get('--ink-soft').match(/var\(--ink\) (\d+)%/)[1]) / 100;
  const ink = parseColor(tokenValue(festival, '--ink'));
  const g = parseColor(tokenValue(festival, ground));
  return ink.map((c, i) => Math.round(c * alpha + g[i] * (1 - alpha)));
}

// True when the festival's theme touches either side of a contrast pair. Only
// used to word the failure: every pair must clear AA either way.
function isThemed(festival, ...names) {
  const theme = festival?.theme?.tokens ?? {};
  return names.some((n) => theme[n] !== undefined);
}

// Most of this UI is small text — stage headers are 0.65rem/800, labels
// 0.7rem — so the AA threshold is 4.5 everywhere, not 3.
const AA_SMALL_TEXT = 4.5;

function assertLegible({ what, ratio, themed }) {
  assert.ok(ratio >= AA_SMALL_TEXT,
    `${what}: ${ratio.toFixed(2)}:1 is below ${AA_SMALL_TEXT}:1. Darken the text `
    + (themed ? 'colour in this festival\'s theme.' : 'token in styles.css.'));
}

/*
 * Structural invariants, checked against every registered festival rather than
 * one hardcoded lineup — so a festival added later is held to the same rules.
 */
for (const f of listFestivals()) {
  const label = f.slug;

  // Untimed sets (no set times announced yet — see festival.dayMode()) carry
  // no startMin/endMin/lane data, so every check below that depends on those
  // only applies to the timed ones.
  test(`${label}: every timed set sits inside the derived grid bounds`, () => {
    for (const s of f.SCHEDULE.filter((s) => s.timed)) {
      assert.ok(
        s.startMin >= f.GRID_START_MIN && s.endMin <= f.GRID_END_MIN,
        `${s.artist} (${s.start}-${s.end}) falls outside ${f.GRID_START_MIN}-${f.GRID_END_MIN}`,
      );
      assert.ok(s.endMin > s.startMin, `${s.artist} ends before it starts`);
    }
  });

  test(`${label}: set ids are unique and namespaced by festival`, () => {
    const ids = f.SCHEDULE.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length, 'duplicate set id');
    for (const id of ids) {
      assert.ok(id.startsWith(`${f.slug}:`), `id '${id}' is not namespaced`);
    }
  });

  test(`${label}: timed sets never overlap within a lane`, () => {
    for (const day of f.DAYS) {
      for (const stage of f.STAGES) {
        const list = f.SCHEDULE.filter(
          (s) => s.dayId === day.id && s.stageId === stage.id && s.timed,
        );
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const a = list[i];
            const b = list[j];
            const overlaps = a.startMin < b.endMin && b.startMin < a.endMin;
            if (overlaps) {
              assert.notEqual(
                a.lane,
                b.lane,
                `${day.id}/${stage.id}: ${a.artist} and ${b.artist} overlap in lane ${a.lane}`,
              );
            }
          }
          assert.ok(
            list[i].lane < list[i].laneCount,
            `lane ${list[i].lane} >= laneCount ${list[i].laneCount}`,
          );
        }
      }
    }
  });

  test(`${label}: acts sharing an exact slot are merged into one block`, () => {
    for (const day of f.DAYS) {
      for (const stage of f.STAGES) {
        const seen = new Set();
        for (const s of f.SCHEDULE.filter(
          (x) => x.dayId === day.id && x.stageId === stage.id && x.timed,
        )) {
          const key = `${s.startMin}-${s.endMin}`;
          assert.ok(
            !seen.has(key),
            `${day.id}/${stage.id}: two blocks share ${s.start}-${s.end}; they should be one`,
          );
          seen.add(key);
        }
      }
    }
  });

  // Regression guard: a timed B2B tuple (['Erika', 'SF Cowboy']) was once
  // wrapped an extra level (`artists: [['Erika', 'SF Cowboy']]`) instead of
  // flattened, because mergeSimultaneous's first-of-a-slot branch wrapped
  // whatever `artist` already was, array or not. Every ShowBlock/LineupBlock
  // consumer calls .split()/.join() on each entry expecting a plain string.
  test(`${label}: every set's artists are flat strings, never nested arrays`, () => {
    for (const s of f.SCHEDULE) {
      for (const name of s.artists) {
        assert.equal(typeof name, 'string', `${s.id}: artists ${JSON.stringify(s.artists)}`);
      }
    }
  });

  test(`${label}: per-day stage columns are contiguous from 2`, () => {
    for (const day of f.DAYS) {
      const cols = f.stagesForDay(day.id).map((s) => s.col);
      assert.deepEqual(cols, cols.map((_, i) => i + 2), `${day.id} columns`);
    }
  });

  test(`${label}: stagesForDay returns a stable identity`, () => {
    // ScheduleGrid compares stage objects by reference; a fresh array each call
    // would defeat ShowBlock's memo and re-render the whole grid.
    for (const day of f.DAYS) {
      assert.equal(f.stagesForDay(day.id), f.stagesForDay(day.id));
    }
  });

  test(`${label}: followsPrevious marks exactly the back-to-back sets`, () => {
    for (const s of f.SCHEDULE.filter((s) => s.timed)) {
      const hasPredecessor = f.SCHEDULE.some(
        (p) =>
          p.dayId === s.dayId &&
          p.stageId === s.stageId &&
          p.lane === s.lane &&
          p.endMin === s.startMin,
      );
      assert.equal(
        s.followsPrevious,
        hasPredecessor,
        `${s.dayId}/${s.stageId} ${s.artist}: followsPrevious should be ${hasPredecessor}`,
      );
    }
  });

  /*
   * Colours. The old version of this only matched /^--[a-z-]+$/, which checks
   * the shape of the name and nothing else — so '--ocean-dep' passed and
   * rendered an unstyled block. These resolve the name against the palette the
   * page will actually have.
   */
  test(`${label}: every stage colour resolves to a real token`, () => {
    const known = knownStageTokens(f);
    for (const stage of f.STAGES) {
      for (const field of ['color', 'headerColor']) {
        const name = stage[field];
        if (name === undefined) continue;
        assert.ok(known.has(name),
          `stage '${stage.id}' ${field} '${name}' is not defined by styles.css `
          + `or by ${label}'s own theme block`);
      }
    }
  });

  test(`${label}: stage colours stay legible`, () => {
    const bg = tokenValue(f, '--bg');
    for (const stage of f.STAGES) {
      // The stage header is text on --bg (.day-header-bar paints it).
      assertLegible({
        what: `${label}: stage '${stage.id}' header`,
        ratio: contrastRatio(resolveValue(f, stageHeaderColor(stage)), bg),
        themed: isThemed(f, stage.headerColor ?? stage.color, '--bg'),
      });
      // And the block text is drawn on the block's own fill.
      assertLegible({
        what: `${label}: stage '${stage.id}' block text`,
        ratio: contrastRatio(resolveValue(f, stageBlockInk(stage)), tokenValue(f, stage.color)),
        themed: isThemed(f, stage.color, '--block-ink'),
      });
    }
  });

  test(`${label}: text colours stay legible`, () => {
    const pairs = [
      ['--ink', '--bg'], ['--ink', '--paper'],
      ['--on-color', '--btn-primary'], ['--on-btn-secondary', '--btn-secondary'],
    ];
    for (const [fg, ground] of pairs) {
      assertLegible({
        what: `${label}: ${fg} on ${ground}`,
        ratio: contrastRatio(tokenValue(f, fg), tokenValue(f, ground)),
        themed: isThemed(f, fg, ground),
      });
    }
    for (const ground of ['--bg', '--paper']) {
      assertLegible({
        what: `${label}: --ink-soft on ${ground}`,
        ratio: contrastRatio(inkSoftOn(f, ground), tokenValue(f, ground)),
        themed: isThemed(f, '--ink', ground),
      });
    }
  });

}

/*
 * Golden snapshot. Generated from the data after it was verified line by line
 * against sfoutsidelands.com on 2026-08-04 — so this pins the schedule against
 * accidental drift during refactors. It is NOT independent verification of the
 * lineup: if the festival republishes different times, update the fixture
 * deliberately after re-checking the source.
 */
test('outside-lands-2026: matches the verified golden snapshot', () => {
  const f = getFestival('outside-lands-2026');
  const golden = JSON.parse(
    readFileSync(new URL('./fixtures/outside-lands-2026.golden.json', import.meta.url)),
  );
  const actual = f.SCHEDULE.map((s) => [
    s.dayId, s.stageId, s.start, s.end, s.artists.join(' + '),
  ]);
  assert.equal(actual.length, golden.length, 'block count changed');
  assert.deepEqual(actual, golden);
});

/*
 * Regression guards for a real bug: the July port carried four stale Friday
 * evening times, two of them headliners, corrected in 1790020 against the
 * official schedule. Spelled out so a bad merge can't quietly reintroduce them.
 */
test('outside-lands-2026: corrected Friday set times', () => {
  const f = getFestival('outside-lands-2026');
  const find = (name) =>
    f.SCHEDULE.find((s) => s.dayId === 'fri' && s.artist === name);

  for (const [name, start, end] of [
    ['GloRilla', '17:15', '18:00'],
    ['Labrinth', '18:30', '19:40'],
    ['Charli xcx', '20:40', '22:00'],
    ['GRIZTRONICS', '20:25', '21:55'],
  ]) {
    const s = find(name);
    assert.ok(s, `${name} missing from Friday`);
    assert.equal(`${s.start}-${s.end}`, `${start}-${end}`, name);
  }
});

test('outside-lands-2026: co-billed Dolores slot is a single two-act block', () => {
  const f = getFestival('outside-lands-2026');
  const merged = f.SCHEDULE.filter((s) => s.artists.length > 1);
  assert.equal(merged.length, 1, 'expected exactly one merged block');
  assert.deepEqual(merged[0].artists, [
    'PRINCESS DJ Set: DJ Ion The Prize',
    'OASIS DJ Set: DJ Ion The Prize',
  ]);
  assert.equal(merged[0].start, '16:45');
  assert.equal(merged[0].end, '17:45');
});

test('gridPerDay trims each day to its own sets; other festivals share one range', () => {
  const be = getFestival('big-ears-2027');
  const thu = be.gridBoundsForDay('thu');
  const sat = be.gridBoundsForDay('sat');
  assert.equal(thu.startMin, 18 * 60, 'Thursday opens at 6 PM, its first set');
  assert.equal(sat.startMin, 10 * 60, 'Saturday opens at 10 AM for the raga day');
  for (const day of be.DAYS) {
    const b = be.gridBoundsForDay(day.id);
    assert.equal(b.totalSlots, (b.endMin - b.startMin) / be.SLOT_MINS);
    for (const s of be.SCHEDULE.filter((x) => x.dayId === day.id)) {
      assert.ok(s.startMin >= b.startMin && s.endMin <= b.endMin, `${s.artist} outside ${day.id}'s range`);
    }
  }
  const osl = getFestival('outside-lands-2026');
  for (const day of osl.DAYS) {
    assert.deepEqual(
      { ...osl.gridBoundsForDay(day.id) },
      { startMin: osl.GRID_START_MIN, endMin: osl.GRID_END_MIN, totalSlots: osl.TOTAL_SLOTS },
    );
  }
});
