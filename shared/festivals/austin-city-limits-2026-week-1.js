// Austin City Limits Music Festival 2026, Weekend One (Oct 2–4) —
// festival definition. See austin-city-limits-2026-lineup.js for the
// shared stage list, artist links, and full sourcing/reconciliation notes.
//
// `sets` below is transcribed directly from the official per-day schedule
// images at https://www.aclfestival.com/schedule (six images, one per day
// per weekend — the page itself has no text or API), read at full
// resolution 2026-08-26. Friday and Saturday came from the 8.17 release;
// Sunday from the 8.21 reissue (see the lineup module for exact image URLs).
//
// Every act on the schedule prints a start AND end time except the last set
// on each stage each day, which prints only a start time (no end, and no
// visual cue distinguishing it from a smaller stage simply finishing
// early — confirmed by inspecting the artwork directly). Since a timed set
// requires an end time, those closing sets use 22:00 (10 PM) — the grid's
// own closing boundary and ACL's nightly curfew — as an inferred end, not
// a printed one: Skrillex (T-Mobile), Lorde (T-Mobile, Sat), The xx
// (T-Mobile, Sun), and the American Express headliner every day (Charli
// XCX, RÜFÜS DU SOL, Twenty One Pilots).
//
// The hand-icon legend ("ASL interpreted set") lands on exactly one set per
// day, always the American Express headliner — encoded as `asl` meta.
//
// Silent Disco (Tito's, 8:00–10:00 every day) is a festival activity, not a
// bookable artist, and is intentionally left out.

import { artistLinks, stages } from './austin-city-limits-2026-lineup.js';

const slug = 'austin-city-limits-2026-week-1';

const days = [
  { id: 'fri', name: 'Friday', date: 'Oct 2' },
  { id: 'sat', name: 'Saturday', date: 'Oct 3' },
  { id: 'sun', name: 'Sunday', date: 'Oct 4' },
];

// ASL-interpreted performances (see header comment).
const asl = { asl: true };

