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

function buildSchedule(def) {
  const { slug, stages, days, sets } = def;
  const all = [];
  for (const day of days) {
    const byStage = {};
    for (const stage of stages) byStage[stage.id] = [];
    for (const [stageId, start, end, artist] of sets[day.id] ?? []) {
      if (!byStage[stageId]) {
        throw new Error(`${slug}: unknown stage '${stageId}' on ${day.id}`);
      }
      byStage[stageId].push({ stageId, start, end, artist });
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
        });
      }
    }
  }
  return all;
}

function build(def) {
  const schedule = buildSchedule(def);
  if (!schedule.length) throw new Error(`${def.slug}: festival has no sets`);

  // Stages that actually have sets on a given day, in canonical order, each
  // carrying the grid column it occupies (column 1 is the time axis). Built
  // once per day so React can compare stage objects by identity.
  const stagesByDay = Object.fromEntries(
    def.days.map((day) => {
      const active = new Set(
        schedule.filter((s) => s.dayId === day.id).map((s) => s.stageId),
      );
      const list = def.stages
        .filter((stage) => active.has(stage.id))
        .map((stage, i) => ({ ...stage, name: stageName(stage, day.id), col: i + 2 }));
      return [day.id, list];
    }),
  );

  // Grid bounds come from the data, rounded out to the hour, so a late-running
  // stage extends the grid instead of being clipped.
  const allMins = schedule.flatMap((s) => [s.startMin, s.endMin]);
  const gridStartMin = Math.floor(Math.min(...allMins) / 60) * 60;
  const gridEndMin = Math.ceil(Math.max(...allMins) / 60) * 60;

  return Object.freeze({
    ...def,
    SCHEDULE: schedule,
    SCHEDULE_BY_ID: Object.fromEntries(schedule.map((s) => [s.id, s])),
    STAGES: def.stages,
    DAYS: def.days,
    stagesForDay: (dayId) => stagesByDay[dayId] ?? [],
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
