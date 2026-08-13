// Daisy Chain Fields 2026 — festival definition.
//
// Pure data: no schedule is built here. buildFestival() in shared/festival.js
// turns this into placed blocks, lanes and grid bounds.
//
// Source: the official schedule poster at
// https://www.daisychainfields.com/schedule — the page renders it as a single
// image (DCF26_Schedule-08.12.webp), so these times were read off the artwork
// at full resolution rather than scraped. Re-check against the poster if it is
// reissued; the footer warns times are subject to change.
//
// A one-day festival, so `days` has a single entry.
//
// Format per set: [stageId, 'HH:MM start', 'HH:MM end', 'Artist', meta?]
// All times are PT (24h).

const slug = 'daisy-chain-fields-2026';

// The poster colours Dandelion pink and Marigold yellow — matched here rather
// than guessing from the flower names.
const stages = [
  { id: 'dandelion', name: 'Dandelion Stage', short: 'DAN', color: '--pink-carnation' },
  { id: 'marigold',  name: 'Marigold Stage',  short: 'MAR', color: '--marigold-gold' },
];

const days = [
  { id: 'sat', name: 'Saturday', date: 'Aug 29' },
];

// `asl: true` marks the performances the poster flags as ASL-interpreted.
// Carried through to each block; the grid does not surface it yet.
const asl = { asl: true };

// Each set: [stageId, start, end, artist, meta?]
const sets = {
  sat: [
    // ── Dandelion Stage ─────────────────────────────────────────────────
    ['dandelion', '11:55', '12:25', 'ELI'],
    ['dandelion', '13:05', '13:35', 'Santigold'],
    ['dandelion', '14:15', '14:45', 'KATSEYE'],
    ['dandelion', '15:40', '16:20', 'Mitski'],
    ['dandelion', '17:20', '18:00', 'Doechii', asl],
    ['dandelion', '19:00', '19:40', 'Chappell Roan', asl],
    ['dandelion', '20:40', '22:00', 'Olivia Rodrigo & Special Guests', asl],

    // ── Marigold Stage ──────────────────────────────────────────────────
    ['marigold', '11:20', '11:50', 'Quiet Light'],
    ['marigold', '12:30', '13:00', 'Rachel Chinouriri'],
    ['marigold', '13:40', '14:10', 'Die Spitz'],
    ['marigold', '14:50', '15:30', 'Bikini Kill', asl],
    ['marigold', '16:30', '17:10', 'The Breeders', asl],
    ['marigold', '18:10', '18:50', 'Garbage', asl],
    ['marigold', '19:50', '20:30', 'Not for Radio'],
  ],
};

export default {
  slug,
  name: 'Daisy Chain Fields 2026',
  shortName: 'Daisy Chain Fields',
  year: 2026,
  venue: 'Great Park, Irvine',
  place: {
    name: 'Great Park',
    addressLocality: 'Irvine',
    addressRegion: 'CA',
    addressCountry: 'US',
  },
  utcOffset: '-07:00',
  dateRange: 'August 29, 2026',
  officialUrl: 'https://www.daisychainfields.com/schedule',
  dataVerifiedOn: '2026-08-12',
  headliners: ['Olivia Rodrigo & Special Guests', 'Chappell Roan', 'Doechii', 'Mitski'],
  notableActs: ['Bikini Kill', 'The Breeders', 'Garbage', 'Santigold', 'KATSEYE'],
  stages,
  days,
  sets,
};
