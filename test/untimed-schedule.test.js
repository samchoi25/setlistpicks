import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFestival } from '../shared/festival.js';

/*
 * Coverage for the untimed lineup path (see dayModeOf()/buildUntimedDay() in
 * shared/festival.js): a festival that has announced a lineup but not its
 * set times yet, with some, all, or none of it assigned to a stage.
 *
 * Fixtures are synthetic, not the real registered festivals — modeled on
 * Daisy Chain Fields' two-stage shape (Dandelion/Marigold) since that's the
 * only multi-stage festival in the repo, but with invented artist names so
 * this can't be mistaken for real lineup or set-time data.
 */

const stages = [
  { id: 'dandelion', name: 'Dandelion Stage', short: 'DAN', color: '--pink-carnation' },
  { id: 'marigold', name: 'Marigold Stage', short: 'MAR', color: '--marigold-gold' },
];
const days = [{ id: 'sat', name: 'Saturday', date: 'Sep 1' }];

const baseDef = {
  slug: 'untimed-test-fixture',
  name: 'Untimed Test Fixture',
  shortName: 'Untimed Test',
  year: 2099,
  venue: 'Test Grounds',
  place: { name: 'Test Grounds', addressLocality: 'Testville', addressRegion: 'CA', addressCountry: 'US' },
  utcOffset: '-07:00',
  dateRange: 'September 1, 2099',
  officialUrl: 'https://example.test',
  headliners: ['Zebra Parade'],
  stages,
  days,
};

test('staged, untimed: acts keep the flyer\'s own order within their stage, not alphabetical', () => {
  const f = buildFestival({
    ...baseDef,
    slug: 'untimed-test-fixture-staged',
    sets: {
      sat: [
        ['dandelion', 'Zebra Parade'],
        ['dandelion', 'Aardvark Sound'],
        ['dandelion', 'Marmoset'],
        ['marigold', 'Wildflower Choir'],
        ['marigold', 'Beetle Kids'],
      ],
    },
  });

  assert.equal(f.dayMode('sat'), 'untimed');

  const dandelion = f.SCHEDULE.filter((s) => s.stageId === 'dandelion');
  assert.deepEqual(dandelion.map((s) => s.artist), ['Zebra Parade', 'Aardvark Sound', 'Marmoset']);
  assert.deepEqual(dandelion.map((s) => s.order), [0, 1, 2]);
  for (const s of dandelion) {
    assert.equal(s.timed, false);
    assert.equal(s.startMin, undefined);
  }

  const marigold = f.SCHEDULE.filter((s) => s.stageId === 'marigold');
  assert.deepEqual(marigold.map((s) => s.artist), ['Wildflower Choir', 'Beetle Kids']);

  // Same column/id invariants a timed festival gets.
  const cols = f.stagesForDay('sat').map((s) => s.col);
  assert.deepEqual(cols, cols.map((_, i) => i + 2));
  const ids = f.SCHEDULE.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.ok(id.startsWith(`${f.slug}:`));

  // No timed sets at all, so the grid has no bounds to derive.
  assert.equal(f.GRID_START_MIN, 0);
  assert.equal(f.GRID_END_MIN, 0);
});

test('a B2B entry becomes one block with both names', () => {
  const f = buildFestival({
    ...baseDef,
    slug: 'untimed-test-fixture-b2b',
    sets: {
      sat: [
        ['dandelion', ['Aardvark Sound', 'Marmoset']],
        ['dandelion', 'Zebra Parade'],
      ],
    },
  });

  const dandelion = f.SCHEDULE.filter((s) => s.stageId === 'dandelion');
  assert.equal(dandelion.length, 2);
  assert.deepEqual(dandelion[0].artists, ['Aardvark Sound', 'Marmoset']);
  assert.equal(dandelion[0].artist, 'Aardvark Sound b2b Marmoset');
  assert.deepEqual(dandelion[1].artists, ['Zebra Parade']);
});

test('unstaged, untimed: whole day flows as one alphabetical list, no stages', () => {
  const f = buildFestival({
    ...baseDef,
    slug: 'untimed-test-fixture-unstaged',
    sets: {
      sat: ['Zebra Parade', 'Aardvark Sound', 'Marmoset', 'Beetle Kids'],
    },
  });

  assert.equal(f.dayMode('sat'), 'untimed');
  assert.deepEqual(f.stagesForDay('sat'), []);

  assert.deepEqual(
    f.SCHEDULE.map((s) => s.artist),
    ['Aardvark Sound', 'Beetle Kids', 'Marmoset', 'Zebra Parade'],
  );
  assert.deepEqual(f.SCHEDULE.map((s) => s.order), [0, 1, 2, 3]);
  for (const s of f.SCHEDULE) {
    assert.equal(s.stageId, null);
    assert.equal(s.timed, false);
    assert.ok(s.id.startsWith(`${f.slug}:sat-lineup-`));
  }
});

test('a day can mix staged and unstaged entries: unplaced acts stay alphabetical alongside ordered stage columns', () => {
  const f = buildFestival({
    ...baseDef,
    slug: 'untimed-test-fixture-mixed-shapes',
    sets: {
      sat: [
        ['dandelion', 'Zebra Parade'],
        ['dandelion', 'Aardvark Sound'],
        'Marmoset',
        'Beetle Kids',
        ['marigold', 'Wildflower Choir'],
      ],
    },
  });

  assert.equal(f.dayMode('sat'), 'untimed');
  // Only the stage that actually got an entry shows up.
  assert.deepEqual(f.stagesForDay('sat').map((s) => s.id), ['dandelion', 'marigold']);

  const dandelion = f.SCHEDULE.filter((s) => s.stageId === 'dandelion');
  assert.deepEqual(dandelion.map((s) => s.artist), ['Zebra Parade', 'Aardvark Sound']);

  const unstaged = f.SCHEDULE.filter((s) => s.stageId === null);
  assert.deepEqual(unstaged.map((s) => s.artist), ['Beetle Kids', 'Marmoset']);
});

test('a day mixing timed and untimed entry shapes is rejected', () => {
  assert.throws(() => {
    buildFestival({
      ...baseDef,
      slug: 'untimed-test-fixture-mixed-timed',
      sets: {
        sat: [
          ['dandelion', '12:00', '12:30', 'Zebra Parade'],
          ['dandelion', 'Aardvark Sound'],
        ],
      },
    });
  }, /mixed timed and untimed/);
});

test('one timed day and one untimed day coexist: grid bounds come from the timed day only', () => {
  const f = buildFestival({
    ...baseDef,
    slug: 'untimed-test-fixture-mixed-days',
    days: [
      { id: 'fri', name: 'Friday', date: 'Aug 31' },
      { id: 'sat', name: 'Saturday', date: 'Sep 1' },
    ],
    sets: {
      fri: [
        ['dandelion', '12:00', '12:30', 'Zebra Parade'],
        ['marigold', '13:00', '13:45', 'Wildflower Choir'],
      ],
      sat: [
        ['dandelion', 'Aardvark Sound'],
        ['marigold', 'Beetle Kids'],
      ],
    },
  });

  assert.equal(f.dayMode('fri'), 'timed');
  assert.equal(f.dayMode('sat'), 'untimed');
  assert.equal(f.GRID_START_MIN, 12 * 60);
  assert.equal(f.GRID_END_MIN, 14 * 60);

  const friSets = f.SCHEDULE.filter((s) => s.dayId === 'fri');
  assert.ok(friSets.every((s) => s.timed));
  const satSets = f.SCHEDULE.filter((s) => s.dayId === 'sat');
  assert.ok(satSets.every((s) => !s.timed));
});
