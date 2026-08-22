// Austin City Limits Music Festival 2026, Weekend Two (Oct 9–11) —
// festival definition. See austin-city-limits-2026-lineup.js for the
// shared transcription both weekends are built from, and its header comment
// for sourcing.
//
// The partial schedule release places some acts on a stage but gives no set
// times, so days render as stage columns of unpositioned acts (see
// dayModeOf()/buildUntimedDay() in shared/festival.js), with the acts that
// have no stage yet pooled alphabetically below them.

import { weekLineup, artistLinks, stages } from './austin-city-limits-2026-lineup.js';

const slug = 'austin-city-limits-2026-week-2';

const days = [
  { id: 'fri', name: 'Friday', date: 'Oct 9' },
  { id: 'sat', name: 'Saturday', date: 'Oct 10' },
  { id: 'sun', name: 'Sunday', date: 'Oct 11' },
];

const sets = weekLineup(2);

export default {
  slug,
  name: 'Austin City Limits Music Festival 2026 — Weekend Two',
  shortName: 'ACL Week 2',
  year: 2026,
  venue: 'Zilker Park, Austin, TX',
  place: {
    name: 'Zilker Park',
    addressLocality: 'Austin',
    addressRegion: 'TX',
    addressCountry: 'US',
  },
  utcOffset: '-05:00',
  dateRange: 'October 9–11, 2026',
  officialUrl: 'https://www.aclfestival.com/lineup',
  dataVerifiedOn: '2026-08-21',
  // The festival's own top-billed tier for each day, per the poster's font
  // hierarchy — Kings of Leon is this weekend's pick from the Friday
  // co-headline slot (Skrillex plays week 1 instead; see austin-city-limits-2026-lineup.js).
  headliners: ['Charli XCX', 'Kings of Leon', 'RÜFÜS DU SOL', 'Lorde', 'Twenty One Pilots', 'The xx'],
  notableActs: ['Turnstile', 'Lola Young', 'Young Miko', 'Sofi Tukker', 'Geese'],
  stages,
  days,
  sets,
  artistLinks,
};
