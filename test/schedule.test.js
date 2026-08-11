import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { listFestivals, getFestival } from '../shared/festivals/index.js';

/*
 * Structural invariants, checked against every registered festival rather than
 * one hardcoded lineup — so a festival added later is held to the same rules.
 */
for (const f of listFestivals()) {
  const label = f.slug;

  test(`${label}: every set sits inside the derived grid bounds`, () => {
    for (const s of f.SCHEDULE) {
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

  test(`${label}: sets never overlap within a lane`, () => {
    for (const day of f.DAYS) {
      for (const stage of f.STAGES) {
        const list = f.SCHEDULE.filter(
          (s) => s.dayId === day.id && s.stageId === stage.id,
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
          (x) => x.dayId === day.id && x.stageId === stage.id,
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
    for (const s of f.SCHEDULE) {
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

  test(`${label}: every stage colour is a CSS custom property`, () => {
    for (const stage of f.STAGES) {
      assert.match(stage.color, /^--[a-z-]+$/, `stage '${stage.id}' colour`);
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
