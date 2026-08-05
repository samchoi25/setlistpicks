// Outside Lands 2026 schedule.
// Source: official set times at https://sfoutsidelands.com/schedule/
// Set times are the OFFICIAL published times, not estimates.
// Last verified against the official schedule: 2026-08-04 (all 97 sets).
//
// Format per set: [stageId, 'HH:MM start', 'HH:MM end', 'Artist']
// Stage order: Lands End (main) → Twin Peaks → Sutro → Panhandle → SOMA
//
// Three secondary areas on the official schedule are intentionally omitted:
//   - Duboce Triangle: short pop-up sets, all by artists who also play one of
//     the five stages above — except Sunday's 'Britton', the lone exception.
//   - Dolores' (x Hot Goth GF / x OASIS / x Polyglamorous): drag + DJ
//     programming, unique artists, rotating name per day.
//   - Cocktail Magic: bingo, open mic, and club nights rather than sets.
//
// All times are PT (24h).

// Adding a stage should mean editing this list and nothing else.
//
// `color` names a CSS custom property (defined in styles.css) used for both the
// column header and its blocks, so no per-stage CSS selectors are needed.
// `namesByDay` overrides `name` on a given day — the Dolores' stage rebrands
// itself for each night's takeover.
//
// A stage is only rendered on days where it actually has sets, so a one-day
// pop-up stage just needs entries under that day.
export const STAGES = [
  { id: 'landsend',  name: 'Lands End',       short: 'LE',   color: '--ocean-deep' },
  { id: 'twinpeaks', name: 'Twin Peaks',      short: 'TP',   color: '--pink-carnation' },
  { id: 'sutro',     name: 'Sutro',           short: 'SUT',  color: '--muted-olive' },
  { id: 'panhandle', name: 'Panhandle',       short: 'PAN',  color: '--jungle-green' },
  { id: 'soma',      name: 'SOMA',            short: 'SOMA', color: '--dusk-purple' },
  {
    id: 'dolores',
    name: "Dolores'",
    short: 'DOL',
    color: '--sunset-coral',
    namesByDay: {
      fri: "Dolores' x Hot Goth GF",
      sat: "Dolores' x OASIS",
      sun: "Dolores' x Polyglamorous",
    },
  },
  { id: 'duboce',    name: 'Duboce Triangle', short: 'DUB',  color: '--brick-clay' },
  { id: 'cocktail',  name: 'Cocktail Magic',  short: 'CKM',  color: '--deep-teal' },
];

// Display name for a stage on a given day.
export function stageName(stage, dayId) {
  return stage.namesByDay?.[dayId] ?? stage.name;
}

export const DAYS = [
  { id: 'fri', name: 'Friday',   date: 'Aug 7' },
  { id: 'sat', name: 'Saturday', date: 'Aug 8' },
  { id: 'sun', name: 'Sunday',   date: 'Aug 9' },
];

// Helper: 'HH:MM' → minutes since midnight.
const t = (s) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};

