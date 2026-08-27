// Austin City Limits Music Festival 2026, Weekend Two (Oct 9–11) —
// festival definition. See austin-city-limits-2026-lineup.js for the
// shared stage list, artist links, and full sourcing/reconciliation notes.
//
// `sets` below is transcribed directly from the official per-day schedule
// images at https://www.aclfestival.com/schedule (six images, one per day
// per weekend — the page itself has no text or API), read at full
// resolution 2026-08-26. All three days this weekend came from the 8.17
// release (see the lineup module for exact image URLs).
//
// Every act on the schedule prints a start AND end time except the last set
// on each stage each day, which prints only a start time (no end, and no
// visual cue distinguishing it from a smaller stage simply finishing
// early — confirmed by inspecting the artwork directly). Since a timed set
// requires an end time, those closing sets use 22:00 (10 PM) — the grid's
// own closing boundary and ACL's nightly curfew — as an inferred end, not
// a printed one: Kings of Leon (T-Mobile), Lorde (T-Mobile, Sat), The xx
// (T-Mobile, Sun), and the American Express headliner every day (Charli
// XCX, RÜFÜS DU SOL, Twenty One Pilots).
//
// The hand-icon legend ("ASL interpreted set") lands on exactly one set per
// day, always the American Express headliner — encoded as `asl` meta.
//
// Silent Disco (Tito's, 8:00–10:00 every day) is a festival activity, not a
// bookable artist, and is intentionally left out.

import { artistLinks, stages } from './austin-city-limits-2026-lineup.js';

const slug = 'austin-city-limits-2026-week-2';

const days = [
  { id: 'fri', name: 'Friday', date: 'Oct 9' },
  { id: 'sat', name: 'Saturday', date: 'Oct 10' },
  { id: 'sun', name: 'Sunday', date: 'Oct 11' },
];

// ASL-interpreted performances (see header comment).
const asl = { asl: true };