// Each set: [stageId, start, end, artist, meta?]
const sets = {
  fri: [
    // ── T-Mobile ──────────────────────────────────────────────────────────
    ['tmobile', '13:00', '13:45', 'Asleep at the Wheel'],
    ['tmobile', '14:30', '15:15', 'New Constellations'],
    ['tmobile', '16:15', '17:15', 'Jesse Welles'],
    ['tmobile', '18:15', '19:15', 'Turnstile'],
    ['tmobile', '20:15', '22:00', 'Skrillex'],
    // ── Miller Lite ───────────────────────────────────────────────────────
    ['millerlite', '13:45', '14:30', 'Faouzia'],
    ['millerlite', '15:15', '16:15', 'Paris Paloma'],
    ['millerlite', '17:15', '18:15', 'Brandon Flowers'],
    ['millerlite', '19:15', '20:15', 'Leon Thomas'],
    // ── BMI ───────────────────────────────────────────────────────────────
    ['bmi', '13:45', '14:30', 'Elle Coves'],
    ['bmi', '15:30', '16:15', 'Izzy Escobar'],
    ['bmi', '17:15', '18:15', 'Grocery Bag'],
    // ── BeatBox ───────────────────────────────────────────────────────────
    ['beatbox', '14:00', '14:45', 'Night Traveler'],
    ['beatbox', '15:30', '16:30', 'Marlon Funaki'],
    ['beatbox', '16:30', '17:30', 'Rebecca Black'],
    ['beatbox', '17:30', '18:30', 'Rusowsky'],
    ['beatbox', '19:30', '20:30', 'Molly Santana'],
    // ── Tito's ────────────────────────────────────────────────────────────
    ['titos', '12:45', '13:30', 'The 4411'],
    ['titos', '14:00', '14:45', 'Solomon Hicks'],
    ['titos', '15:15', '16:00', 'Bo Staloch'],
    ['titos', '18:30', '19:30', 'Steve Aoki'],
    // ── Snapchat ──────────────────────────────────────────────────────────
    ['snapchat', '14:00', '14:45', 'Elijah Delgado'],
    ['snapchat', '15:30', '16:30', 'LP'],
    ['snapchat', '17:30', '18:30', 'BUNT.'],
    ['snapchat', '19:30', '20:30', 'The Chainsmokers'],
    // ── American Express ─────────────────────────────────────────────────
    ['amex', '13:15', '14:00', 'Hunx and His Punx'],
    ['amex', '14:45', '15:30', 'CMAT'],
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
    ['millerlite', '15:15', '16:15', 'Arcy Drive'],
    ['millerlite', '17:15', '18:15', 'Snow Strippers'],
    ['millerlite', '19:15', '20:15', 'Levity'],
    // ── BMI ───────────────────────────────────────────────────────────────
    ['bmi', '12:45', '13:15', 'Fightmaster'],
    ['bmi', '13:45', '14:30', 'Emma Ogier'],
    ['bmi', '15:30', '16:15', 'Coleman Jennings'],
    ['bmi', '17:15', '18:15', 'Fai Laci'],
    // ── BeatBox ───────────────────────────────────────────────────────────
    ['beatbox', '14:00', '14:45', 'Cure for Paranoia'],
    ['beatbox', '15:30', '16:30', 'Ryan Beatty'],
    ['beatbox', '17:30', '18:30', 'Palace'],
    ['beatbox', '19:30', '20:30', 'Fakemink'],
    // ── Tito's ────────────────────────────────────────────────────────────
    ['titos', '12:45', '13:30', 'Left Lucid'],
    ['titos', '14:00', '14:45', 'DJ Cassandra'],
    ['titos', '15:15', '16:00', 'Don West'],
    ['titos', '16:30', '17:30', 'Rodrigo y Gabriela'],
    ['titos', '18:30', '19:30', '¥ØU$UK€ ¥UK1MAT$U'],
    // ── Snapchat ──────────────────────────────────────────────────────────
    ['snapchat', '14:00', '14:45', 'Rochelle Jordan'],
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
    ['tmobile', '13:15', '14:00', 'Solya'],
    ['tmobile', '14:45', '15:30', 'Stella Lefty'],
    ['tmobile', '16:30', '17:30', 'Audrey Hobert'],
    ['tmobile', '18:30', '19:30', 'Geese'],
    ['tmobile', '20:30', '22:00', 'The xx'],
    // ── Miller Lite ───────────────────────────────────────────────────────
    ['millerlite', '14:00', '14:45', 'Jess Williamson'],
    ['millerlite', '15:30', '16:30', 'Claire Rosinkranz'],
    ['millerlite', '17:30', '18:30', 'Saint Motel'],
    ['millerlite', '19:30', '20:30', 'Parcels'],
    // ── BMI ───────────────────────────────────────────────────────────────
    ['bmi', '12:45', '13:15', 'Rubio'],
    ['bmi', '14:00', '14:45', 'Aaron Rowe'],
    ['bmi', '15:30', '16:15', 'Fancy Hagood'],
    ['bmi', '17:30', '18:30', 'Lauren Sanderson'],
    // ── BeatBox ───────────────────────────────────────────────────────────
    ['beatbox', '14:00', '14:45', 'Britton'],
    ['beatbox', '15:30', '16:30', 'Underscores'],
    ['beatbox', '17:30', '18:30', 'Noga Erez'],
    ['beatbox', '18:30', '19:30', 'FCUKERS'],
    ['beatbox', '19:30', '20:30', 'Blood Orange'],
    // ── Tito's ────────────────────────────────────────────────────────────
    ['titos', '12:45', '13:30', 'The Moriah Sisters'],
    ['titos', '14:00', '14:45', 'Paloma Morphy'],
    ['titos', '15:15', '16:00', 'Calder Allen'],
    ['titos', '16:30', '17:30', 'Rio Kosta'],
    // ── Snapchat ──────────────────────────────────────────────────────────
    ['snapchat', '14:00', '14:45', 'Sunday (1994)'],
    ['snapchat', '17:30', '18:30', 'Cannons'],
    ['snapchat', '19:30', '20:30', 'The War on Drugs'],
    // ── American Express ─────────────────────────────────────────────────
    ['amex', '13:15', '14:00', 'Villanelle'],
    ['amex', '14:45', '15:30', 'Dexter and the Moonrocks'],
    ['amex', '16:30', '17:30', 'Max McNown'],
    ['amex', '18:30', '19:30', 'Sofi Tukker'],
    ['amex', '20:30', '22:00', 'Twenty One Pilots', asl],
  ],
};

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
  // The newest date this file's data was actually verified against a
  // source — the full per-stage, per-time schedule read at aclfestival.com
  // (see header comment), not the 8.17/8.21 dates baked into the image
  // filenames, which mark when the festival last touched the artwork.
  dataVerifiedOn: '2026-08-26',
  // The festival's own top-billed tier for each day, per the poster's font
  // hierarchy — Skrillex is this weekend's pick from the Friday co-headline
  // slot (Kings of Leon plays week 2 instead; see austin-city-limits-2026-lineup.js).
  headliners: ['Charli XCX', 'Skrillex', 'RÜFÜS DU SOL', 'Lorde', 'Twenty One Pilots', 'The xx'],
  notableActs: ['Turnstile', 'Lola Young', 'Young Miko', 'Sofi Tukker', 'Geese'],
  stages,
  days,
  sets,
  artistLinks,
  groupNames: [
    'Zilker Park Crew', 'Keep Austin Weird Squad', 'Barton Springs Bunch', 'Lone Star Lineup',
    'BBQ & Beats Crew', 'Live Music Capital Crew', 'Longhorn Lounge', 'Congress Ave Crew',
    'Texas Two-Steppers', 'Weekend One Wolfpack', 'Armadillo Alliance', 'Hill Country Hangout',
  ],
};
