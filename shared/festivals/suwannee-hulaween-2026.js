// Suwannee Hulaween 2026 — festival definition.
//
// Pure data: no schedule is built here. buildFestival() in shared/festival.js
// turns this into placed blocks, lanes and grid bounds.
//
// Source: the four per-day set-time grids on the festival's schedule page,
// https://hulaween.com/schedule/ , uploaded 2026-10-02 as
//   https://hulaween.com/wp-content/uploads/2026/10/HL26_{Thurs,Friday,Sat,Sun}.png
// (they supersede the 2026-09-24 "R01" grids in the same media library). The
// page renders them only as images, so these times were read off the artwork
// at full resolution rather than scraped. Every act on the grids was checked
// against the A–Z lineup poster
// (https://hulaween.com/wp-content/uploads/2026/06/HulaLineup_6-23-26.png);
// the poster's spelling wins where the grid abbreviates:
//   - "EOTO & Friends" is the grid's billing for the poster's "EOTO feat. Kyle
//     Hollingsworth & Scott Metzger"; the grid's is kept, being the slot's.
//   - "Big Gramatik" is Big Gigantic b2b Gramatik, as both sources say.
//   - Drama's Sunday slot is "DRAMA [CLUB]" on the grid and "DRAMA (DJ SET)"
//     on the poster; billed here as the grid's club set.
//   - The Ain't Sisters are on the poster but on none of the four grids, so
//     they are left out rather than given an invented slot.
// "Surprise Sets" and Sunday's "Open Aux Contest Winner" are kept: they are
// real slots on the grid, and people plan around a 1 AM surprise set.
//
// Takeovers the grids label but don't name as stages: Of The Trees' "Memory
// Palace" on Friday's Amphitheatre, and Green Velvet's "La La Land" across
// Saturday night's Def: Off Limits.
//
// Format per set: [stageId, 'HH:MM start', 'HH:MM end', 'Artist', meta?]
//
// All times are ET (24h). Late sets run past midnight, so a time of 24:00 or
// later belongs to the small hours *after* the day it is listed under — the
// festival's own convention, and the only way to keep a 1 AM set on the night
// people think of it as part of. Latest end: 27:45 (3:45 AM).

const slug = 'suwannee-hulaween-2026';

// Column order matches the grids, left to right. No stage colours on the
// artwork (each day is one tint), so these are the shared base palette.
const stages = [
  { id: 'meadow', name: 'The Meadow', short: 'MEADOW', color: '--dusk-purple' },
  { id: 'hallows', name: 'The Hallows', short: 'HALLOWS', color: '--brick-clay' },
  { id: 'amphitheatre', name: 'The Amphitheatre', short: 'AMPH', color: '--ocean-deep' },
  { id: 'spiritlake', name: 'Spirit Lake', short: 'LAKE', color: '--deep-teal' },
  { id: 'def', name: 'Def: Off Limits', short: 'DEF', color: '--jungle-green' },
];

const days = [
  { id: 'thu', name: 'Thursday', date: 'Oct 22' },
  { id: 'fri', name: 'Friday', date: 'Oct 23' },
  { id: 'sat', name: 'Saturday', date: 'Oct 24' },
  { id: 'sun', name: 'Sunday', date: 'Oct 25' },
];

// `asl: true` marks the sets the grids flag with the ASL-interpreter icon.
const asl = { asl: true };

