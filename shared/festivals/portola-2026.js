// Portola Music Festival 2026 — festival definition.
//
// Pure data: no schedule is built here. buildFestival() in shared/festival.js
// turns this into placed blocks, lanes and grid bounds.
//
// NOT YET REGISTERED — see shared/festivals/index.js. As of 2026-08-12 the
// official site (https://portolamusicfestival.com/lineup/) has not announced
// a lineup: the page just promotes the Portola app ("add your favorite
// artists & be prepared when the set times drop"). Checked the raw HTML, not
// just the rendered page — there is no poster image or embedded lineup data
// to seed this from yet, on that URL or the homepage.
//
// buildFestival() throws if a festival has zero sets, so this stays out of
// DEFINITIONS until there's real data. To bring it online:
//   1. Fill in `sets.sat` / `sets.sun` below. If the poster names stages but
//      not times yet, use `[stageId, 'Artist']` pairs; if it's just a name
//      list, use plain strings — see shared/festival.js's dayModeOf() for the
//      three shapes a day's entries can take. Swap in `[stageId, 'HH:MM
//      start', 'HH:MM end', 'Artist']` tuples once official set times land.
//   2. Add stage entries to `stages` below once stage names are known.
//   3. Import and add to DEFINITIONS in shared/festivals/index.js, and add a
//      'portola' entry to FESTIVAL_ALIASES there.
//
// Dates/venue confirmed from https://portolamusicfestival.com/general-info.

const slug = 'portola-2026';

// Stage names not yet announced.
const stages = [];

const days = [
  { id: 'sat', name: 'Saturday', date: 'Sep 26' },
  { id: 'sun', name: 'Sunday', date: 'Sep 27' },
];

// No lineup announced yet — fill in per the shapes described above once it is.
const sets = {
  sat: [],
  sun: [],
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
  dataVerifiedOn: '2026-08-12',
  headliners: [],
  notableActs: [],
  stages,
  days,
  sets,
};