// Each set: [stageId, start, end, artist, meta?]
const sets = {
  fri: [
    // ── T-Mobile ──────────────────────────────────────────────────────────
    ['tmobile', '13:00', '13:45', 'Happy Landing'],
    ['tmobile', '14:30', '15:15', 'Bella Kay'],
    ['tmobile', '16:15', '17:15', 'Jesse Welles'],
    ['tmobile', '18:15', '19:15', 'Turnstile'],
    ['tmobile', '20:15', '22:00', 'Kings of Leon'],
    // ── Miller Lite ───────────────────────────────────────────────────────
    ['millerlite', '13:45', '14:30', 'Radio Free Alice'],
    ['millerlite', '15:30', '16:15', 'Sienna Spiro'],
    ['millerlite', '17:15', '18:15', 'Paris Paloma'],
    ['millerlite', '19:15', '20:15', 'Leon Thomas'],
    // ── BMI ───────────────────────────────────────────────────────────────
    ['bmi', '13:45', '14:30', 'Leon Knight'],
    ['bmi', '15:30', '16:15', 'Girlfriend'],
    ['bmi', '17:15', '18:15', 'Joe Jordan'],
    // ── BeatBox ───────────────────────────────────────────────────────────
    ['beatbox', '14:00', '14:45', 'S.G. Goodman'],
    ['beatbox', '15:30', '16:30', 'World Famous Pets'],
    ['beatbox', '17:30', '18:30', 'Rusowsky'],
    ['beatbox', '19:30', '20:30', 'LIVE'],
    // ── Tito's ────────────────────────────────────────────────────────────
    ['titos', '12:45', '13:30', 'Almost Heaven'],
    ['titos', '14:00', '14:45', 'Cassandra Coleman'],
    ['titos', '15:15', '16:00', 'Bo Staloch'],
    ['titos', '16:30', '17:30', 'Natasha Bedingfield'],
    ['titos', '18:30', '19:30', 'Steve Aoki'],
    // ── Snapchat ──────────────────────────────────────────────────────────
    ['snapchat', '14:00', '14:45', 'Dallas Wax'],
    ['snapchat', '15:30', '16:30', 'LP'],
    ['snapchat', '17:30', '18:30', 'BUNT.'],
    ['snapchat', '19:30', '20:30', 'The Chainsmokers'],
    // ── American Express ─────────────────────────────────────────────────
    ['amex', '13:15', '14:00', 'Brigitte Calls Me Baby'],
    ['amex', '14:45', '15:30', 'Faouzia'],
    ['amex', '16:30', '17:30', 'Amyl and the Sniffers'],
    ['amex', '18:30', '19:30', 'Labrinth'],
    ['amex', '20:40', '22:00', 'Charli XCX', asl],
  ],
  sat: [
    // ── T-Mobile ──────────────────────────────────────────────────────────
    ['tmobile', '13:00', '13:45', 'Night Tapes'],
    ['tmobile', '14:30', '15:15', 'Balu Brigada'],
    ['tmobile', '16:15', '17:15', 'Suki Waterhouse'],
    ['tmobile', '18:15', '19:15', 'Bleachers'],
    ['tmobile', '20:15', '22:00', 'Lorde'],
    // ── Miller Lite ───────────────────────────────────────────────────────
    ['millerlite', '13:45', '14:30', 'Temper City'],
    ['millerlite', '15:15', '16:15', 'Łaszewo'],
    ['millerlite', '17:15', '18:15', 'Snow Strippers'],
    ['millerlite', '19:15', '20:15', 'Levity'],
    // ── BMI ───────────────────────────────────────────────────────────────
    ['bmi', '12:45', '13:15', 'Macy Todd'],
    ['bmi', '13:45', '14:30', 'Damaris Bojor'],
    ['bmi', '15:30', '16:15', 'Common People'],
    ['bmi', '17:15', '18:15', 'Chloe Qisha'],
    // ── BeatBox ───────────────────────────────────────────────────────────
    ['beatbox', '14:00', '14:45', 'LLUVII'],
    ['beatbox', '15:30', '16:30', 'Arcy Drive'],
    ['beatbox', '17:30', '18:30', 'Ryan Beatty'],
    ['beatbox', '19:30', '20:30', 'Fakemink'],
    // ── Tito's ────────────────────────────────────────────────────────────
    ['titos', '12:45', '13:30', 'Montclair'],
    ['titos', '14:00', '14:45', 'Nat Myers'],
    ['titos', '15:15', '16:00', 'Don West'],
    ['titos', '16:30', '17:30', 'Rodrigo y Gabriela'],
    ['titos', '18:30', '19:30', '¥ØU$UK€ ¥UK1MAT$U'],
    // ── Snapchat ──────────────────────────────────────────────────────────
    ['snapchat', '14:00', '14:45', 'Gabriel Jacoby'],
    ['snapchat', '15:30', '16:30', 'Skye Newman'],
    ['snapchat', '17:30', '18:30', "It's Murph"],
    ['snapchat', '19:30', '20:30', 'Lykke Li'],
    // ── American Express ─────────────────────────────────────────────────
    ['amex', '13:15', '14:00', 'Annie DiRusso'],
    ['amex', '14:45', '15:30', 'Finn Wolfhard'],
    ['amex', '16:30', '17:30', 'Young Miko'],
    ['amex', '18:30', '19:30', 'Lola Young'],
    ['amex', '20:30', '22:00', 'RÜFÜS DU SOL', asl],
  ],
  sun: [
    // ── T-Mobile ──────────────────────────────────────────────────────────
    ['tmobile', '13:15', '14:00', 'Thomas Day'],
    ['tmobile', '14:45', '15:30', 'Charlotte Lawrence'],
    ['tmobile', '16:30', '17:30', 'Audrey Hobert'],
    ['tmobile', '18:30', '19:30', 'Geese'],
    ['tmobile', '20:30', '22:00', 'The xx'],
    // ── Miller Lite ───────────────────────────────────────────────────────
    ['millerlite', '14:00', '14:45', 'Joshua Jensen'],
    ['millerlite', '15:30', '16:30', 'Claire Rosinkranz'],
    ['millerlite', '17:30', '18:30', 'Saint Motel'],
    ['millerlite', '19:30', '20:30', 'Parcels'],
    // ── BMI ───────────────────────────────────────────────────────────────
    ['bmi', '12:45', '13:15', 'Marzz'],
    ['bmi', '14:00', '14:45', 'Chelsea Jordan'],
    ['bmi', '15:30', '16:15', 'VWILLZ'],
    ['bmi', '18:00', '18:30', 'Sasha Keable'],
    // ── BeatBox ───────────────────────────────────────────────────────────
    ['beatbox', '14:00', '14:45', 'Kevin Atwater'],
    ['beatbox', '15:30', '16:30', 'Bad Nerves'],
    ['beatbox', '17:30', '18:30', 'Noga Erez'],
    ['beatbox', '18:30', '19:30', 'FCUKERS'],
    ['beatbox', '19:30', '20:30', 'Blood Orange'],
    // ── Tito's ────────────────────────────────────────────────────────────
    ['titos', '12:45', '13:30', 'The Huston-Tillotson University Jazz Collective'],
    ['titos', '14:00', '14:45', 'Paloma Morphy'],
    ['titos', '15:15', '16:00', 'Calder Allen'],
    ['titos', '16:30', '17:30', 'Rio Kosta'],
    // ── Snapchat ──────────────────────────────────────────────────────────
    ['snapchat', '14:00', '14:45', 'Sunday (1994)'],
    ['snapchat', '15:30', '16:30', 'Grace Ives'],
    ['snapchat', '17:30', '18:30', 'Houndmouth'],
    ['snapchat', '19:30', '20:30', 'The War on Drugs'],
    // ── American Express ─────────────────────────────────────────────────
    ['amex', '13:15', '14:00', 'Rum Jungle'],
    ['amex', '14:45', '15:30', 'Ethan Regan'],
    ['amex', '16:30', '17:30', 'Max McNown'],
    ['amex', '18:30', '19:30', 'Sofi Tukker'],
    ['amex', '20:30', '22:00', 'Twenty One Pilots', asl],
  ],
};

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
  // The newest date this file's data was actually verified against a
  // source — the full per-stage, per-time schedule read at aclfestival.com
  // (see header comment), not the 8.17 date baked into the image
  // filenames, which marks when the festival last touched the artwork.
  dataVerifiedOn: '2026-08-26',
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