const sets = {
  thu: [
    ['meadow', '16:00', '17:00', 'Casey Club'],
    ['meadow', '18:00', '19:00', 'Richard Finger'],
    ['meadow', '20:00', '21:00', 'HAMDI'],
    ['meadow', '22:30', '24:00', 'Excision', asl],

    ['hallows', '15:15', '16:00', 'Costa'],
    ['hallows', '17:00', '18:00', 'Steller'],
    ['hallows', '19:00', '20:00', 'AHEE', asl],
    ['hallows', '21:00', '22:25', 'Crankdat', asl],

    ['amphitheatre', '16:00', '17:00', 'Baalti'],
    ['amphitheatre', '18:00', '19:30', 'Dean Turnley'],
    ['amphitheatre', '20:30', '22:00', 'Riordan'],
    ['amphitheatre', '22:30', '24:00', 'KETTAMA'],

    ['spiritlake', '16:30', '17:30', 'Joy Wagon'],
    ['spiritlake', '18:30', '19:30', 'Minim'],
    ['spiritlake', '20:30', '21:30', 'Supertaste'],
    ['spiritlake', '22:30', '24:00', 'Midnight Generation'],
    ['spiritlake', '25:00', '26:45', 'Magoo'],

    ['def', '17:30', '18:30', 'Karan!'],
    ['def', '19:30', '20:30', 'Gravagerz'],
    ['def', '21:30', '22:30', 'Effy'],
    ['def', '24:00', '25:00', '¥ØU$UK€ ¥UK1MAT$U'],
    ['def', '25:15', '26:45', 'Surprise Sets'],
  ],
  fri: [
    ['meadow', '15:15', '16:15', 'Karina Rykman'],
    ['meadow', '17:15', '18:30', 'The String Cheese Incident'],
    ['meadow', '19:30', '21:00', 'The String Cheese Incident'],
    ['meadow', '22:00', '24:30', 'My Morning Jacket'],

    ['hallows', '16:15', '17:15', 'Caitlin Krisko & The Broadcast'],
    ['hallows', '18:30', '19:30', 'Eggy'],
    ['hallows', '21:00', '22:00', 'Lettuce'],
    ['hallows', '24:30', '26:00', 'STS9'],

    ['amphitheatre', '16:00', '17:00', 'Curra'],
    ['amphitheatre', '17:30', '18:30', 'Saka x Fly'],
    ['amphitheatre', '19:00', '20:00', 'Opiuo'],
    ['amphitheatre', '20:30', '21:45', 'LYNY'],
    ['amphitheatre', '22:15', '23:45', 'Of The Trees', asl],

    ['spiritlake', '15:30', '16:30', 'The Yeah Babys'],
    ['spiritlake', '17:30', '18:30', 'Natalie Brooke'],
    ['spiritlake', '19:30', '20:30', 'Anthill Cinema w/ Jon Ditty'],
    ['spiritlake', '21:30', '22:30', 'Guavatron'],
    ['spiritlake', '23:30', '24:30', 'EOTO & Friends'],
    ['spiritlake', '26:15', '27:45', 'LaMP'],

    ['def', '16:30', '17:30', 'Rudashi'],
    ['def', '18:30', '19:30', 'AK Sports'],
    ['def', '20:30', '21:30', 'HHunter'],
    ['def', '22:30', '23:30', 'Frost Children (DJ Set)'],
    ['def', '24:30', '27:00', 'Surprise Sets'],
  ],
  sat: [
    ['meadow', '15:45', '16:45', 'Sneezy'],
    ['meadow', '17:45', '19:00', 'The String Cheese Incident'],
    ['meadow', '20:15', '21:45', 'The Warren Haynes Incident'],
    ['meadow', '23:00', '26:00', 'Pretty Lights', asl],

    ['hallows', '15:15', '15:45', 'Motifv'],
    ['hallows', '16:45', '17:45', 'Heyz'],
    ['hallows', '19:00', '20:15', 'Daily Bread', asl],
    ['hallows', '21:45', '23:00', 'Levity', asl],

    ['amphitheatre', '16:00', '17:15', 'Jerro'],
    ['amphitheatre', '17:30', '18:45', 'Gudfella'],
    ['amphitheatre', '19:30', '21:00', 'Kasablanca'],
    ['amphitheatre', '21:30', '23:15', 'Ben Böhmer (Live)'],

    ['spiritlake', '15:30', '16:30', 'Tire Fire'],
    ['spiritlake', '17:00', '18:00', 'Jon Stickley Trio'],
    ['spiritlake', '18:30', '19:30', 'Asydequest'],
    ['spiritlake', '20:15', '21:15', 'Willis'],
    ['spiritlake', '22:00', '23:30', 'Dope Lemon'],
    ['spiritlake', '26:15', '27:45', 'Mountain Grass Unit'],

    ['def', '20:00', '21:00', 'Close Friends Only'],
    ['def', '21:00', '22:00', 'Tini Gessler'],
    ['def', '22:00', '23:00', 'Jackie Hollander'],
    ['def', '23:00', '25:00', 'Green Velvet'],
    ['def', '25:00', '26:00', 'Green Velvet B3B & Surprise Sets'],
  ],
  sun: [
    ['meadow', '13:00', '14:00', "Taper's Choice"],
    ['meadow', '15:00', '17:00', 'The String Cheese Incident'],
    ['meadow', '18:30', '20:00', 'Geese'],

    ['hallows', '12:15', '13:00', 'Playlunch'],
    ['hallows', '14:00', '15:00', 'Guerilla Toss'],
    ['hallows', '17:00', '18:30', 'Unknown Mortal Orchestra'],

    ['amphitheatre', '13:15', '14:15', 'Hershe'],
    ['amphitheatre', '14:30', '15:30', 'A Hundred Drums'],
    ['amphitheatre', '15:45', '16:45', "Maddy O'Neal"],
    ['amphitheatre', '17:00', '18:00', 'Manic Focus', asl],
    ['amphitheatre', '18:30', '20:00', 'Big Gramatik (Big Gigantic b2b Gramatik)'],

    ['spiritlake', '13:00', '14:00', 'Moonstone Riders'],
    ['spiritlake', '15:00', '16:00', 'True Loves'],
    ['spiritlake', '17:00', '18:00', 'Lewis OfMan'],
    ['spiritlake', '19:00', '20:00', 'Drama (Club Set)'],
    ['spiritlake', '21:30', '23:30', 'The Greyboy Allstars'],

    ['def', '14:00', '15:00', 'Open Aux Contest Winner'],
    ['def', '16:00', '17:00', 'INVT'],
    ['def', '18:00', '19:00', 'Daniel Allan'],
    ['def', '20:00', '21:15', 'Salute'],
    ['def', '22:15', '23:30', 'Surprise Sets'],
  ],
};

