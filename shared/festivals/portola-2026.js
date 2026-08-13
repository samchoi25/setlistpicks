// Portola Music Festival 2026 — festival definition.
//
// Pure data: no schedule is built here. buildFestival() in shared/festival.js
// turns this into placed blocks, lanes and grid bounds.
//
// Sources (all linked from https://portolamusicfestival.com/lineup/, which
// otherwise only promotes the Portola app — none of this is on the page
// itself as text or JSON, so it's transcribed from the poster art):
//   - full lineup: .../portola/2026/portola-2026-lineup.jpg
//   - Warehouse stage: .../portola/2026/warehouse-26.jpg
//   - Crane Stage:     .../portola/2026/crane-stage-26.jpg
// Transcribed at full resolution on 2026-08-13 — re-check against the posters
// if any is reissued.
//
// Two of the ~30 acts a day are now split across Warehouse and Crane Stage;
// the rest of the lineup hasn't been assigned a stage yet, so those stay
// plain strings (see dayModeOf() in shared/festival.js — a day can freely mix
// `[stageId, artist]` and bare-string entries). Staged entries keep the
// flyer's own order — a stage's own poster is the only ordering signal there
// is before set times exist, so re-sorting it alphabetically would throw that
// away; the unplaced acts have no such signal, so they're alphabetical.
//
// "DJ Shadow Celebrates 30 Years of Endtroducing….." on the full poster and
// Crane flyer is one act billed with a descriptive subtitle — recorded here
// as plain "DJ Shadow".
//
// A B2B slot (two acts sharing one time, once times exist) is one entry with
// both names, e.g. Erika b2b SF Cowboy → ['Erika', 'SF Cowboy'].
//
// Despacio — an ambient, continuous sound-system installation billed "ALL
// WEEKEND LONG" rather than under either day or either stage — is listed
// unstaged on both days since the data model has no day-less slot; it isn't
// a headliner-scale duplicate.
//
// Once official set times land, add start/end and swap the two-element
// staged tuples for `[stageId, 'HH:MM start', 'HH:MM end', 'Artist']`.

const slug = 'portola-2026';

// The Warehouse flyer is yellow, Crane Stage's is orange — matched here
// rather than guessing.
const stages = [
  { id: 'warehouse', name: 'Warehouse', short: 'WH', color: '--marigold-gold' },
  { id: 'crane', name: 'Crane Stage', short: 'CRANE', color: '--sunset-coral' },
];

const days = [
  { id: 'sat', name: 'Saturday', date: 'Sep 26' },
  { id: 'sun', name: 'Sunday', date: 'Sep 27' },
];

const sets = {
  sat: [
    // ── Warehouse (flyer order) ─────────────────────────────────────────
    ['warehouse', 'Prospa'],
    ['warehouse', 'KETTAMA'],
    ['warehouse', 'Max Styler'],
    ['warehouse', ['Beltran', 'Ben Sterling']],
    ['warehouse', 'Groove Armada'],
    ['warehouse', 'Chloé Caillet'],
    ['warehouse', ['Ranger Trucco', 'Alisha']],
    ['warehouse', 'Sam Alfred'],

    // ── Crane Stage (flyer order) ───────────────────────────────────────
    ['crane', 'Soulwax'],
    ['crane', 'Fatboy Slim'],
    ['crane', 'Skepta'],
    ['crane', 'DJ Shadow'],
    ['crane', 'Nimino'],
    ['crane', 'Tricky'],
    ['crane', ['Erika', 'SF Cowboy']],

    // ── Not yet placed on a stage ───────────────────────────────────────
    'Airwolf Paradise',
    'Bassvictim',
    'Despacio (All Weekend)',
    'Dog Blood',
    'FCUKERS',
    'Felly Fell',
    'Gelli Haha',
    'Jigitz',
    'Jyoty',
    'Melanie C (DJ Set)',
    'Mgna Crrrta',
    'Mike D 5D',
    'Nate Sib',
    'Oskar Med K',
    'Robyn',
    'Six Sex',
    'Tove Lo',
  ],
  sun: [
    // ── Warehouse (flyer order) ─────────────────────────────────────────
    ['warehouse', 'Tiësto'],
    ['warehouse', 'Four Tet'],
    ['warehouse', 'Marlon Hoffstadt'],
    ['warehouse', 'Overmono'],
    ['warehouse', 'VTSS'],
    ['warehouse', 'Brunello'],
    ['warehouse', 'Silva Bumpa'],
    ['warehouse', 'Dean Turnley'],

    // ── Crane Stage (flyer order) ───────────────────────────────────────
    ['crane', 'Parcels'],
    ['crane', 'Horsegiirl'],
    ['crane', 'Zulan'],
    ['crane', 'Ninajirachi'],
    ['crane', 'Underscores'],
    ['crane', 'Adéla'],
    ['crane', 'Azzecca'],
    ['crane', 'Torren Foot'],

    // ── Not yet placed on a stage ───────────────────────────────────────
    'Baby J',
    'Ben UFO',
    'Channel Tres',
    'Clearcast',
    'Daphni',
    'Despacio (All Weekend)',
    'JT',
    'Kelela',
    'Mind Enterprises',
    'Mochakk',
    'Riria',
    'SG Lewis (Live)',
    'Swedish House Mafia',
    'Zara Larsson',
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
  notableActs: ['Fatboy Slim', 'Skepta', 'Tove Lo', 'Tiësto', 'Zara Larsson', 'Four Tet'],
  stages,
  days,
  sets,
};
