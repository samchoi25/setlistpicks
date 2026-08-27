// Austin City Limits Music Festival 2026, Weekend One (Oct 2–4) —
// festival definition. See austin-city-limits-2026-lineup.js for the
// shared transcription both weekends are built from, and its header comment
// for sourcing.
//
// The partial schedule release places some acts on a stage but gives no set
// times, so days render as stage columns of unpositioned acts (see
// dayModeOf()/buildUntimedDay() in shared/festival.js), with the acts that
// have no stage yet pooled alphabetically below them.
//
// The lineup underneath is still the 7.22 poster and is known to be behind
// the 8.21 reissue — see the sourcing block in the lineup module before
// treating this bill as complete.

import { weekLineup, artistLinks, stages } from './austin-city-limits-2026-lineup.js';

const slug = 'austin-city-limits-2026-week-1';

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
  // Feeds <lastmod> in the sitemap. Deliberately the 2026-08-21 stage
  // release rather than the 2026-08-22 date the source was last looked at:
  // that look found the lineup poster had been reissued and NOT re-read, so
  // claiming the 22nd would assert a freshness this file doesn't have. The
  // 21st is the newest date anything here was actually verified against a
  // source. Move it to the day the 8.21 poster is re-transcribed.
  dataVerifiedOn: '2026-08-21',
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
