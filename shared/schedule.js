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

export const STAGES = [
  { id: 'landsend',  name: 'Lands End',  short: 'LE'  },
  { id: 'twinpeaks', name: 'Twin Peaks', short: 'TP'  },
  { id: 'sutro',     name: 'Sutro',      short: 'SUT' },
  { id: 'panhandle', name: 'Panhandle',  short: 'PAN' },
  { id: 'soma',      name: 'SOMA',       short: 'SOMA' },
];

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
  ],
};

function buildSchedule() {
  const all = [];
  for (const day of DAYS) {
    const byStage = {};
    for (const stage of STAGES) byStage[stage.id] = [];
    for (const [stageId, start, end, artist] of sets[day.id]) {
      byStage[stageId].push({ stageId, start, end, artist });
    }
    for (const stage of STAGES) {
      const list = byStage[stage.id].sort((a, b) => t(a.start) - t(b.start));
      for (let i = 0; i < list.length; i++) {
        const cur = list[i];
        const startMin = t(cur.start);
        const endMin   = t(cur.end);
        const id = `${day.id}-${stage.id}-${i}`;
        all.push({
          id,
          dayId: day.id,
          stageId: stage.id,
          artist: cur.artist,
          start: cur.start,
          startMin,
          endMin,
          end: cur.end,
        });
      }
    }
  }
  return all;
}

export const SCHEDULE = buildSchedule();

export const SCHEDULE_BY_ID = Object.fromEntries(SCHEDULE.map((s) => [s.id, s]));

// Format 'HH:MM' (24h) into 'H:MMa/p' friendly form.
export function fmtTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'p' : 'a';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${ampm}` : `${h12}:${String(m).padStart(2, '0')}${ampm}`;
}
