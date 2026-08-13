// Portola Music Festival 2026 — festival definition.
//
// Pure data: no schedule is built here. buildFestival() in shared/festival.js
// turns this into placed blocks, lanes and grid bounds.
//
// Source: the lineup poster at
// https://aegwebprod.blob.core.windows.net/content/portola/2026/portola-2026-lineup.jpg
// (linked from https://portolamusicfestival.com/lineup/, which otherwise only
// promotes the Portola app). Names transcribed from the poster art at full
// resolution on 2026-08-13 — there is no text/JSON source, so re-check against
// the poster if it is reissued.
//
// The poster names no stages, so every set is `[dayId]: 'Artist'` — the
// 'unstaged-untimed' shape (see dayModeOf() in shared/festival.js). It also
// has no set times, which the app expects: once official set times (and
// likely stage names) are announced, add `stages` entries and swap these
// plain strings for `[stageId, 'HH:MM start', 'HH:MM end', 'Artist']` tuples.
//
// Despacio — an ambient, continuous sound-system installation billed "ALL
// WEEKEND LONG" rather than under either day — is listed on both days since
// the data model has no day-less slot; it isn't a headliner-scale duplicate.

const slug = 'portola-2026';

// No stage names announced yet.
const stages = [];

const days = [
  { id: 'sat', name: 'Saturday', date: 'Sep 26' },
  { id: 'sun', name: 'Sunday', date: 'Sep 27' },
];

const sets = {
  sat: [
    'Robyn',
    'Dog Blood',
    'Soulwax',
    'Prospa',
    'KETTAMA',
    'Fatboy Slim',
    'Skepta',
    'Tove Lo',
    'Max Styler',
    'Beltran b2b Ben Sterling',
    'FCUKERS',
    'Mike D 5D',
    'Groove Armada',
    'DJ Shadow Celebrates 30 Years of Endtroducing…',
    'Bassvictim',
    'Nimino',
    'Melanie C (DJ Set)',
    'Oskar Med K',
    'Jigitz',
    'Tricky',
    'Chloé Caillet',
    'Jyoty',
    'Ranger Trucco b2b Alisha',
    'Six Sex',
    'Nate Sib',
    'Mgna Crrrta',
    'Sam Alfred',
    'Gelli Haha',
    'Airwolf Paradise',
    'Erika b2b SFCowboy',
    'Felly Fell',
    'Despacio (All Weekend)',
  ],
  sun: [
    'Swedish House Mafia',
    'Tiësto (In The Warehouse)',
    'Zara Larsson',
    'Four Tet',
    'Parcels',
    'Mochakk',
    'Marlon Hoffstadt',
    'Horsegiirl',
    'Overmono',
    'Zulan',
    'Ninajirachi',
    'Underscores',
    'Adéla',
    'SG Lewis (Live)',
    'Kelela',
    'Daphni',
    'JT',
    'Baby J',
    'Channel Tres',
    'VTSS',
    'Ear Brunello',
    'Ben UFO',
    'Silva Bumpa',
    'Mind Enterprises',
    'Azzecca',
    'Dean Turnley',
    'Riria',
    'Torren Foot',
    'Clearcast',
    'Despacio (All Weekend)',
  ],
};

export default {
  slug,
  name: 'Portola Music Festival 2026',
  shortName: 'Portola',
  year: 2026,
  venue: 'Pier 80, San Francisco',
  place: {
    name: 'Pier 80',
    addressLocality: 'San Francisco',
    addressRegion: 'CA',
    addressCountry: 'US',
  },
  utcOffset: '-07:00',
  dateRange: 'September 26–27, 2026',
  officialUrl: 'https://portolamusicfestival.com/lineup/',
  dataVerifiedOn: '2026-08-13',
  headliners: ['Robyn', 'Dog Blood', 'Swedish House Mafia'],
  notableActs: ['Fatboy Slim', 'Skepta', 'Tove Lo', 'Tiësto (In The Warehouse)', 'Zara Larsson', 'Four Tet'],
  stages,
  days,
  sets,
};