// Each set: [stageId, start, end, artist]
const sets = {
  fri: [
    // ── Lands End Stage ─────────────────────────────────────────────────
    ['landsend', '12:05', '12:50', 'Faouzia'],
    ['landsend', '13:20', '14:05', 'Grace Ives'],
    ['landsend', '14:35', '15:25', 'Durand Bernarr'],
    ['landsend', '15:55', '16:45', 'Wet Leg'],
    ['landsend', '17:15', '18:00', 'GloRilla'],
    ['landsend', '18:30', '19:40', 'Labrinth'],
    ['landsend', '20:40', '22:00', 'Charli xcx'],

    // ── Twin Peaks Stage ────────────────────────────────────────────────
    ['twinpeaks', '12:35', '13:20', 'NEZZA'],
    ['twinpeaks', '14:05', '14:50', 'Kerala Dust'],
    ['twinpeaks', '15:35', '16:25', 'ALLEYCVT'],
    ['twinpeaks', '17:10', '18:00', 'Tinashe'],
    ['twinpeaks', '18:45', '19:35', 'Clipse'],
    ['twinpeaks', '20:25', '21:55', 'GRIZTRONICS'],

    // ── Sutro Stage ─────────────────────────────────────────────────────
    ['sutro', '12:25', '13:10', 'Bad Nerves'],
    ['sutro', '13:40', '14:25', 'Die Spitz'],
    ['sutro', '14:55', '15:40', 'The Story So Far'],
    ['sutro', '16:10', '17:10', 'Sierra Ferrell'],
    ['sutro', '17:50', '18:50', 'Geese'],
    ['sutro', '19:20', '20:20', 'Turnstile'],
    ['sutro', '20:50', '21:50', 'Modest Mouse'],

    // ── Panhandle Stage ─────────────────────────────────────────────────
    ['panhandle', '12:00', '12:30', 'Dani Satin and Always Hallways'],
    ['panhandle', '13:20', '14:00', 'Chezile'],
    ['panhandle', '14:50', '15:30', 'Sawyer Hill'],
    ['panhandle', '16:25', '17:05', 'Billie Marten'],
    ['panhandle', '18:00', '18:40', 'Goldie Boutilier'],
    ['panhandle', '19:35', '20:20', 'Dylan Brady'],

    // ── SOMA Stage ──────────────────────────────────────────────────────
    ['soma', '12:00', '12:55', 'Vertigo'],
    ['soma', '12:55', '14:25', 'Luke Alessi'],
    ['soma', '14:25', '15:55', 'tobiahs'],
    ['soma', '15:55', '17:25', 'MPH'],
    ['soma', '17:25', '18:55', 'KI/KI'],
    ['soma', '18:55', '20:25', '¥ØU$UK€ ¥UK1MAT$U'],
    ['soma', '20:25', '21:55', 'ODD MOB & OMNOM present HYPERBEAM'],

    // ── Dolores' x Hot Goth GF ──────────────────────────────────────────
    ['dolores', '12:30', '13:15', 'DJ Erinyes'],
    ['dolores', '13:15', '14:00', 'DJ Dolomedes'],
    ['dolores', '14:00', '14:30', 'Pink Stiletto'],
    ['dolores', '14:30', '15:20', 'DJ Starr Noir'],
    ['dolores', '15:20', '15:50', 'Hot Goth Freak Show'],
    ['dolores', '15:50', '16:35', 'Soltera'],
    ['dolores', '16:35', '17:20', 'DJ Hopeless & Hot Goth Pole Show'],
    ['dolores', '17:20', '18:05', 'Ms. Boan'],
    ['dolores', '18:05', '18:35', 'Hot Goth Freak Show'],
    ['dolores', '18:45', '19:30', 'Light Asylum'],
    ['dolores', '19:30', '20:30', 'Romy (DJ Set)'],

    // ── Duboce Triangle ─────────────────────────────────────────────────
    ['duboce', '14:05', '14:35', 'NEZZA'],
    ['duboce', '15:25', '15:55', 'Chezile'],
    ['duboce', '16:45', '17:15', 'Luke Alessi'],
    ['duboce', '18:15', '18:45', 'ALLEYCVT'],
    ['duboce', '19:55', '20:40', 'tobiahs'],

    // ── Cocktail Magic ──────────────────────────────────────────────────
    ['cocktail', '12:30', '13:15', 'BINGO LOCO'],
    ['cocktail', '13:40', '14:25', 'BINGO LOCO'],
    ['cocktail', '14:50', '15:35', 'BINGO LOCO'],
    ['cocktail', '16:05', '16:50', 'Open Mic hosted by Rainbow Girls'],
    ['cocktail', '17:05', '18:05', 'Bootie Mashup: Diva Pop w/ DJ Tyme'],
    ['cocktail', '18:20', '19:20', 'The Emo Night Tour'],
  ],

  sat: [
    // ── Lands End Stage ─────────────────────────────────────────────────
    ['landsend', '12:10', '12:55', 'Bandalos Chinos'],
    ['landsend', '13:25', '14:10', 'Haute & Freddy'],
    ['landsend', '14:40', '15:30', 'Audrey Hobert'],
    ['landsend', '16:00', '16:50', 'Lucy Dacus'],
    ['landsend', '17:20', '18:20', 'Ethel Cain'],
    ['landsend', '18:50', '19:50', 'Djo'],
    ['landsend', '20:35', '21:55', 'The Strokes'],

    // ── Twin Peaks Stage ────────────────────────────────────────────────
    ['twinpeaks', '12:30', '13:10', 'Red Leather'],
    ['twinpeaks', '13:55', '14:35', 'After'],
    ['twinpeaks', '15:10', '16:00', 'Łaszewo'],
    ['twinpeaks', '16:45', '17:45', 'Malcolm Todd'],
    ['twinpeaks', '18:30', '19:20', 'Dijon'],
    ['twinpeaks', '20:10', '21:25', 'The xx'],

    // ── Sutro Stage ─────────────────────────────────────────────────────
    ['sutro', '12:35', '13:20', 'RIO KOSTA'],
    ['sutro', '13:50', '14:35', 'Wunderhorse'],
    ['sutro', '15:05', '15:50', 'Sienna Spiro'],
    ['sutro', '16:20', '17:05', 'Yard Act'],
    ['sutro', '17:35', '18:20', 'Snow Strippers'],
    ['sutro', '18:50', '20:00', "it's murph"],
    ['sutro', '20:45', '21:45', 'PinkPantheress'],

    // ── Panhandle Stage ─────────────────────────────────────────────────
    ['panhandle', '12:00', '12:30', 'RYMAN'],
    ['panhandle', '13:10', '13:50', 'Racing Mount Pleasant'],
    ['panhandle', '14:35', '15:05', 'Ally Evenson'],
    ['panhandle', '16:00', '16:40', 'Automatic'],
    ['panhandle', '17:45', '18:25', 'Silvana Estrada'],
    ['panhandle', '19:20', '20:05', 'DJ Trixie Mattel'],

    // ── SOMA Stage ──────────────────────────────────────────────────────
    ['soma', '12:35', '13:55', 'bad juuju'],
    ['soma', '13:55', '15:25', '1-800 GIRLS'],
    ['soma', '15:25', '16:55', 'camoufly'],
    ['soma', '16:55', '18:25', 'Sultan + Shepard'],
    ['soma', '18:40', '20:10', 'Ben Böhmer'],
    ['soma', '20:25', '21:55', 'Lane 8'],

    // ── Dolores' x OASIS ────────────────────────────────────────────────
    // Note: the two 16:45 sets genuinely overlap on the official schedule —
    // the same DJ billed under both the PRINCESS and OASIS banners. The grid
    // splits a stage column into lanes when sets collide, so both show.
    ['dolores', '12:30', '13:30', "OUT TONIGHT: A Musical Singalong feat. D'Arcy Drollinger"],
    ['dolores', '13:30', '14:15', 'OASIS DJ Set: Beverly Chills'],
    ['dolores', '14:15', '15:15', 'REPARATIONS w/ DJ Newoncé'],
    ['dolores', '15:15', '16:45', 'REPARATIONS w/ Nicki Jizz feat. Kori King'],
    ['dolores', '16:45', '17:45', 'PRINCESS DJ Set: DJ Ion The Prize'],
    ['dolores', '16:45', '17:45', 'OASIS DJ Set: DJ Ion The Prize'],
    ['dolores', '17:45', '19:15', 'PRINCESS w/ Tito Soto feat. Lydia B Kollins'],

    // ── Duboce Triangle ─────────────────────────────────────────────────
    ['duboce', '12:15', '13:45', 'Surprise Guest'],
    ['duboce', '14:10', '14:40', 'Bandalos Chinos'],
    ['duboce', '15:30', '16:00', 'Racing Mount Pleasant'],
    ['duboce', '16:50', '17:20', 'RIO KOSTA (DJ Set)'],
    ['duboce', '18:20', '18:50', 'Łaszewo'],
    ['duboce', '19:50', '20:35', 'bad juuju'],

    // ── Cocktail Magic ──────────────────────────────────────────────────
    ['cocktail', '12:30', '13:15', 'BINGO LOCO'],
    ['cocktail', '13:40', '14:25', 'BINGO LOCO'],
    ['cocktail', '14:50', '15:35', 'BINGO LOCO'],
    ['cocktail', '16:05', '16:50', 'Open Mic hosted by Rainbow Girls'],
    ['cocktail', '17:05', '18:05', 'Bootie Mashup: Hip Hop Fuego w/ DJ Airsun'],
    ['cocktail', '18:20', '19:20', 'Electric Feels'],
  ],

  sun: [
    // ── Lands End Stage ─────────────────────────────────────────────────
    ['landsend', '12:00', '12:40', "SF Gay Men's Chorus"],
    ['landsend', '13:10', '13:55', 'Sports'],
    ['landsend', '14:25', '15:15', 'Balu Brigada'],
    ['landsend', '15:45', '16:45', 'JADE'],
    ['landsend', '17:15', '18:15', 'Disco Lines'],
    ['landsend', '18:45', '19:45', 'Empire Of The Sun'],
    ['landsend', '20:25', '21:55', 'RÜFÜS DU SOL'],

    // ── Twin Peaks Stage ────────────────────────────────────────────────
    ['twinpeaks', '12:45', '13:25', 'Magnus Ferrell'],
    ['twinpeaks', '14:10', '14:55', 'sosocamo'],
    ['twinpeaks', '15:40', '16:30', 'DESTIN CONRAD'],
    ['twinpeaks', '17:15', '18:05', 'kwn'],
    ['twinpeaks', '18:50', '19:50', 'Mariah the Scientist'],
    ['twinpeaks', '20:40', '21:55', 'Baby Keem'],

    // ── Sutro Stage ─────────────────────────────────────────────────────
    ['sutro', '12:40', '13:30', 'Death Cab for Cutie'],
    ['sutro', '13:50', '14:30', 'Marlon Funaki'],
    ['sutro', '15:00', '15:45', 'Momma'],
    ['sutro', '16:15', '17:05', 'Kingfishr'],
    ['sutro', '17:35', '18:25', 'The Temper Trap'],
    ['sutro', '19:05', '19:55', 'Not for Radio'],
    ['sutro', '20:25', '21:40', 'Death Cab for Cutie'],

    // ── Panhandle Stage ─────────────────────────────────────────────────
    ['panhandle', '12:00', '12:40', 'Cruz Beckham'],
    ['panhandle', '13:25', '14:05', 'Day We Ran'],
    ['panhandle', '14:55', '15:35', 'Amble'],
    ['panhandle', '16:30', '17:10', 'Night Tapes'],
    ['panhandle', '18:05', '18:45', 'Infinity Song'],
    ['panhandle', '19:50', '20:35', 'Frost Children'],

    // ── SOMA Stage ──────────────────────────────────────────────────────
    ['soma', '12:05', '13:35', 'Etari'],
    ['soma', '13:35', '15:10', 'X CLUB.'],
    ['soma', '15:10', '16:45', 'Carlita'],
    ['soma', '16:45', '18:20', 'Boys Noize'],
    ['soma', '18:20', '19:55', 'Miss Monique'],
    ['soma', '19:55', '21:55', 'Boris Brejcha'],

    // ── Dolores' x Polyglamorous ────────────────────────────────────────
    ['dolores', '12:45', '14:25', 'Charles Hawthorne'],
    ['dolores', '14:25', '15:45', "Mark O'Brien"],
    ['dolores', '15:45', '16:05', 'Grace Towers & Friends'],
    ['dolores', '16:05', '17:05', 'Stanley Frank Sensation'],
    ['dolores', '17:05', '18:05', 'BEYA'],
    ['dolores', '18:05', '18:25', 'Grace Towers & Friends'],
    ['dolores', '18:25', '19:25', 'Elaine & Robin'],
    ['dolores', '19:25', '20:25', 'DJ Minx'],

    // ── Duboce Triangle ─────────────────────────────────────────────────
    ['duboce', '14:05', '14:35', 'Britton'],
    ['duboce', '15:25', '15:55', 'Day We Ran'],
    ['duboce', '16:45', '17:30', 'Frost Children (DJ Set)'],
    ['duboce', '18:15', '18:45', 'Marlon Funaki'],
    ['duboce', '19:45', '20:45', 'Surprise Guest'],

    // ── Cocktail Magic ──────────────────────────────────────────────────
    ['cocktail', '12:30', '13:15', 'BINGO LOCO'],
    ['cocktail', '13:40', '14:25', 'BINGO LOCO'],
    ['cocktail', '14:50', '15:35', 'BINGO LOCO'],
    ['cocktail', '16:05', '16:50', 'Open Mic hosted by Rainbow Girls'],
    ['cocktail', '17:15', '17:45', 'Aidan Corcoran'],
    ['cocktail', '18:00', '19:00', 'Help Me Lose My Mind: UK Garage & House w/ MPHD'],
  ],
};

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

