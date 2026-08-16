// Austin City Limits Music Festival 2026, Weekend One (Oct 2–4) —
// festival definition. See austin-city-limits-2026-lineup.js for the
// shared transcription both weekends are built from, and its header comment
// for sourcing.
//
// No stages or set times are announced yet, so `stages` stays empty and
// every day renders as one alphabetical list (see dayModeOf() in
// shared/festival.js) rather than columns.

import { weekLineup, artistLinks } from './austin-city-limits-2026-lineup.js';

const slug = 'austin-city-limits-2026-week-1';

const stages = [];

const days = [
  { id: 'fri', name: 'Friday', date: 'Oct 2' },
  { id: 'sat', name: 'Saturday', date: 'Oct 3' },
  { id: 'sun', name: 'Sunday', date: 'Oct 4' },
];

const sets = weekLineup(1);

export default {
  slug,
  name: 'Austin City Limits Music Festival 2026 — Weekend One',
  shortName: 'ACL Week 1',
  year: 2026,
  venue: 'Zilker Park, Austin, TX',
  place: {
    name: 'Zilker Park',
    addressLocality: 'Austin',
    addressRegion: 'TX',
    addressCountry: 'US',
  },
  utcOffset: '-05:00',
  dateRange: 'October 2–4, 2026',
  officialUrl: 'https://www.aclfestival.com/lineup',
  dataVerifiedOn: '2026-08-15',
  // The festival's own top-billed tier for each day, per the poster's font
  // hierarchy — Skrillex is this weekend's pick from the Friday co-headline
  // slot (Kings of Leon plays week 2 instead; see austin-city-limits-2026-lineup.js).
  headliners: ['Charli XCX', 'Skrillex', 'RÜFÜS DU SOL', 'Lorde', 'Twenty One Pilots', 'The xx'],
  notableActs: ['Turnstile', 'Lola Young', 'Young Miko', 'Sofi Tukker', 'Geese'],
  stages,
  days,
  sets,
  artistLinks,
};
