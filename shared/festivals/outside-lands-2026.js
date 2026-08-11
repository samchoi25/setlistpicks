// Outside Lands 2026 — festival definition.
//
// Pure data: no schedule is built here. buildFestival() in shared/festival.js
// turns this into placed blocks, lanes and grid bounds.
//
// Source: official set times at https://sfoutsidelands.com/schedule/
// Set times are the OFFICIAL published times, not estimates.
// Last verified against the official schedule: 2026-08-04 (all 157 acts).
//
// Format per set: [stageId, 'HH:MM start', 'HH:MM end', 'Artist']
// All times are PT (24h).

const slug = 'outside-lands-2026';

// `color` names a CSS custom property (defined in styles.css) used for both the
// column header and its blocks, so no per-stage CSS selectors are needed.
// `namesByDay` overrides `name` on a given day — the Dolores' stage rebrands
// itself for each night's takeover.
//
// A stage is only rendered on days where it actually has sets, so a one-day
// pop-up stage just needs entries under that day.
const stages = [
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

const days = [
  { id: 'fri', name: 'Friday',   date: 'Aug 7' },
  { id: 'sat', name: 'Saturday', date: 'Aug 8' },
  { id: 'sun', name: 'Sunday',   date: 'Aug 9' },
];

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

export default {
  slug,
  name: 'Outside Lands 2026',
  shortName: 'Outside Lands',
  year: 2026,
  venue: 'Golden Gate Park, San Francisco',
  // Structured form for the JSON-LD MusicFestival schema.
  place: {
    name: 'Golden Gate Park',
    streetAddress: '501 Stanyan St',
    addressLocality: 'San Francisco',
    addressRegion: 'CA',
    postalCode: '94117',
    addressCountry: 'US',
  },
  // Timezone offset used when turning 'HH:MM' into ISO datetimes.
  utcOffset: '-07:00',
  // Human-readable range used in copy; `days` carries the per-day dates.
  dateRange: 'August 7\u20139, 2026',
  officialUrl: 'https://sfoutsidelands.com/lineup/',
  // Headliners drive the <title> and meta description for this festival's page.
  headliners: ['Charli xcx', 'The Strokes', 'R\u00dcF\u00dcS DU SOL', 'Baby Keem'],
  notableActs: [
    'Turnstile', 'The xx', 'PinkPantheress', 'Death Cab for Cutie',
    'Ethel Cain', 'Lucy Dacus',
  ],
  stages,
  days,
  sets,
};