function buildSchedule() {
  const all = [];
  for (const day of DAYS) {
    const byStage = {};
    for (const stage of STAGES) byStage[stage.id] = [];
    for (const [stageId, start, end, artist] of sets[day.id]) {
      if (!byStage[stageId]) throw new Error(`Unknown stage '${stageId}' on ${day.id}`);
      byStage[stageId].push({ stageId, start, end, artist });
    }
    for (const stage of STAGES) {
      const raw = byStage[stage.id];
      for (const cur of raw) {
        cur.startMin = t(cur.start);
        cur.endMin   = t(cur.end);
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
        // Index is per stage, so adding a stage never renumbers another's
        // ids — existing votes stay attached to the right set.
        const id = `${day.id}-${stage.id}-${i}`;
        all.push({
          id,
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

export const SCHEDULE = buildSchedule();

export const SCHEDULE_BY_ID = Object.fromEntries(SCHEDULE.map((s) => [s.id, s]));

// Stages that actually have sets on a given day, in canonical STAGES order,
// each carrying the grid column it occupies (column 1 is the time axis).
// Built once per day and cached, so React can compare stage objects by identity.
const STAGES_BY_DAY = Object.fromEntries(
  DAYS.map((day) => {
    const active = new Set(
      SCHEDULE.filter((s) => s.dayId === day.id).map((s) => s.stageId),
    );
    const list = STAGES
      .filter((stage) => active.has(stage.id))
      .map((stage, i) => ({ ...stage, name: stageName(stage, day.id), col: i + 2 }));
    return [day.id, list];
  }),
);

export function stagesForDay(dayId) {
  return STAGES_BY_DAY[dayId] ?? [];
}

// Grid bounds come from the data, rounded out to the hour, so a late-running
// stage extends the grid instead of being clipped.
const ALL_MINS = SCHEDULE.flatMap((s) => [s.startMin, s.endMin]);
// Every published set time lands on a 5-minute boundary, so a 5-minute slot
// places all of them exactly. A coarser 15-minute slot rounded 124 of the 157
// sets — up to 10 minutes each — which both misplaced blocks and shrank short
// sets below the height their name needs.
export const SLOT_MINS      = 5;
export const SLOTS_PER_HOUR = 60 / SLOT_MINS;
export const GRID_START_MIN = Math.floor(Math.min(...ALL_MINS) / 60) * 60;
export const GRID_END_MIN   = Math.ceil(Math.max(...ALL_MINS) / 60) * 60;
export const TOTAL_SLOTS    = (GRID_END_MIN - GRID_START_MIN) / SLOT_MINS;

// Format 'HH:MM' (24h) into 'H:MMa/p' friendly form.
export function fmtTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'p' : 'a';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${ampm}` : `${h12}:${String(m).padStart(2, '0')}${ampm}`;
}
