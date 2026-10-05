// Escape Halloween 2026 — festival definition.
//
// Pure data: no schedule is built here. buildFestival() in shared/festival.js
// turns this into placed blocks and grid bounds.
//
// Source: the festival's own lineup page, read on 2026-10-05,
//   https://escapehalloween.com/lineup/
// Its "By Day" and "By Stage" tabs are both server-rendered HTML, one link per
// act carrying a data-artist-name attribute, with B2B pairings as two links
// joined by the literal text " B2B ". Both tabs were parsed out of that markup
// — no transcription — and joined on the billed name to place each stage
// slot on a day. The two tabs agree exactly: every stage slot maps to one day,
// and the only acts counted more than once are the ones the page itself lists
// twice (Acyan and Cat & Maomi play Saturday on both their stage and the
// Beatbox Art Car; Morelia and Pixie Dust each play a solo set and a b2b
// together on Friday).
//
// SET TIMES ARE STILL UNANNOUNCED ("set times are still to come", per the
// page), so each slot is `[stageId, artist]` — stage known, no time — and
// renders as one list per stage column (see buildUntimedDay() in
// shared/festival.js). The page lists each stage alphabetically, so the order
// within a column carries no running-order signal here, unlike a flyer.
//
// Billed names are the page's own, set-type suffixes included ("Frontliner
// (Journey Set)", "JOYRYDE (Sunset Set)"). "VNSSA B2B ????" is a mystery
// partner the page doesn't name, kept as billed.
//
// When set times land: swap each pair for
// `[stageId, 'HH:MM start', 'HH:MM end', artist]` (times past midnight as
// 24:00+, the night runs to 2 AM). Set ids are derived from day + stage +
// position, so ids will shift and earlier votes won't map across.

const slug = 'escape-halloween-2026';

// The seven stages in the page's own order. Escape publishes no stage
// colours, so these are the shared base palette.
const stages = [
  { id: 'bigtop', name: 'The Big Top', short: 'BIG TOP', color: '--dusk-purple' },
  { id: 'sewer', name: 'Sewer District', short: 'SEWER', color: '--jungle-green' },
  { id: 'feeding', name: 'Feeding Grounds', short: 'FEED', color: '--brick-clay' },
  { id: 'cage', name: 'The Cage', short: 'CAGE', color: '--ocean-deep' },
  { id: 'warehouse', name: 'The Warehouse', short: 'WAREHSE', color: '--deep-teal' },
  { id: 'danse', name: 'Danse Macabre', short: 'DANSE', color: '--sunset-coral' },
  { id: 'artcar', name: 'Beatbox Art Car', short: 'ART CAR', color: '--muted-olive' },
];

const days = [
  { id: 'fri', name: 'Friday', date: 'Oct 30' },
  { id: 'sat', name: 'Saturday', date: 'Oct 31' },
];

