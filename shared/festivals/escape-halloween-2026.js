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
  'VNSSA': { spotify: 'https://open.spotify.com/artist/6fjbZ7zQBYEy3kvB5JL5PM', soundcloud: 'https://soundcloud.com/v_nss_a' },
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
