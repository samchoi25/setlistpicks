// Escape Halloween 2026 — festival definition.
//
// Pure data: no schedule is built here. buildFestival() in shared/festival.js
// turns this into placed blocks, lanes and grid bounds.
//
// Source: the festival's own set-times pages, read on 2026-10-27,
//   https://escapehalloween.com/lineup/set-times/day-1/   (Friday)
//   https://escapehalloween.com/lineup/set-times/day-2/   (Saturday)
// Both are server-rendered HTML. Each slot is an <a class="set-block"> whose
// text node carries the billed name and a
// `<span data-timestamp-start=… data-timestamp-end=…>`, so these times were
// parsed out of the markup rather than transcribed.
//
// Two traps in that markup, in case it needs re-reading:
//   - The timestamps are venue-local wall clock stored as if they were UTC —
//     the grid header renders 1793376000 as "04:00 PM", and that value is
//     16:00 UTC. Read them in UTC and treat the result as local time.
//   - Every set appears TWICE: once in the "By Stage" lists and again in the
//     "Full Schedule" grid below them. Only the markup before
//     `.schedule__scrollable` is counted, or every set is doubled.
//
// Both nights run 4 PM to 2 AM, so the after-midnight sets are written as
// 24:00+ (25:30 is 1:30 AM) to keep them on the evening they belong to — see
// toMin() in shared/festival.js.
//
// B2B billings are stored as an array of their members, as they were when
// this file was untimed. "MALUGI presents Matteo & Friends B2B" is the page's
// own billing, trailing "B2B" and all, with no second act named — it stays a
// single name.
//
// Changes since the 2026-10-05 lineup reading: Friday's Discovery Project
// slot is now billed as Solitaire; Saturday adds Ja Rule, Too $hort, Girl
// Math and MALUGI presents Matteo & Friends B2B; and "VNSSA B2B ????" is off
// the bill entirely (its artistLinks entry went with it).
//
// Format per set: [stageId, 'HH:MM start', 'HH:MM end', 'Artist' | [names]]
// All times are PT (24h, past 24 after midnight).
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
    // ── The Big Top ───────────────────────────────────────────
    ['bigtop', '16:00', '17:15', 'Solitaire'],
    ['bigtop', '17:15', '18:30', 'Nervo'],
    ['bigtop', '18:30', '19:00', 'Cascada'],
    ['bigtop', '19:00', '20:00', 'MORTEN'],
    ['bigtop', '20:00', '21:00', 'KREAM'],
    ['bigtop', '21:00', '22:15', 'Benny Benassi'],
    ['bigtop', '22:15', '23:30', 'Dimitri Vegas & Like Mike'],
    ['bigtop', '23:30', '24:40', 'Steve Aoki'],
    ['bigtop', '24:45', '26:00', 'Cloonee'],

    // ── Sewer District ────────────────────────────────────────
    ['sewer', '16:00', '16:45', 'All The Reason'],
    ['sewer', '16:45', '17:45', 'MODAL NODES'],
    ['sewer', '17:45', '18:45', 'HerShe'],
    ['sewer', '18:45', '19:45', 'A Little Sound'],
    ['sewer', '19:45', '20:45', 'Cyclops'],
    ['sewer', '20:45', '21:45', 'Getter'],
    ['sewer', '21:45', '22:45', 'YDG'],
    ['sewer', '22:50', '23:50', 'Level Up'],
    ['sewer', '23:55', '24:55', 'Kai Wachi'],
    ['sewer', '25:00', '26:00', 'Excision'],

    // ── Feeding Grounds ───────────────────────────────────────
    ['feeding', '16:00', '17:00', 'Pixie Dust'],
    ['feeding', '17:00', '18:00', 'k?d presents: Kill The Kid'],
    ['feeding', '18:00', '19:00', 'Mish'],
    ['feeding', '19:00', '20:00', 'Gammer'],
    ['feeding', '20:00', '21:00', 'Frontliner (Journey Set)'],
    ['feeding', '21:00', '22:00', 'AniMe - No Boundaries'],
    ['feeding', '22:00', '23:00', 'Showtek (Hardstyle Set)'],
    ['feeding', '23:00', '24:00', 'Darren Styles'],
    ['feeding', '24:00', '25:00', ['Coone', 'DJ Isaac']],
    ['feeding', '25:00', '26:00', ['Lady Faith', 'LNY TNZ']],

    // ── The Cage ──────────────────────────────────────────────
    ['cage', '16:00', '17:30', 'Kana Hishiya'],
    ['cage', '17:30', '19:00', 'Silvie Loto'],
    ['cage', '19:00', '20:30', 'DJ Tennis'],
    ['cage', '20:30', '22:00', 'Adam Ten'],
    ['cage', '22:00', '24:00', ['Joseph Capriati', 'Sosa']],
    ['cage', '24:00', '26:00', ['Jamie Jones', 'Franky Rizardo']],

    // ── The Warehouse ─────────────────────────────────────────
    ['warehouse', '16:00', '17:00', 'Morelia'],
    ['warehouse', '17:00', '18:25', 'Trancemaster Krause'],
    ['warehouse', '18:25', '19:50', 'Kloud'],
    ['warehouse', '19:50', '21:15', 'Cera Khin'],
    ['warehouse', '21:15', '22:40', 'Azyr'],
    ['warehouse', '22:40', '24:10', 'Clara Cuvé'],
    ['warehouse', '24:10', '26:00', 'Trym'],

    // ── Danse Macabre ─────────────────────────────────────────
    ['danse', '16:00', '17:00', 'HIWATER'],
    ['danse', '17:00', '18:00', 'Kimmo'],
    ['danse', '18:00', '19:00', 'Monic'],
    ['danse', '19:00', '20:00', 'All Rise'],
    ['danse', '20:00', '21:00', ['RoRoll', 'HUA']],
    ['danse', '21:00', '22:00', 'SEUNG'],
    ['danse', '22:00', '23:00', 'HoneyPacq'],
    ['danse', '23:00', '24:00', 'B2'],
    ['danse', '24:00', '25:00', 'Death Simulator'],
    ['danse', '25:00', '26:00', 'Comadoses'],

    // ── Beatbox Art Car ───────────────────────────────────────
    ['artcar', '16:00', '17:30', 'Mr. Fowler'],
    ['artcar', '17:30', '19:00', 'Lady Sinclair'],
    ['artcar', '19:00', '20:30', 'Benni Ola'],
    ['artcar', '20:30', '22:00', 'Sabrosura Boyz'],
    ['artcar', '22:00', '24:00', 'Dr. Greco'],
    ['artcar', '24:00', '26:00', ['Morelia', 'Pixie Dust']],
  ],

  sat: [
    // ── The Big Top ───────────────────────────────────────────
    ['bigtop', '16:00', '17:00', 'LUMI'],
    ['bigtop', '17:00', '18:00', 'TELYKAST'],
    ['bigtop', '18:00', '19:00', 'JOYRYDE (Sunset Set)'],
    ['bigtop', '19:00', '20:00', 'Ian Asher'],
    ['bigtop', '20:00', '21:00', 'Maddix'],
    ['bigtop', '21:00', '22:10', 'Alok'],
    ['bigtop', '22:15', '23:25', 'Galantis'],
    ['bigtop', '23:25', '24:40', 'Disco Lines'],
    ['bigtop', '24:45', '26:00', 'Zedd'],

    // ── Sewer District ────────────────────────────────────────
    ['sewer', '16:00', '16:40', 'Acyan'],
    ['sewer', '16:40', '17:40', 'ero808'],
    ['sewer', '17:40', '18:40', 'Jon Casey'],
    ['sewer', '18:40', '19:40', 'Know Good'],
    ['sewer', '19:40', '20:40', 'Bou'],
    ['sewer', '20:40', '21:40', 'Dr. Fresch'],
    ['sewer', '21:40', '22:40', 'Adventure Club'],
    ['sewer', '22:45', '23:45', 'Liquid Stranger'],
    ['sewer', '23:45', '24:15', 'Too $hort'],
    ['sewer', '24:15', '24:45', 'Ja Rule'],
    ['sewer', '24:50', '26:00', 'Dabin'],

    // ── Feeding Grounds ───────────────────────────────────────
    ['feeding', '16:00', '17:00', 'Cat & Maomi'],
    ['feeding', '17:00', '18:00', 'PEDROZ'],
    ['feeding', '18:00', '19:00', 'Rommii'],
    ['feeding', '19:00', '20:15', ['Andruss', 'Juos']],
    ['feeding', '20:15', '21:30', 'Girl Math'],
    ['feeding', '21:30', '23:00', 'AC Slater'],
    ['feeding', '23:00', '24:30', 'San Pacho'],
    ['feeding', '24:30', '26:00', 'OMNOM'],

    // ── The Cage ──────────────────────────────────────────────
    ['cage', '16:00', '17:15', 'JSMN'],
    ['cage', '17:15', '18:30', 'Yanamaste'],
    ['cage', '18:30', '20:00', 'Funk Assault'],
    ['cage', '20:00', '21:30', 'Richie Hawtin'],
    ['cage', '21:30', '23:00', 'Nina Kraviz'],
    ['cage', '23:00', '24:30', 'Indira Paganotto'],
    ['cage', '24:30', '26:00', '999999999'],

    // ── The Warehouse ─────────────────────────────────────────
    ['warehouse', '16:00', '17:15', 'Chrysalis'],
    ['warehouse', '17:15', '18:45', ['Alex Chapman', 'Zoe Gitter']],
    ['warehouse', '18:45', '20:00', 'Sedef Adasï'],
    ['warehouse', '20:00', '21:10', 'Champion'],
    ['warehouse', '21:10', '22:20', 'Avalon Emerson'],
    ['warehouse', '22:20', '23:30', 'DJ Heartstring'],
    ['warehouse', '23:30', '24:40', 'MALUGI'],
    ['warehouse', '24:40', '25:40', 'MALUGI presents Matteo & Friends B2B'],

    // ── Danse Macabre ─────────────────────────────────────────
    ['danse', '16:00', '17:00', 'Landopolo'],
    ['danse', '17:00', '18:00', '$coe'],
    ['danse', '18:00', '19:00', 'Desa Deca'],
    ['danse', '19:00', '20:00', 'Nina J'],
    ['danse', '20:00', '21:00', 'Spency Be'],
    ['danse', '21:00', '22:00', 'Mark Lizaola'],
    ['danse', '22:00', '23:00', 'Richard Vission'],
    ['danse', '23:00', '24:00', 'SHAKING'],
    ['danse', '24:00', '25:00', 'Marie Nyx'],
    ['danse', '25:00', '26:00', 'TYKNI'],

    // ── Beatbox Art Car ───────────────────────────────────────
    ['artcar', '16:00', '17:00', 'KILLMATTER'],
    ['artcar', '17:00', '18:30', 'CRaymak'],
    ['artcar', '18:30', '20:00', 'Acyan'],
    ['artcar', '20:00', '21:30', 'Sim Ivy'],
    ['artcar', '21:30', '23:00', 'Cat & Maomi'],
    ['artcar', '23:00', '24:30', 'FVLAKO'],
    ['artcar', '24:30', '26:00', 'Juos'],
  ],

};