const sets = {
  fri: [
    ['bigtop', 'Benny Benassi'],
    ['bigtop', 'Cascada'],
    ['bigtop', 'Cloonee'],
    ['bigtop', 'Dimitri Vegas & Like Mike'],
    ['bigtop', 'Discovery Project'],
    ['bigtop', 'KREAM'],
    ['bigtop', 'MORTEN'],
    ['bigtop', 'Nervo'],
    ['bigtop', 'Steve Aoki'],

    ['sewer', 'A Little Sound'],
    ['sewer', 'All The Reason'],
    ['sewer', 'Cyclops'],
    ['sewer', 'Excision'],
    ['sewer', 'Getter'],
    ['sewer', 'HerShe'],
    ['sewer', 'Kai Wachi'],
    ['sewer', 'Level Up'],
    ['sewer', 'MODAL NODES'],
    ['sewer', 'YDG'],

    ['feeding', 'AniMe - No Boundaries'],
    ['feeding', ['Coone', 'DJ Isaac']],
    ['feeding', 'Darren Styles'],
    ['feeding', 'Frontliner (Journey Set)'],
    ['feeding', 'Gammer'],
    ['feeding', 'k?d presents: Kill The Kid'],
    ['feeding', ['Lady Faith', 'LNY TNZ']],
    ['feeding', 'Mish'],
    ['feeding', 'Pixie Dust'],
    ['feeding', 'Showtek (Hardstyle Set)'],

    ['cage', 'Adam Ten'],
    ['cage', 'DJ Tennis'],
    ['cage', ['Jamie Jones', 'Franky Rizardo']],
    ['cage', ['Joseph Capriati', 'Sosa']],
    ['cage', 'Kana Hishiya'],
    ['cage', 'Silvie Loto'],

    ['warehouse', 'Azyr'],
    ['warehouse', 'Cera Khin'],
    ['warehouse', 'Clara Cuvé'],
    ['warehouse', 'Kloud'],
    ['warehouse', 'Morelia'],
    ['warehouse', 'Trancemaster Krause'],
    ['warehouse', 'Trym'],

    ['danse', 'All Rise'],
    ['danse', 'B2'],
    ['danse', 'Comadoses'],
    ['danse', 'Death Simulator'],
    ['danse', 'HIWATER'],
    ['danse', 'HoneyPacq'],
    ['danse', 'Kimmo'],
    ['danse', 'Monic'],
    ['danse', ['RoRoll', 'HUA']],
    ['danse', 'SEUNG'],

    ['artcar', 'Benni Ola'],
    ['artcar', 'Dr. Greco'],
    ['artcar', 'Lady Sinclair'],
    ['artcar', ['Morelia', 'Pixie Dust']],
    ['artcar', 'Mr. Fowler'],
    ['artcar', 'Sabrosura Boyz'],
  ],
  sat: [
    ['bigtop', 'Alok'],
    ['bigtop', 'Disco Lines'],
    ['bigtop', 'Galantis'],
    ['bigtop', 'Ian Asher'],
    ['bigtop', 'JOYRYDE (Sunset Set)'],
    ['bigtop', 'LUMI'],
    ['bigtop', 'Maddix'],
    ['bigtop', 'TELYKAST'],
    ['bigtop', 'Zedd'],

    ['sewer', 'Acyan'],
    ['sewer', 'Adventure Club'],
    ['sewer', 'Bou'],
    ['sewer', 'Dabin'],
    ['sewer', 'Dr. Fresch'],
    ['sewer', 'ero808'],
    ['sewer', 'Jon Casey'],
    ['sewer', 'Know Good'],
    ['sewer', 'Liquid Stranger'],

    ['feeding', 'AC Slater'],
    ['feeding', ['Andruss', 'Juos']],
    ['feeding', 'Cat & Maomi'],
    ['feeding', 'OMNOM'],
    ['feeding', 'PEDROZ'],
    ['feeding', 'Rommii'],
    ['feeding', 'San Pacho'],
    ['feeding', ['VNSSA', '????']],

    ['cage', '999999999'],
    ['cage', 'Funk Assault'],
    ['cage', 'Indira Paganotto'],
    ['cage', 'JSMN'],
    ['cage', 'Nina Kraviz'],
    ['cage', 'Richie Hawtin'],
    ['cage', 'Yanamaste'],

    ['warehouse', ['Alex Chapman', 'Zoe Gitter']],
    ['warehouse', 'Avalon Emerson'],
    ['warehouse', 'Champion'],
    ['warehouse', 'Chrysalis'],
    ['warehouse', 'DJ Heartstring'],
    ['warehouse', 'MALUGI'],
    ['warehouse', 'Sedef Adasï'],

    ['danse', '$coe'],
    ['danse', 'Desa Deca'],
    ['danse', 'Landopolo'],
    ['danse', 'Marie Nyx'],
    ['danse', 'Mark Lizaola'],
    ['danse', 'Nina J'],
    ['danse', 'Richard Vission'],
    ['danse', 'SHAKING'],
    ['danse', 'Spency Be'],
    ['danse', 'TYKNI'],

    ['artcar', 'Acyan'],
    ['artcar', 'Cat & Maomi'],
    ['artcar', 'CRaymak'],
    ['artcar', 'FVLAKO'],
    ['artcar', 'Juos'],
    ['artcar', 'KILLMATTER'],
    ['artcar', 'Sim Ivy'],
  ],
};

const artistLinks = {};

export default {
  slug,
  name: 'Escape Halloween 2026',
  shortName: 'Escape',
  year: 2026,
  venue: 'NOS Events Center, San Bernardino, CA',
  place: {
    name: 'NOS Events Center',
    streetAddress: '689 S E St',
    addressLocality: 'San Bernardino',
    addressRegion: 'CA',
    postalCode: '92408',
    addressCountry: 'US',
  },
  utcOffset: '-07:00',
  dateRange: 'October 30–31, 2026',
  officialUrl: 'https://escapehalloween.com/lineup/',
  dataVerifiedOn: '2026-10-05',
  // Insomniac bills the lineup alphabetically with no tiers, so these are the
  // biggest names on the page, picked for the SEO title; no billing claim.
  headliners: ['Zedd', 'Excision', 'Dimitri Vegas & Like Mike', 'Steve Aoki', 'Galantis', 'Alok'],
  notableActs: [
    'Nina Kraviz', 'Richie Hawtin', 'Avalon Emerson', 'Benny Benassi',
    'Liquid Stranger', 'Adventure Club', 'Showtek (Hardstyle Set)', 'Getter',
  ],
  stages,
  days,
  sets,
  artistLinks,
  groupNames: [
    'Crazy Town Crew', 'Big Top Freaks', 'Sewer Rats', 'Feeding Frenzy',
    'Cage Rattlers', 'Warehouse Wraiths', 'Danse Macabre Troupe', 'Art Car Ghouls',
    'Costume Squad', 'Pumpkin Patch Posse', 'Haunted Headbangers', 'Midnight Monsters',
  ],
};
