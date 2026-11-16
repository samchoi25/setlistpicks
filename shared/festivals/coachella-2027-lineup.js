// Coachella Valley Music and Arts Festival 2027 — shared lineup data.
//
// Coachella runs two weekends with the same bill (Apr 9–11 and Apr 16–18,
// 2027), each with its own ticket and its own crowd, so like ACL it's modeled
// as two separate festivals — coachella-2027-week-1.js and -week-2.js — that
// share this module. The poster prints one lineup per day under "Friday April
// 9 & 16" etc., so both weekends get the same `sets`.
//
// Source: the official lineup poster, read at full resolution on 2026-11-15,
//   https://aegwebprod.blob.core.windows.net/content/coachella-2027/coachella-2027-poster.jpg
// It's an image, so every name was transcribed by eye from zoomed crops, not
// parsed. Billing follows the poster, including its capitalisation choices
// (JISOO, CHRIS STASSY, DOM DOLLA, BABYMONSTER, MUNA, xaviersobased, no na…).
// The poster sets a leading "the" as a small superscript word; those are
// written out as "The" (The Damned, The Hellp, The Womack Sisters, The
// Neighbourhood, The Avalanches, The Mainliners). A small "the"/"de"/"of"
// *inside* a name stays lowercase (Mariah the Scientist, Charlotte de Witte,
// Angine de Poitrine, Gang of Youths, Empire of the Sun). Shared bills keep
// the poster's "x"/"&"/"and" joiners as a single entry.
//
// Judgement calls worth knowing about:
//   - Daddy Yankee is billed alone at the foot of the poster, "IN THE DESERT",
//     under the Sunday block but outside it, with no day of its own. He's
//     placed on Sunday as the nearest reading; move him if Goldenvoice says
//     otherwise.
//   - Madonna's "IN THE DANCE TENT" tag is a venue note, not part of the name.
//   - "The Bunker Debut Of JUSTICE — BLINDED BY THE LIGHTS" along the bottom
//     edge reads as an installation/experience with no day, not a set to vote
//     on, so it's left out.
//
// STAGES AND SET TIMES ARE UNANNOUNCED. Each day is bare-string entries (see
// dayModeOf()/buildUntimedDay() in shared/festival.js), rendering as one
// alphabetical list per day. When the schedule lands, swap them for
// `[stageId, 'HH:MM', 'HH:MM', 'Artist']` per weekend and fill in `stages` —
// set ids are derived from day + position, so votes cast before then won't
// carry across.

export const stages = [];

export const sets = {
  fri: [
    'Dua Lipa',
    'Madonna',
    'Zara Larsson',
    'Steve Lacy',
    'JISOO',
    'Diljit Dosanjh',
    'Peggy Gou',
    'Kehlani',
    'Solid Grooves',
    'Giorgio Moroder',
    'Social Distortion',
    'Pinegrove',
    'Angine de Poitrine',
    'Leon Thomas',
    'Drain Gang',
    'Snow Strippers',
    'Mike D 5D',
    'CHRIS STASSY',
    'Milo J',
    'SG Lewis',
    'Kelela',
    'Franky Rizardo',
    'Fetty Wap',
    'Vintage Culture',
    'The Damned',
    'ATARASHII GAKKO!',
    'Nettspend',
    'American Football',
    'xaviersobased',
    'La Dispute',
    'Haute & Freddy',
    'The Hellp',
    'Disco Dom',
    'MPH',
    'Bella Kay',
    'This Is Lorelei',
    'The Womack Sisters',
    'mary in the junkyard',
    'Close Friends Only',
    'Obskür',
    'Jacob Lusk',
    'LEENALCHI',
    'Bea Miller',
    'Gang of Youths',
    'Love Spells',
    'Rafael',
    'Nirosta Steel',
    'Ragie Ban',
    'Jakob Nowell and THE CASTLE',
    'Eli',
    'Las Petunias',
    'Violet Grohl',
    'Jackie Hollander',
    'Jamback x Marsolo',
  ],
  sat: [
    'Tame Impala',
    'Phoebe Bridgers',
    'Weezer',
    'Tiësto',
    'Martin Garrix',
    'Robyn',
    'Role Model',
    'ADÉLA',
    'Måneskin',
    'Solomun',
    'NCT',
    'Enigma',
    'Underworld',
    'Charlotte de Witte',
    'Leon Bridges',
    'Cloonee',
    'Magdalena Bay',
    "Barry Can't Swim",
    'Boy Harsher',
    'KI/KI',
    'Mariah the Scientist',
    'Bad Gyal',
    'Basement',
    'Brutalismus 3000',
    'Beltran',
    'underscores',
    'SB19',
    'Twin Tribes',
    'Odeal',
    'Bassvictim',
    'Los Pibes Chorros',
    'Tiffany Day',
    'no na',
    'Mathame',
    'ear',
    'Vandelux',
    'rommulas',
    'Apollonia',
    'Getdown Services',
    'Good Neighbours',
    'First Day Back',
    'Jimi Jules',
    'Twisted Teens',
    'Murda Beatz',
    'Villanelle',
    'Kolter x Sidney Charles',
    'La Texana',
    'OMRI.',
    'Volkoder',
    'Zimmer90',
    'LuSiD',
    'Dream Boat',
  ],
  sun: [
    'SZA',
    'Daddy Yankee',
    'Don Toliver',
    'DOM DOLLA',
    'Kygo',
    'Empire of the Sun',
    'Four Tet',
    'The Neighbourhood',
    'Becky G',
    'BABYMONSTER',
    'Amelie Lens x Sara Landry',
    'Remi Wolf',
    'Tove Lo',
    'Victoria Monét',
    'EsDeeKid',
    'Caroline Polachek',
    'Chase & Status',
    'MUNA',
    'Boris Brejcha',
    'Jorja Smith',
    'The Avalanches',
    'BOLO',
    'Pennywise',
    'Freddie Gibbs',
    'Shygirl',
    'Julia Wolf',
    'Odd Mob',
    'Ayra Starr',
    'Lambrini Girls',
    'AKRIILA',
    'Dinner Party',
    'Silva Bumpa',
    'DJ Habibeats',
    'Chanel Beads',
    'Adam Ten',
    'After',
    'Zack Fox',
    'Fat Dog',
    'Omar+',
    'Genesis Owusu',
    'Joshua Slone',
    'The Mainliners',
    'Marten Lou x Alex Wann',
    'ChaseWest',
    'Florence Road',
    'Jazzy',
    'TUL8TE',
    'Talón',
    'Klave Efectiva',
  ],
};

// Shared by both weekends' definitions.
export const common = {
  year: 2027,
  venue: 'Empire Polo Club, Indio, CA',
  place: {
    name: 'Empire Polo Club',
    streetAddress: '81-800 Avenue 51',
    addressLocality: 'Indio',
    addressRegion: 'CA',
    postalCode: '92201',
    addressCountry: 'US',
  },
  // April is PDT.
  utcOffset: '-07:00',
  officialUrl: 'https://www.coachella.com/lineup',
  dataVerifiedOn: '2026-11-15',
  // The three day-top names in the poster's largest type, plus Daddy Yankee's
  // standalone billing at the foot (see header comment).
  headliners: ['Dua Lipa', 'Tame Impala', 'SZA', 'Daddy Yankee'],
  // The second tier: Madonna's dance-tent billing and the big type that opens
  // each day's undercard.
  notableActs: ['Madonna', 'Phoebe Bridgers', 'Weezer', 'Don Toliver', 'Kygo', 'Steve Lacy'],
};
