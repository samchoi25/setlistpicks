// Sea.Hear.Now 2026 — festival definition.
//
// Pure data: no schedule is built here. buildFestival() in shared/festival.js
// turns this into placed blocks, lanes and grid bounds.
//
// Source: the official per-day schedule graphics at
// https://www.seahearnowfestival.com/schedule — that page renders the
// schedule only as two square images, so these times were read off the
// artwork at full resolution rather than scraped:
//   - Saturday: .../SHN26_Schedules_1080x1080-saturday_260903.png
//   - Sunday:   .../SHN26_Schedules_1080X1080-sunday_260903.png
// Cross-checked against NJArts' transcription of the same announcement
// (https://www.njarts.net/sea-hear-now-festival-announces-2026-schedule-see-here/),
// which lists start times only; the end times here come from the images.
// The footer warns "artists are subject to change" — re-check if reissued.
//
// The images carry a fourth column, "Surf Activities" (North Beach Surf
// Contest 2:15–5:00, morning yoga at 8:30am). It is not a music stage and
// has no artists, so it is not modelled as one.
//
// Doors 12:00pm, curfew 10:30pm both days — nothing crosses midnight.
//
// Format per set: [stageId, 'HH:MM start', 'HH:MM end', 'Artist', meta?]
// All times are ET (24h).

const slug = 'sea-hear-now-2026';

// The graphics run one warm-to-cool gradient across all three columns rather
// than giving each stage its own colour, so these are chosen to suit the
// beach setting: Surf ocean blue, Park green, Sand sun-gold.
const stages = [
  { id: 'surf', name: 'Surf Stage', short: 'SURF', color: '--ocean-deep' },
  { id: 'park', name: 'Park Stage', short: 'PARK', color: '--jungle-green' },
  { id: 'sand', name: 'Sand Stage', short: 'SAND', color: '--marigold-gold' },
];

const days = [
  { id: 'sat', name: 'Saturday', date: 'Sep 19' },
  { id: 'sun', name: 'Sunday', date: 'Sep 20' },
];

// `asl: true` marks the performances the images flag with the ASL hands icon.
const asl = { asl: true };

const sets = {
  sat: [
    // ── Surf Stage ──────────────────────────────────────────────────────
    ['surf', '13:15', '14:15', 'Steph Strings'],
    ['surf', '15:00', '16:00', 'Men at Work'],
    ['surf', '17:00', '18:00', 'Chaka Khan', asl],
    ['surf', '19:00', '20:00', 'The Offspring', asl],
    ['surf', '21:00', '22:30', 'Mumford & Sons', asl],

    // ── Park Stage ──────────────────────────────────────────────────────
    ['park', '12:30', '13:15', 'Jarod Clemons'],
    ['park', '14:15', '15:00', '54 Ultra'],
    ['park', '16:00', '17:00', 'Fitz and the Tantrums'],
    ['park', '18:00', '19:00', 'The All-American Rejects'],
    ['park', '20:00', '21:00', 'The War on Drugs'],

    // ── Sand Stage ──────────────────────────────────────────────────────
    ['sand', '12:30', '13:15', 'Nat Myers'],
    ['sand', '14:15', '15:00', 'Anders Osborne'],
    ['sand', '16:00', '17:00', 'Tom Odell'],
    ['sand', '18:00', '19:00', 'Susanna Hoffs'],
    ['sand', '20:00', '21:00', 'Shaggy'],
  ],

  sun: [
    // ── Surf Stage ──────────────────────────────────────────────────────
    ['surf', '13:15', '14:15', 'King Stingray'],
    ['surf', '15:00', '16:00', 'Ben Howard'],
    ['surf', '17:00', '18:00', 'Fontaines D.C.', asl],
    ['surf', '19:00', '20:00', 'Goo Goo Dolls', asl],
    ['surf', '21:00', '22:30', 'The Strokes', asl],

    // ── Park Stage ──────────────────────────────────────────────────────
    ['park', '12:30', '13:15', 'Status Green'],
    ['park', '14:15', '15:00', 'Alice Phoebe Lou'],
    ['park', '16:00', '17:00', 'Flipturn'],
    ['park', '18:00', '19:00', 'Ziggy Marley'],
    ['park', '20:00', '21:00', 'Moby'],

    // ── Sand Stage ──────────────────────────────────────────────────────
    ['sand', '12:30', '13:15', 'Blaise'],
    ['sand', '14:15', '15:00', 'Makua'],
    ['sand', '16:00', '17:00', 'Die Spitz'],
    ['sand', '18:00', '19:00', 'Kim Gordon'],
    ['sand', '20:00', '21:00', 'Pixies'],
  ],
};

export default {
  slug,
  name: 'Sea.Hear.Now 2026',
  shortName: 'Sea.Hear.Now',
  year: 2026,
  venue: 'North Beach & Bradley Park, Asbury Park',
  place: {
    name: 'Asbury Park Beach and Boardwalk',
    addressLocality: 'Asbury Park',
    addressRegion: 'NJ',
    addressCountry: 'US',
  },
  utcOffset: '-04:00',
  dateRange: 'September 19–20, 2026',
  officialUrl: 'https://www.seahearnowfestival.com/schedule',
  dataVerifiedOn: '2026-09-09',
  headliners: ['Mumford & Sons', 'The Strokes', 'The Offspring', 'Goo Goo Dolls'],
  notableActs: ['Chaka Khan', 'Fontaines D.C.', 'Pixies', 'The War on Drugs', 'Moby', 'Ziggy Marley'],
  stages,
  days,
  sets,
  groupNames: [
    'Asbury Park Pack', 'Boardwalk Bunch', 'North Beach Crew', 'Stone Pony Squad',
    'Jersey Shore Gang', 'Sand Stage Stragglers', 'Surf Contest Crew', 'Convention Hall Crowd',
    'Wristband Warriors', 'Salt Air Society', 'Tide Chart Trio', 'Sunset Set Seekers',
  ],
};