const artistLinks = {};

export default {
  slug,
  name: 'Suwannee Hulaween 2026',
  shortName: 'Hulaween',
  year: 2026,
  venue: 'Spirit of the Suwannee Music Park, Live Oak, FL',
  place: {
    name: 'Spirit of the Suwannee Music Park',
    streetAddress: '3076 95th Dr',
    addressLocality: 'Live Oak',
    addressRegion: 'FL',
    postalCode: '32060',
    addressCountry: 'US',
  },
  utcOffset: '-04:00',
  dateRange: 'October 22–25, 2026',
  officialUrl: 'https://hulaween.com/schedule/',
  dataVerifiedOn: '2026-10-05',
  // The poster's top line, one headliner per day.
  headliners: ['Excision', 'My Morning Jacket', 'Pretty Lights', 'Geese'],
  notableActs: [
    'The String Cheese Incident', 'The Warren Haynes Incident',
    'Unknown Mortal Orchestra', 'Green Velvet', 'STS9', 'Levity',
    'Ben Böhmer (Live)', 'Lettuce',
  ],
  stages,
  days,
  sets,
  artistLinks,
  groupNames: [
    'Spirit Lake Swimmers', 'Suwannee Spooks', 'Hula Hoopers', 'Meadow Moonwalkers',
    'Hallows Haunters', 'Live Oak Lurkers', 'Spanish Moss Posse', 'Cheese Heads',
    'Amphitheatre Apparitions', 'Costume Crew', 'Riverbank Revelers', 'Night Owl Squad',
  ],
};
