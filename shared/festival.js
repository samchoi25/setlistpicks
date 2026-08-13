/*
 * Turns a festival definition (shared/festivals/*.js) into everything the grid
 * and the SEO pass need: placed blocks, lane assignments, per-day stage lists
 * and grid bounds.
 *
 * This used to be top-level code in shared/schedule.js, which meant exactly one
 * festival could exist per build. It is now a function of its input, so any
 * number of festivals can be loaded side by side.
 *
 * buildFestival is memoised by slug: the result is treated as immutable and is
 * compared by identity in React, so it must be the same object every call.
 */

// 'HH:MM' → minutes since midnight.
const toMin = (s) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};

// Every published set time in the current lineups lands on a 5-minute boundary,
// so a 5-minute slot places all of them exactly. A coarser 15-minute slot
// rounded 124 of Outside Lands' 157 sets — up to 10 minutes each — which both
// misplaced blocks and shrank short sets below the height their name needs.
export const SLOT_MINS = 5;
export const SLOTS_PER_HOUR = 60 / SLOT_MINS;

// Display name for a stage on a given day.
export function stageName(stage, dayId) {
  return stage.namesByDay?.[dayId] ?? stage.name;
}

// Format 'HH:MM' (24h) into 'H:MMa/p' friendly form.
export function fmtTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'p' : 'a';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${ampm}` : `${h12}:${String(m).padStart(2, '0')}${ampm}`;
}

// Most stages run strictly back-to-back, but a stage can double-book (the
// Saturday Dolores' 16:45 slot). Assign each set a `lane` so colliding sets sit
// side by side inside the stage column instead of stacking on top of each
// other, and a `laneCount` — the width to divide by, computed per run of
// overlapping sets so an isolated collision doesn't narrow the whole day.
function assignLanes(list) {
  const laneFreeAt = [];
  for (const s of list) {
    let lane = laneFreeAt.findIndex((end) => end <= s.startMin);
    if (lane === -1) lane = laneFreeAt.length;
    laneFreeAt[lane] = s.endMin;
    s.lane = lane;
  }

  // Walk the sets in start order, grouping any that transitively overlap.
  let cluster = [];
  let clusterEnd = -Infinity;
  const closeCluster = () => {
    const laneCount = Math.max(...cluster.map((s) => s.lane)) + 1;
    for (const s of cluster) s.laneCount = laneCount;
    cluster = [];
    clusterEnd = -Infinity;
  };
  for (const s of list) {
    if (cluster.length && s.startMin >= clusterEnd) closeCluster();
    cluster.push(s);
    clusterEnd = Math.max(clusterEnd, s.endMin);
  }
  if (cluster.length) closeCluster();
}

// Two acts billed on the same stage for the exact same slot (the Saturday
// Dolores' 16:45, one DJ under two banners) become one block listing both
// names over a single time range, rather than two half-width columns.
// Partial overlaps are left alone — assignLanes still splits those.
function mergeSimultaneous(list) {
  const out = [];
  for (const s of list) {
    const prev = out[out.length - 1];
    if (prev && prev.startMin === s.startMin && prev.endMin === s.endMin) {
      prev.artists.push(s.artist);
    } else {
      out.push({ ...s, artists: [s.artist] });
    }
  }
  return out;
}

// A day's `sets` entries come in two shapes, distinguished by their own
// arity — no separate flag is needed:
//   [stageId, start, end, artist, meta?]  fully timed (4-5 elements)
//   [stageId, artist]                     untimed — stage known (2 elements).
//     `artist` is a name, or an array of names for a B2B slot sharing one
//     container (e.g. ['Erika', 'SF Cowboy']).
//   'Artist'                              untimed — nothing known but the
//     name (a bare string): not yet placed on any stage.
// A day must be entirely timed, or entirely untimed — a lineup announcement
// doesn't reveal set times for some acts and not others. Untimed days can
// freely mix the staged and unstaged shapes, though: a per-stage flyer rarely
// places every act on the bill, and the rest still need to show up somewhere.
function entryKind(entry) {
  if (typeof entry === 'string') return 'unstaged';
  if (entry.length === 2) return 'staged';
  return 'timed';
}

function dayModeOf(entries) {
  if (!entries || !entries.length) return 'timed';
  const kinds = new Set(entries.map(entryKind));
  if (kinds.has('timed')) {
    if (kinds.size > 1) {
      throw new Error(`mixed timed and untimed entries within one day`);
    }
    return 'timed';
  }
  return 'untimed';
}

// Alphabetical sort used for every untimed listing, so the same act name
// always lands in the same place regardless of the order it was typed in.
const byName = (a, b) => a.localeCompare(b);

function buildTimedDay(slug, day, stages, entries) {
  const all = [];
  const byStage = {};
  for (const stage of stages) byStage[stage.id] = [];
  // The optional fifth element carries per-set metadata (currently just
  // `asl` for interpreted performances). Kept out of the tuple's required
  // shape so the vast majority of sets stay four short fields.
  for (const [stageId, start, end, artist, meta] of entries) {
    if (!byStage[stageId]) {
      throw new Error(`${slug}: unknown stage '${stageId}' on ${day.id}`);
    }
    byStage[stageId].push({ stageId, start, end, artist, ...meta });
  }
  for (const stage of stages) {
    const raw = byStage[stage.id];
    for (const cur of raw) {
      cur.startMin = toMin(cur.start);
      cur.endMin = toMin(cur.end);
    }
    // Sort by start then end so identical time ranges land next to each
    // other; the sort is stable, so co-billed acts keep their listed order.
    raw.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
    const list = mergeSimultaneous(raw);
    assignLanes(list);
    // Flag sets that start exactly when the previous one on the same stage
    // ends. Stages like SOMA run back-to-back all day, and since every block
    // in a column shares one colour they otherwise read as a single slab —
    // the grid draws a divider on these. Tracked per lane so a partial
    // overlap doesn't count as following the block beside it.
    const lastEndByLane = {};
    for (const cur of list) {
      cur.followsPrevious = lastEndByLane[cur.lane] === cur.startMin;
      lastEndByLane[cur.lane] = cur.endMin;
    }
    for (let i = 0; i < list.length; i++) {
      const cur = list[i];
      // Namespaced by festival so an id is meaningful on its own — every
      // festival would otherwise generate 'fri-landsend-0'. Index is per
      // stage, so adding a stage never renumbers another's ids.
      const id = `${slug}:${day.id}-${stage.id}-${i}`;
      all.push({
        id,
        festivalSlug: slug,
        dayId: day.id,
        stageId: stage.id,
        artists: cur.artists,
        // Single-string form for places that need one label: popups,
        // long-press, SEO markup.
        artist: cur.artists.join(' + '),
        start: cur.start,
        startMin: cur.startMin,
        endMin: cur.endMin,
        end: cur.end,
        lane: cur.lane,
        laneCount: cur.laneCount,
        followsPrevious: cur.followsPrevious,
        timed: true,
        ...(cur.asl ? { asl: true } : null),
      });
    }
  }
  return all;
}

// No set times yet. Acts placed on a stage (see entryKind) keep the flyer's
// own order down that stage's column — that ordering is the only signal a
// per-stage flyer gives about how the day unfolds, so re-alphabetizing it
// would throw that away. Acts not yet placed on any stage have no such
// signal, so they fall back to one alphabetical pool, stageless.
function buildUntimedDay(slug, day, stages, entries) {
  const all = [];
  const byStage = {};
  for (const stage of stages) byStage[stage.id] = [];
  const unstaged = [];
  for (const entry of entries) {
    if (typeof entry === 'string') {
      unstaged.push(entry);
      continue;
    }
    const [stageId, artistOrArtists] = entry;
    if (!byStage[stageId]) {
      throw new Error(`${slug}: unknown stage '${stageId}' on ${day.id}`);
    }
    byStage[stageId].push(Array.isArray(artistOrArtists) ? artistOrArtists : [artistOrArtists]);
  }
  for (const stage of stages) {
    byStage[stage.id].forEach((artists, i) => {
      all.push({
        id: `${slug}:${day.id}-${stage.id}-${i}`,
        festivalSlug: slug,
        dayId: day.id,
        stageId: stage.id,
        artists,
        artist: artists.join(' + '),
        timed: false,
        order: i,
      });
    });
  }
  [...unstaged].sort(byName).forEach((artist, i) => {
    all.push({
      id: `${slug}:${day.id}-lineup-${i}`,
      festivalSlug: slug,
      dayId: day.id,
      stageId: null,
      artists: [artist],
      artist,
      timed: false,
      order: i,
    });
  });
  return all;
}

function buildSchedule(def) {
  const { slug, stages, days, sets } = def;
  const all = [];
  for (const day of days) {
    const entries = sets[day.id] ?? [];
    const mode = dayModeOf(entries);
    if (mode === 'timed') all.push(...buildTimedDay(slug, day, stages, entries));
    else all.push(...buildUntimedDay(slug, day, stages, entries));
  }
  return all;
}

function build(def) {
  const schedule = buildSchedule(def);
  if (!schedule.length) throw new Error(`${def.slug}: festival has no sets`);

  // Stages that actually have sets on a given day, in canonical order, each
  // carrying the grid column it occupies (column 1 is the time axis, or an
  // empty gutter of the same width on an untimed day). Built once per day so
  // React can compare stage objects by identity.
  const stagesByDay = Object.fromEntries(
    def.days.map((day) => {
      const active = new Set(
        schedule.filter((s) => s.dayId === day.id && s.stageId).map((s) => s.stageId),
      );
      const list = def.stages
        .filter((stage) => active.has(stage.id))
        .map((stage, i) => ({ ...stage, name: stageName(stage, day.id), col: i + 2 }));
      return [day.id, list];
    }),
  );

  // Whether each day is positioned by time or not (see dayModeOf) — the grid
  // uses this to pick a layout. A day with no stages announced either (see
  // stagesByDay above) renders as one flowing alphabetical list instead of
  // columns; see ScheduleGrid.jsx.
  const modeByDay = Object.fromEntries(
    def.days.map((day) => [day.id, dayModeOf(def.sets[day.id] ?? [])]),
  );

  // Grid bounds come from the timed sets only — an untimed day contributes no
  // start/end minutes, so it can't skew the grid built for the timed ones.
  const timedSchedule = schedule.filter((s) => s.timed);
  const allMins = timedSchedule.flatMap((s) => [s.startMin, s.endMin]);
  const gridStartMin = allMins.length ? Math.floor(Math.min(...allMins) / 60) * 60 : 0;
  const gridEndMin = allMins.length ? Math.ceil(Math.max(...allMins) / 60) * 60 : 0;

  return Object.freeze({
    ...def,
    SCHEDULE: schedule,
    SCHEDULE_BY_ID: Object.fromEntries(schedule.map((s) => [s.id, s])),
    STAGES: def.stages,
    DAYS: def.days,
    stagesForDay: (dayId) => stagesByDay[dayId] ?? [],
    // 'timed' | 'untimed' — whether a day is positioned by time.
    dayMode: (dayId) => modeByDay[dayId] ?? 'timed',
    SLOT_MINS,
    SLOTS_PER_HOUR,
    GRID_START_MIN: gridStartMin,
    GRID_END_MIN: gridEndMin,
    TOTAL_SLOTS: (gridEndMin - gridStartMin) / SLOT_MINS,
  });
}

const cache = new Map();

export function buildFestival(def) {
  if (!cache.has(def.slug)) cache.set(def.slug, build(def));
  return cache.get(def.slug);
}