// Spotify / Apple Music / SoundCloud links, shown on long-press (see
// ArtistPopup.jsx). Sourced 2026-10-05 the same way as artist-links.js:
// Wikidata (P1902 / P2850 / P3040) and MusicBrainz url-rels, matched on the
// billed name, with Apple Music filled from the public iTunes Search API only
// where exactly one artist carries the exact name. Every URL was then resolved
// (Spotify and SoundCloud oEmbed, iTunes lookup) and kept only if the service's
// own name for it matches the billing. Where a name matched more than one
// artist, the one whose description fits this bill's genre was picked by hand;
// iTunes-only matches in an implausible genre (a "Comedy" or "Country" artist
// for a DJ slot) were dropped rather than trusted. Acts whose links already
// exist on another festival reuse those exact URLs.
//
// Set-type suffixes ("(Live)", "(DJ Set)" ...) are looked up without the
// suffix, and a billed collaboration gets its lead act's page:
//   k?d presents: Kill The Kid               → k?d
//   AniMe - No Boundaries                    → AniMe
// B2B slots are already split into their members, so each gets its own.
//
// Left blank — no page that unambiguously matches the billing: All Rise,
// Champion, Chrysalis, Death Simulator, Discovery Project, HIWATER, HUA,
// MODAL NODES, Nina J, Sosa (the only Sosa with a page is Chief Keef), TYKNI,
// and Kimmo, LUMI, Desa Deca, Dr. Greco, Mr. Fowler, whose only same-named
// pages belong to artists from other genres. "????" is the unnamed partner.
const artistLinks = {
  '$coe': { appleMusic: 'https://music.apple.com/us/artist/1497412713' },
  '999999999': { spotify: 'https://open.spotify.com/artist/6uD2LjPHUjxrpax0se17Nc', appleMusic: 'https://music.apple.com/us/artist/815253458', soundcloud: 'https://soundcloud.com/999999999music' },
  'A Little Sound': { spotify: 'https://open.spotify.com/artist/1Jv2F8VFJsSr2XKte0vpbQ', appleMusic: 'https://music.apple.com/us/artist/1456662331', soundcloud: 'https://soundcloud.com/alittlesounduk' },
  'AC Slater': { spotify: 'https://open.spotify.com/artist/6EqFMCnVGBRNmwPlk2f3Uc', appleMusic: 'https://music.apple.com/us/artist/253002292', soundcloud: 'https://soundcloud.com/acslater' },
  'Acyan': { spotify: 'https://open.spotify.com/artist/0o70ZPcBroPuIcUOOLWDI4', soundcloud: 'https://soundcloud.com/acyanmusic' },
  'Adam Ten': { spotify: 'https://open.spotify.com/artist/05tmGPn4fFdVpnsMt0YW5S', appleMusic: 'https://music.apple.com/us/artist/1472226854', soundcloud: 'https://soundcloud.com/adamten' },
  'Adventure Club': { spotify: 'https://open.spotify.com/artist/5CdJjUi9f0cVgo9nFuJrFa', appleMusic: 'https://music.apple.com/us/artist/253082649', soundcloud: 'https://soundcloud.com/adventureclub' },
  'Alex Chapman': { spotify: 'https://open.spotify.com/artist/3c8wfedCs5BJGHcFyusyeh', appleMusic: 'https://music.apple.com/us/artist/1263293139' },
  'All The Reason': { spotify: 'https://open.spotify.com/artist/1nCt3P7EARI6t7YvqCkQ1l', appleMusic: 'https://music.apple.com/us/artist/1776730366' },
  'Alok': { spotify: 'https://open.spotify.com/artist/0NGAZxHanS9e0iNHpR8f2W', appleMusic: 'https://music.apple.com/us/artist/324709167', soundcloud: 'https://soundcloud.com/livealok' },
  'Andruss': { spotify: 'https://open.spotify.com/artist/6HZwb7Zbnvfo8u1sst4QrI', appleMusic: 'https://music.apple.com/us/artist/419316262', soundcloud: 'https://soundcloud.com/andrussmusic' },
  'AniMe - No Boundaries': { spotify: 'https://open.spotify.com/artist/6lnEWBl7dhcA1FL5yqRHPO', appleMusic: 'https://music.apple.com/us/artist/19481227', soundcloud: 'https://soundcloud.com/djanimeofficial' },
  'Avalon Emerson': { spotify: 'https://open.spotify.com/artist/4yrO1N273PlTaixa4BNwBz', appleMusic: 'https://music.apple.com/us/artist/545759821', soundcloud: 'https://soundcloud.com/avalonemerson' },
  'Azyr': { spotify: 'https://open.spotify.com/artist/1Ujj9Jh1Z4tDJ4j6qGRml8', appleMusic: 'https://music.apple.com/us/artist/1554917375', soundcloud: 'https://soundcloud.com/azy_r' },
  'B2': { spotify: 'https://open.spotify.com/artist/0vpOUJDr3cALJ5AiRFdv2S', appleMusic: 'https://music.apple.com/us/artist/1266014990', soundcloud: 'https://soundcloud.com/michibitou' },
  'Benni Ola': { spotify: 'https://open.spotify.com/artist/4q90901wzb3GPqUBKuhoRg', appleMusic: 'https://music.apple.com/us/artist/1473131177' },
  'Benny Benassi': { spotify: 'https://open.spotify.com/artist/4Ws2otunReOa6BbwxxpCt6', appleMusic: 'https://music.apple.com/us/artist/15654100', soundcloud: 'https://soundcloud.com/benny-benassi' },
  'Bou': { spotify: 'https://open.spotify.com/artist/35dxfY1wywqVRUEaVuMm13', soundcloud: 'https://soundcloud.com/boudnb' },
  'Cascada': { spotify: 'https://open.spotify.com/artist/0N0d3kjwdY2h7UVuTdJGfp', appleMusic: 'https://music.apple.com/us/artist/27456059' },
  'Cat & Maomi': { spotify: 'https://open.spotify.com/artist/0skgaSOGaXQwG6skmoLogp', appleMusic: 'https://music.apple.com/us/artist/1677449104' },
  'Cera Khin': { soundcloud: 'https://soundcloud.com/cera-khin' },
  'Clara Cuvé': { appleMusic: 'https://music.apple.com/us/artist/1515739363', soundcloud: 'https://soundcloud.com/claracuve' },
  'Cloonee': { spotify: 'https://open.spotify.com/artist/7MdlXmq2HViAJWo9cf30sR', appleMusic: 'https://music.apple.com/us/artist/946851486', soundcloud: 'https://soundcloud.com/cloonee' },
  'Comadoses': { appleMusic: 'https://music.apple.com/us/artist/1670127094' },
  'Coone': { spotify: 'https://open.spotify.com/artist/1Wt63OMKtv6v2ivHuQLm2C', appleMusic: 'https://music.apple.com/us/artist/218861949', soundcloud: 'https://soundcloud.com/coone' },
  'CRaymak': { spotify: 'https://open.spotify.com/artist/150jtRwN0MU5qRxkhKnzNm', appleMusic: 'https://music.apple.com/us/artist/576826322', soundcloud: 'https://soundcloud.com/craymakmusic' },
  'Cyclops': { spotify: 'https://open.spotify.com/artist/1vOTVnnyLvVTeuwrZLghCN', appleMusic: 'https://music.apple.com/us/artist/198189262', soundcloud: 'https://soundcloud.com/officialcyclops' },
  'Dabin': { spotify: 'https://open.spotify.com/artist/7lZauDnRoAC3kmaYae2opv', appleMusic: 'https://music.apple.com/us/artist/489858182', soundcloud: 'https://soundcloud.com/dabinlee' },
  'Darren Styles': { spotify: 'https://open.spotify.com/artist/2gZzTzeACSwFqkMroVxmnm', appleMusic: 'https://music.apple.com/us/artist/103997555', soundcloud: 'https://soundcloud.com/darren-styles' },
  'Dimitri Vegas & Like Mike': { spotify: 'https://open.spotify.com/artist/73jBynjsVtofjRpdpRAJGk', appleMusic: 'https://music.apple.com/us/artist/1485761558', soundcloud: 'https://soundcloud.com/dimitrivegasandlikemike' },
  'Disco Lines': { spotify: 'https://open.spotify.com/artist/5Kmr0b3ip8g9P2i0dLTC3Z', appleMusic: 'https://music.apple.com/us/artist/1462793893', soundcloud: 'https://soundcloud.com/discolines' },
  'DJ Heartstring': { spotify: 'https://open.spotify.com/artist/5tcwaJBUyEdxQxvieuQxU7', appleMusic: 'https://music.apple.com/us/artist/1576224704', soundcloud: 'https://soundcloud.com/djheartstring' },
  'DJ Isaac': { spotify: 'https://open.spotify.com/artist/2FmgW6Jee0JQKtb6EnBWCq', appleMusic: 'https://music.apple.com/us/artist/1479224267', soundcloud: 'https://soundcloud.com/dj_isaac' },
  'DJ Tennis': { spotify: 'https://open.spotify.com/artist/6vJvFV1A2CpT8s5B1oUN6t', appleMusic: 'https://music.apple.com/us/artist/547866910', soundcloud: 'https://soundcloud.com/djtennisdjtennis' },
  'Dr. Fresch': { spotify: 'https://open.spotify.com/artist/1htHgbGwgCWJBfGiQwcRqC', appleMusic: 'https://music.apple.com/us/artist/514066709', soundcloud: 'https://soundcloud.com/drfresch' },
  'ero808': { spotify: 'https://open.spotify.com/artist/6x9CKUBQ96VjXxKgGE5hIw', soundcloud: 'https://soundcloud.com/ero808' },
  'Excision': { spotify: 'https://open.spotify.com/artist/5FKchcZpQOkqFvXBj1aCvb', appleMusic: 'https://music.apple.com/us/artist/287726822', soundcloud: 'https://soundcloud.com/excision' },
  'Franky Rizardo': { spotify: 'https://open.spotify.com/artist/2UgphhGSlC9QWgaZWUOCkl', appleMusic: 'https://music.apple.com/us/artist/212264439' },
  'Frontliner (Journey Set)': { spotify: 'https://open.spotify.com/artist/7momuad2Twkv5O7MY3dODa', appleMusic: 'https://music.apple.com/us/artist/282296872', soundcloud: 'https://soundcloud.com/frontliner' },
  'Funk Assault': { spotify: 'https://open.spotify.com/artist/4co7BBd7t3IVJRceTLfe4I', appleMusic: 'https://music.apple.com/us/artist/776655766' },
  'FVLAKO': { appleMusic: 'https://music.apple.com/us/artist/1797012298' },
  'Galantis': { spotify: 'https://open.spotify.com/artist/4sTQVOfp9vEMCemLw50sbu', appleMusic: 'https://music.apple.com/us/artist/543322169', soundcloud: 'https://soundcloud.com/wearegalantis' },
  'Gammer': { spotify: 'https://open.spotify.com/artist/5nd7jnne7zbsV2J5jBKNOY', appleMusic: 'https://music.apple.com/us/artist/130055286', soundcloud: 'https://soundcloud.com/djgammer' },
  'Getter': { spotify: 'https://open.spotify.com/artist/3QryVD03gGZOLQQXjy3EoA', appleMusic: 'https://music.apple.com/us/artist/419185194', soundcloud: 'https://soundcloud.com/getterofficial' },
  'HerShe': { spotify: 'https://open.spotify.com/artist/572W2DIMj2JYViwkIpae6J' },
  'HoneyPacq': { appleMusic: 'https://music.apple.com/us/artist/1852131852' },
  'Ian Asher': { spotify: 'https://open.spotify.com/artist/5IrxhrMyvZxzgPYrC9j2km', appleMusic: 'https://music.apple.com/us/artist/1532049830' },
  'Indira Paganotto': { spotify: 'https://open.spotify.com/artist/0JXc5G7ZImFTwPg3y8MTfR', appleMusic: 'https://music.apple.com/us/artist/501964677', soundcloud: 'https://soundcloud.com/indirapaganotto' },
  'Jamie Jones': { spotify: 'https://open.spotify.com/artist/4admDxmnri5Zco0xYrJ0ji', appleMusic: 'https://music.apple.com/us/artist/16013761', soundcloud: 'https://soundcloud.com/jamie-jones' },
  'Jon Casey': { spotify: 'https://open.spotify.com/artist/5ttBnysifryX99bjzeFPGr', appleMusic: 'https://music.apple.com/us/artist/477268278', soundcloud: 'https://soundcloud.com/joncasey' },
  'Joseph Capriati': { spotify: 'https://open.spotify.com/artist/7onsqSWPufMm5ZnUCECDpf', appleMusic: 'https://music.apple.com/us/artist/258951272', soundcloud: 'https://soundcloud.com/joseph-capriati' },
  'JOYRYDE (Sunset Set)': { spotify: 'https://open.spotify.com/artist/24neLwyYRyj4ItaGnFeIT0' },
  'JSMN': { spotify: 'https://open.spotify.com/artist/4W4uI07ZwN2wbMGD1yvOZN' },
  'Juos': { spotify: 'https://open.spotify.com/artist/25b30wypcCBgPGWG28RUcl', appleMusic: 'https://music.apple.com/us/artist/1554922274', soundcloud: 'https://soundcloud.com/juosmusic' },
  'k?d presents: Kill The Kid': { spotify: 'https://open.spotify.com/artist/714O3xvBNiclo82vxBn8Bf', appleMusic: 'https://music.apple.com/us/artist/1141553506', soundcloud: 'https://soundcloud.com/whoskid' },
  'Kai Wachi': { spotify: 'https://open.spotify.com/artist/2fNr4ldujwq97v1jWeqs8K', appleMusic: 'https://music.apple.com/us/artist/533509509', soundcloud: 'https://soundcloud.com/kaiwachi' },
  'Kana Hishiya': { appleMusic: 'https://music.apple.com/us/artist/1593304207' },
  'KILLMATTER': { spotify: 'https://open.spotify.com/artist/7xG6JYqkApsbZBCeKs7cJ5', appleMusic: 'https://music.apple.com/us/artist/1619363468', soundcloud: 'https://soundcloud.com/killmatter' },
  'Kloud': { spotify: 'https://open.spotify.com/artist/24Hb4GKFYquK73R8mTyInu', appleMusic: 'https://music.apple.com/us/artist/1351315768', soundcloud: 'https://soundcloud.com/wearekloud' },
  'Know Good': { spotify: 'https://open.spotify.com/artist/4iogDJBJ2BO2jl8OkPrfpx', appleMusic: 'https://music.apple.com/us/artist/1507153145', soundcloud: 'https://soundcloud.com/weareknowgood' },
  'KREAM': { spotify: 'https://open.spotify.com/artist/0DdDnziut7wOo6cAYWVZC5', appleMusic: 'https://music.apple.com/us/artist/1082901629', soundcloud: 'https://soundcloud.com/kreamofficial' },
  'Lady Faith': { spotify: 'https://open.spotify.com/artist/1va2Hj3SvWvu3L6jAN6k01', soundcloud: 'https://soundcloud.com/dj-lady-faith' },
  'Lady Sinclair': { appleMusic: 'https://music.apple.com/us/artist/1688705883' },
  'Landopolo': { appleMusic: 'https://music.apple.com/us/artist/1577140659' },
  'Level Up': { spotify: 'https://open.spotify.com/artist/1ZpDxqXS6HAvoZyCzQfKRb', soundcloud: 'https://soundcloud.com/levelup999' },
  'Liquid Stranger': { spotify: 'https://open.spotify.com/artist/4YJsSCuag8W1TFTgSeEc2k', appleMusic: 'https://music.apple.com/us/artist/69003009', soundcloud: 'https://soundcloud.com/liquid-stranger' },
  'LNY TNZ': { spotify: 'https://open.spotify.com/artist/1x0ScxgiyFRQDKT4VwcLHa', appleMusic: 'https://music.apple.com/us/artist/311369864', soundcloud: 'https://soundcloud.com/lnytnz' },
  'Maddix': { spotify: 'https://open.spotify.com/artist/0RMeG9M8QFzss9bAbq99KA', appleMusic: 'https://music.apple.com/us/artist/268115002', soundcloud: 'https://soundcloud.com/maddixmusic' },
  'MALUGI': { spotify: 'https://open.spotify.com/artist/50udUOTR7dQUgyPwPuCLM6', appleMusic: 'https://music.apple.com/us/artist/1522328955', soundcloud: 'https://soundcloud.com/malugienergy' },
  'Marie Nyx': { appleMusic: 'https://music.apple.com/us/artist/1556544921' },
  'Mark Lizaola': { appleMusic: 'https://music.apple.com/us/artist/1188522249' },
  'Mish': { spotify: 'https://open.spotify.com/artist/65kwwmTEJIlKRldGhmUM0b' },
  'Monic': { spotify: 'https://open.spotify.com/artist/2dGAYuA2ivFR4BDhbQSIXv' },
  'Morelia': { spotify: 'https://open.spotify.com/artist/5IYl99kFybVzejVo5MyoRS', soundcloud: 'https://soundcloud.com/morelia' },
  'MORTEN': { spotify: 'https://open.spotify.com/artist/19HFRWmRCl27kTk6LeqAO8' },
  'Nervo': { spotify: 'https://open.spotify.com/artist/4j5KBTO4tk7up54ZirNGvK', appleMusic: 'https://music.apple.com/us/artist/315216021', soundcloud: 'https://soundcloud.com/nervomusic' },
  'Nina Kraviz': { spotify: 'https://open.spotify.com/artist/1oZmFNkGAT93yD1xX4vTRE', appleMusic: 'https://music.apple.com/us/artist/277068027', soundcloud: 'https://soundcloud.com/nina-kraviz' },
  'OMNOM': { spotify: 'https://open.spotify.com/artist/3PYRXP25JcbqhvNaJYcnWy', appleMusic: 'https://music.apple.com/us/artist/1160083701', soundcloud: 'https://soundcloud.com/omnom' },
  'PEDROZ': { spotify: 'https://open.spotify.com/artist/0pvhlBRoxPlAsW02LwKp3p' },
  'Pixie Dust': { spotify: 'https://open.spotify.com/artist/0kSqe2dBbt8rg07yfEBnjR' },
  'Richard Vission': { spotify: 'https://open.spotify.com/artist/0oOA3Oech71Ouhi0oSULxp', appleMusic: 'https://music.apple.com/us/artist/394876', soundcloud: 'https://soundcloud.com/richardvission' },
  'Richie Hawtin': { spotify: 'https://open.spotify.com/artist/3AhwIUus3pIaA3CvYBEtpy', appleMusic: 'https://music.apple.com/us/artist/4090861', soundcloud: 'https://soundcloud.com/richiehawtin' },
  'Rommii': { spotify: 'https://open.spotify.com/artist/2ptklB4QBKqyRZNAkAEq8U', appleMusic: 'https://music.apple.com/us/artist/1404188409' },
  'RoRoll': { spotify: 'https://open.spotify.com/artist/25XcXsb4ZHu9htr1SJ2UCv', appleMusic: 'https://music.apple.com/us/artist/1569609170' },
  'Sabrosura Boyz': { appleMusic: 'https://music.apple.com/us/artist/1697418577' },
  'San Pacho': { spotify: 'https://open.spotify.com/artist/5jBerZvTAajwYvdxt3UhgU', appleMusic: 'https://music.apple.com/us/artist/1459430940', soundcloud: 'https://soundcloud.com/sanpachomusic' },
  'Sedef Adasï': { spotify: 'https://open.spotify.com/artist/4jY1cwyuyqQATeSI16ZeYD', appleMusic: 'https://music.apple.com/us/artist/1505848119', soundcloud: 'https://soundcloud.com/sedefadasi' },
  'SEUNG': { spotify: 'https://open.spotify.com/artist/1CuQ0y8pGZjIKzOiEzxRbV', appleMusic: 'https://music.apple.com/us/artist/1754453427' },
  'SHAKING': { spotify: 'https://open.spotify.com/artist/5ymmrBnnRTW23bKo7Fpbx6', soundcloud: 'https://soundcloud.com/imshaking' },
  'Showtek (Hardstyle Set)': { spotify: 'https://open.spotify.com/artist/3gk0OYeLFWYupGFRHqLSR7', appleMusic: 'https://music.apple.com/us/artist/74062258', soundcloud: 'https://soundcloud.com/SHOWTEK' },
  'Silvie Loto': { appleMusic: 'https://music.apple.com/us/artist/439643085' },
  'Sim Ivy': { appleMusic: 'https://music.apple.com/us/artist/1740847873' },
  'Spency Be': { appleMusic: 'https://music.apple.com/us/artist/1676387525' },
  'Steve Aoki': { spotify: 'https://open.spotify.com/artist/77AiFEVeAVj2ORpC85QVJs', appleMusic: 'https://music.apple.com/us/artist/steve-aoki/271066694', soundcloud: 'https://soundcloud.com/steveaoki' },
  'TELYKAST': { spotify: 'https://open.spotify.com/artist/7vWC03wqXwUqjPON8hc1tz', appleMusic: 'https://music.apple.com/us/artist/1133299760', soundcloud: 'https://soundcloud.com/TELYKast' },
  'Trancemaster Krause': { spotify: 'https://open.spotify.com/artist/5zKJhJZNLAQoVoycu4Esnw', appleMusic: 'https://music.apple.com/us/artist/1667612556' },
  'Trym': { spotify: 'https://open.spotify.com/artist/5Nd385K2g3s0828W8Ab70z', appleMusic: 'https://music.apple.com/us/artist/187278791', soundcloud: 'https://soundcloud.com/trymofficial' },
  'Yanamaste': { spotify: 'https://open.spotify.com/artist/6zRdaJArenH7DjolPTm6hY', appleMusic: 'https://music.apple.com/us/artist/1409458570', soundcloud: 'https://soundcloud.com/yanamaste14' },
  'YDG': { soundcloud: 'https://soundcloud.com/itsydg' },
  'Zedd': { spotify: 'https://open.spotify.com/artist/2qxJFvFYMEDqd7ui6kSAcq', appleMusic: 'https://music.apple.com/us/artist/368433979', soundcloud: 'https://soundcloud.com/zedd' },
  'Zoe Gitter': { spotify: 'https://open.spotify.com/artist/0IYS6mzt0DZL8P7DaqT4nm', appleMusic: 'https://music.apple.com/us/artist/1456354330' },
};

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
  officialUrl: 'https://escapehalloween.com/lineup/set-times/',
  dataVerifiedOn: '2026-10-27',
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
