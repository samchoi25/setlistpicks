// Portola Music Festival 2026 — festival definition.
//
// Pure data: no schedule is built here. buildFestival() in shared/festival.js
// turns this into placed blocks, lanes and grid bounds.
//
// Sources (all linked from https://portolamusicfestival.com/lineup/, which
// otherwise only promotes the Portola app — none of this is on the page
// itself as text or JSON, so it's transcribed from the poster art):
//   - full lineup: .../portola/2026/portola-2026-lineup.jpg
//   - Warehouse stage: .../portola/2026/warehouse-26.jpg
//   - Crane Stage:     .../portola/2026/crane-stage-26.jpg
// Transcribed at full resolution on 2026-08-13 — re-check against the posters
// if any is reissued.
//
// Two of the ~30 acts a day are now split across Warehouse and Crane Stage;
// the rest of the lineup hasn't been assigned a stage yet, so those stay
// plain strings (see dayModeOf() in shared/festival.js — a day can freely mix
// `[stageId, artist]` and bare-string entries). Staged entries keep the
// flyer's own order — a stage's own poster is the only ordering signal there
// is before set times exist, so re-sorting it alphabetically would throw that
// away; the unplaced acts have no such signal, so they're alphabetical.
//
// "DJ Shadow Celebrates 30 Years of Endtroducing….." on the full poster and
// Crane flyer is one act billed with a descriptive subtitle — recorded here
// as plain "DJ Shadow".
//
// A B2B slot (two acts sharing one time, once times exist) is one entry with
// both names, e.g. Erika b2b SF Cowboy → ['Erika', 'SF Cowboy'].
//
// Despacio — the ambient, continuous "ALL WEEKEND LONG" sound-system
// installation from the poster — is left off entirely rather than listed
// as an act: it isn't a musical act with its own sets or releases, so it
// doesn't fit the data model (no day-less slot, no artist streaming links).
//
// Once official set times land, add start/end and swap the two-element
// staged tuples for `[stageId, 'HH:MM start', 'HH:MM end', 'Artist']`.

const slug = 'portola-2026';

// The Warehouse flyer is yellow, Crane Stage's is orange — matched here
// rather than guessing.
const stages = [
  { id: 'warehouse', name: 'Warehouse', short: 'WH', color: '--marigold-gold' },
  { id: 'crane', name: 'Crane Stage', short: 'CRANE', color: '--sunset-coral' },
];

const days = [
  { id: 'sat', name: 'Saturday', date: 'Sep 26' },
  { id: 'sun', name: 'Sunday', date: 'Sep 27' },
];

const sets = {
  sat: [
    // ── Warehouse (flyer order) ─────────────────────────────────────────
    ['warehouse', 'Prospa'],
    ['warehouse', 'KETTAMA'],
    ['warehouse', 'Max Styler'],
    ['warehouse', ['Beltran', 'Ben Sterling']],
    ['warehouse', 'Groove Armada'],
    ['warehouse', 'Chloé Caillet'],
    ['warehouse', ['Ranger Trucco', 'Alisha']],
    ['warehouse', 'Sam Alfred'],

    // ── Crane Stage (flyer order) ───────────────────────────────────────
    ['crane', 'Soulwax'],
    ['crane', 'Fatboy Slim'],
    ['crane', 'Skepta'],
    ['crane', 'DJ Shadow'],
    ['crane', 'Nimino'],
    ['crane', 'Tricky'],
    ['crane', ['Erika', 'SF Cowboy']],

    // ── Not yet placed on a stage ───────────────────────────────────────
    'Airwolf Paradise',
    'Bassvictim',
    'Dog Blood',
    'FCUKERS',
    'Felly Fell',
    'Gelli Haha',
    'Jigitz',
    'Jyoty',
    'Melanie C (DJ Set)',
    'Mgna Crrrta',
    'Mike D 5D',
    'Nate Sib',
    'Oskar Med K',
    'Robyn',
    'Six Sex',
    'Tove Lo',
  ],
  sun: [
    // ── Warehouse (flyer order) ─────────────────────────────────────────
    ['warehouse', 'Tiësto'],
    ['warehouse', 'Four Tet'],
    ['warehouse', 'Marlon Hoffstadt'],
    ['warehouse', 'Overmono'],
    ['warehouse', 'VTSS'],
    ['warehouse', 'Brunello'],
    ['warehouse', 'Silva Bumpa'],
    ['warehouse', 'Dean Turnley'],

    // ── Crane Stage (flyer order) ───────────────────────────────────────
    ['crane', 'Parcels'],
    ['crane', 'Horsegiirl'],
    ['crane', 'Zulan'],
    ['crane', 'Ninajirachi'],
    ['crane', 'Underscores'],
    ['crane', 'Adéla'],
    ['crane', 'Azzecca'],
    ['crane', 'Torren Foot'],

    // ── Not yet placed on a stage ───────────────────────────────────────
    'Baby J',
    'Ben UFO',
    'Channel Tres',
    'Clearcast',
    'Daphni',
    'Ear',
    'JT',
    'Kelela',
    'Mind Enterprises',
    'Mochakk',
    'Riria',
    'SG Lewis (Live)',
    'Swedish House Mafia',
    'Zara Larsson',
  ],
};

// Spotify/Apple Music/SoundCloud links, shown on long-press (see
// ArtistPopup.jsx). Sourced from the festival's own artist-detail API
// (events.aegamp.com's app.js reads artist records from
// amp-prod-aeg-festivaldata.s3.amazonaws.com/app/726/08c3a793c3374f139/ —
// not visible on the /lineup/ page itself, which is client-rendered) on
// 2026-08-13. Regular https:// profile URLs, not app:// URI schemes —
// Spotify/Apple Music/SoundCloud all register these as universal links, so
// they open natively on a phone with the app installed and fall back to the
// web player otherwise, without needing two links per platform.
//
// The festival's own source only had links for about half the lineup; the
// rest were filled in on 2026-08-14 by looking up each artist's official
// Spotify/Apple Music/SoundCloud profile individually (verified by name,
// bio and follower count, not just first search hit). B2B pairs
// (Beltran b2b Ben Sterling, Ranger Trucco b2b Alisha, Erika b2b SF Cowboy)
// aren't split here — the source data doesn't attribute those links to one
// half of the pair over the other, so they're left out rather than guessed.
// A couple of fields in the source data were dropped rather than trusted:
// an "Apple Music" field that actually held an x.com link for a few artists,
// and UTM tracking parameters on a couple of SoundCloud links.
const artistLinks = {
  'Adéla': { spotify: 'https://open.spotify.com/artist/2qanRMyA5bNuTvz1dK45OP?si=6HLyTjilSbmyHBtcX9P4mA', appleMusic: 'https://music.apple.com/us/artist/ad%C3%A9la/1765924916' },
  'Airwolf Paradise': { spotify: 'https://open.spotify.com/artist/0c3I7EPZUCCG7khbUwQDjl', appleMusic: 'https://music.apple.com/us/artist/airwolf-paradise/272547821', soundcloud: 'https://soundcloud.com/airwolfparadise' },
  'Azzecca': { spotify: 'https://open.spotify.com/artist/2k5DY2QDU3kBi5DX7OQlWj?si=EquIL1k1SYq_u9AGqMQN9g', soundcloud: 'https://soundcloud.com/azzecca' },
  'Baby J': { appleMusic: 'https://music.apple.com/au/artist/baby-j/1804205102', soundcloud: 'https://soundcloud.com/babyj4lyfe' },
  'Bassvictim': { spotify: 'https://open.spotify.com/artist/7f8ydynRRnrJBqWxevKLcM?si=vfkF-oERRgyhicJt-mWl4A', appleMusic: 'https://music.apple.com/us/artist/bassvictim/1704163385' },
  'Ben UFO': { appleMusic: 'https://music.apple.com/us/artist/ben-ufo/591790660', soundcloud: 'https://soundcloud.com/benufo' },
  'Brunello': { spotify: 'https://open.spotify.com/artist/7FZIk8RSha4GBa4ZEPuytU', appleMusic: 'https://music.apple.com/us/artist/brunello/1697000713', soundcloud: 'https://soundcloud.com/brunellobeats' },
  'Channel Tres': { spotify: 'https://open.spotify.com/artist/4cUkGQyhLFqKHBtL58HYVp', appleMusic: 'https://music.apple.com/us/artist/channel-tres/1293846868', soundcloud: 'https://soundcloud.com/channeltres' },
  'Chloé Caillet': { spotify: 'https://open.spotify.com/artist/68ywCN6ZpInbcilOfLBa3a', appleMusic: 'https://music.apple.com/us/artist/chlo%C3%A9-caillet/1256658136', soundcloud: 'https://soundcloud.com/chloecaillet' },
  'Clearcast': { spotify: 'https://open.spotify.com/artist/3dRhjQBCaVo5zMuXyjv7Su', soundcloud: 'https://soundcloud.com/clear_cast' },
  'Daphni': { spotify: 'https://open.spotify.com/artist/4nhvb6x9ZhPiYCzrHDNia9?si=5OR73fiKSfOAyQM1FpK8Hg', appleMusic: 'https://music.apple.com/us/artist/daphni/1282779393', soundcloud: 'https://soundcloud.com/caribouband' },
  'Dean Turnley': { spotify: 'https://open.spotify.com/artist/3BcWcwYXVjvLWHMGKsuvsd?si=mhZej_eyRdasjP2E-GAZOQ', appleMusic: 'https://music.apple.com/au/artist/dean-turnley/1561296990', soundcloud: 'https://soundcloud.com/dean_turnley' },
  'DJ Shadow': { spotify: 'https://open.spotify.com/artist/5CE2IfdYZEQGIDsfiRm8SI', appleMusic: 'https://music.apple.com/us/artist/dj-shadow/133086', soundcloud: 'https://soundcloud.com/djshadow' },
  'Dog Blood': { spotify: 'https://open.spotify.com/artist/2amyu5pkgYMYdNQZmB3GgY', appleMusic: 'https://music.apple.com/us/artist/dog-blood/328183952' },
  'Ear': { spotify: 'https://open.spotify.com/artist/3bABCGLkFvjnNIKHvPVHDG', appleMusic: 'https://music.apple.com/us/album/ne-plus-ultra-single/1895982136', soundcloud: 'https://soundcloud.com/earband' },
  'Fatboy Slim': { spotify: 'https://open.spotify.com/artist/4Y7tXHSEejGu1vQ9bwDdXW', appleMusic: 'https://music.apple.com/us/artist/fatboy-slim/1093405', soundcloud: 'https://soundcloud.com/fatboyslim' },
  'FCUKERS': { spotify: 'https://open.spotify.com/artist/3UtzOHYm3lQALkKzVD4wyO', appleMusic: 'https://music.apple.com/us/artist/fcukers/1679474991', soundcloud: 'https://soundcloud.com/fcukers' },
  'Felly Fell': { spotify: 'https://open.spotify.com/artist/479Mf0xPXImSJVue9xm6gg', soundcloud: 'https://soundcloud.com/fellyfell805' },
  'Four Tet': { spotify: 'https://open.spotify.com/artist/7Eu1txygG6nJttLHbZdQOh', appleMusic: 'https://music.apple.com/us/artist/four-tet/35888604', soundcloud: 'https://soundcloud.com/four-tet' },
  'Gelli Haha': { spotify: 'https://open.spotify.com/artist/4O0acxqHYUQGGMqOICiSeI', appleMusic: 'https://music.apple.com/us/artist/gelli-haha/1797160694' },
  'Groove Armada': { spotify: 'https://open.spotify.com/artist/67tgMwUfnmqzYsNAtnP6YJ' },
  'Horsegiirl': { spotify: 'https://open.spotify.com/artist/0auP293abZeTWwMUi3fZw2', soundcloud: 'https://soundcloud.com/horsegiirl' },
  'Jigitz': { spotify: 'https://open.spotify.com/artist/7sfn5Z6ItzDkOF9cYzxWPZ', appleMusic: 'https://music.apple.com/us/artist/jigitz/1212140410', soundcloud: 'https://soundcloud.com/jigitz' },
  'JT': { spotify: 'https://open.spotify.com/artist/39af15p0feaAOdL9DTRj3m', appleMusic: 'https://music.apple.com/us/artist/jt/1590403119' },
  'Jyoty': { spotify: 'https://open.spotify.com/artist/65pTwZnORxHUx58vDrVGNm', appleMusic: 'https://music.apple.com/us/artist/jyoty/1531956333', soundcloud: 'https://soundcloud.com/jyotysingh' },
  'Kelela': { spotify: 'https://open.spotify.com/artist/1U0sIzpRtDkvu1hXXzxh60?si=HvO6ctQ8RLGUSfDgE5F9oA', appleMusic: 'https://music.apple.com/us/artist/kelela/549186342', soundcloud: 'https://soundcloud.com/KELELAM' },
  'KETTAMA': { spotify: 'https://open.spotify.com/artist/2IkkP6VpsELlCC07Vp4Omr', appleMusic: 'https://music.apple.com/us/artist/kettama/1425703970', soundcloud: 'https://soundcloud.com/kettamabro' },
  'Marlon Hoffstadt': { spotify: 'https://open.spotify.com/artist/0HHa7ZJZxUQlg5l2mB0N0f', appleMusic: 'https://music.apple.com/us/artist/marlon-hoffstadt/457222498', soundcloud: 'https://soundcloud.com/marlonhoffstadt' },
  'Max Styler': { spotify: 'https://open.spotify.com/artist/3NKKngINK1tP6BFy0WOyWk?si=G30GTMIDTh2RPF80nKHnzA', appleMusic: 'https://music.apple.com/us/artist/max-styler/912353079', soundcloud: 'https://soundcloud.com/maxstyler' },
  'Melanie C (DJ Set)': { spotify: 'https://open.spotify.com/artist/60vX3zLcdKRXvKLITVh5Df?si=iwCCaPUlRc2pVdMyEboOxg', appleMusic: 'https://music.apple.com/artist/653819' },
  'Mgna Crrrta': { spotify: 'https://open.spotify.com/artist/1pNs3qwMBJ0q4lyASth9Ye?si=MI1bQBVQRkWkIpoI3Kmb-g', appleMusic: 'https://music.apple.com/us/artist/mgna-crrrta/1620045272', soundcloud: 'https://soundcloud.com/mgna-crrrta' },
  'Mike D 5D': { spotify: 'https://open.spotify.com/artist/1Um2jYfcrBnrDlqvW2KGw8?si=xLzxXu__RMuj070_uiE4Mg', appleMusic: 'https://music.apple.com/us/artist/mike-d/1646443127' },
  'Mind Enterprises': { spotify: 'https://open.spotify.com/artist/5pN1DJhPFDKso4OtC0QhnB?si=f6R0W7PkQle2hHNFqz4z-g', appleMusic: 'https://music.apple.com/us/artist/mind-enterprises/552057922' },
  'Mochakk': { spotify: 'https://open.spotify.com/artist/0rTh1tAdrEbdKZBTiiAQSo', appleMusic: 'https://music.apple.com/us/artist/mochakk/1230228889', soundcloud: 'https://soundcloud.com/mochakkmusic' },
  'Nate Sib': { spotify: 'https://open.spotify.com/artist/4TNu2ZIE566yKwEhOT8eTv', appleMusic: 'https://music.apple.com/us/artist/nate-sib/1709203739', soundcloud: 'https://soundcloud.com/natesib' },
  'Nimino': { spotify: 'https://open.spotify.com/artist/5x0R3zoC09GMiRJomoexLV?si=xardjqscS3WnXIpqG-5_Mg', soundcloud: 'https://soundcloud.com/niminomusic' },
  'Ninajirachi': { spotify: 'https://open.spotify.com/artist/3MekbRujJg5VZThubOlrkR', appleMusic: 'https://music.apple.com/us/artist/ninajirachi/1210938233', soundcloud: 'https://soundcloud.com/ninajirachi' },
  'Oskar Med K': { spotify: 'https://open.spotify.com/artist/28ntgpEkMU9Zm7F3gLDMhZ?si=U_EJ6JW_ThSmHvTu3F8f2A', appleMusic: 'https://music.apple.com/ca/artist/oskar-med-k/1671429234', soundcloud: 'https://soundcloud.com/oskarmedkmedk' },
  'Overmono': { spotify: 'https://open.spotify.com/artist/01PnN11ovfen6xUOHfNpn3', appleMusic: 'https://music.apple.com/us/artist/overmono/1129806758', soundcloud: 'https://soundcloud.com/overmono' },
  'Parcels': { spotify: 'https://open.spotify.com/artist/3oKRxpszQKUjjaHz388fVA?si=hiP9qZCmSb6VJjaa0tqI2A', appleMusic: 'https://music.apple.com/artist/1148094312', soundcloud: 'https://soundcloud.com/parcelsmusic' },
  'Prospa': { spotify: 'https://open.spotify.com/artist/6HabM2PUM519iIxervGWSb', appleMusic: 'https://music.apple.com/us/artist/prospa/962366708', soundcloud: 'https://soundcloud.com/prospauk' },
  'Riria': { soundcloud: 'https://soundcloud.com/floatingriri' },
  'Robyn': { spotify: 'https://open.spotify.com/artist/6UE7nl9mha6s8z0wFQFIZ2', appleMusic: 'https://music.apple.com/us/artist/robyn/535211' },
  'Sam Alfred': { spotify: 'https://open.spotify.com/artist/4PVzoVUDxey3mxGdkf4HgR?si=5aBwrgpERby7xsOFWfR99w', appleMusic: 'https://music.apple.com/us/artist/sam-alfred/1458925637' },
  'SG Lewis (Live)': { spotify: 'https://open.spotify.com/artist/0GG2cWaonE4JPrjcCCQ1EG', appleMusic: 'https://music.apple.com/us/artist/sg-lewis/966324292', soundcloud: 'https://soundcloud.com/sglewis' },
  'Silva Bumpa': { spotify: 'https://open.spotify.com/artist/2dPLkqesvPXpIlP65JoLrf', soundcloud: 'https://soundcloud.com/silvabumpa' },
  'Six Sex': { spotify: 'https://open.spotify.com/artist/29rvPhemBdOLYdLr2xI8dr?si=JoQGI7aST7iJn2tiOUrRdw', appleMusic: 'https://music.apple.com/us/artist/six-sex/1485483068', soundcloud: 'https://www.soundcloud.com/sixsex' },
  'Skepta': { spotify: 'https://open.spotify.com/artist/2p1fiYHYiXz9qi0JJyxBzN?si=PyrJjzfpQTSOgm5KgPnK_g', appleMusic: 'https://music.apple.com/us/artist/skepta/167376669', soundcloud: 'https://soundcloud.com/skepta' },
  'Soulwax': { spotify: 'https://open.spotify.com/artist/43mWhBXSflupNLuNjM5vff?si=OVFMGK6aS8a1vXuYQkJN-Q', soundcloud: 'https://soundcloud.com/soulwaxofficial' },
  'Swedish House Mafia': { spotify: 'https://open.spotify.com/artist/1h6Cn3P4NGzXbaXidqURXs', appleMusic: 'https://music.apple.com/us/artist/swedish-house-mafia/375569761', soundcloud: 'https://soundcloud.com/officialswedishhousemafia' },
  'Tiësto': { spotify: 'https://open.spotify.com/artist/53SmfdLX1oQbwzDWAn0PyV', appleMusic: 'https://music.apple.com/us/artist/ti%C3%ABsto/4091218', soundcloud: 'https://soundcloud.com/tiesto' },
  'Torren Foot': { spotify: 'https://open.spotify.com/artist/7lQOxDl96wmNoqGoW4kgv4?si=v1Hd2-LBRMiIgnqzSK0RQA', soundcloud: 'https://soundcloud.com/torrenfoot' },
  'Tove Lo': { spotify: 'https://open.spotify.com/artist/4NHQUGzhtTLFvgF5SZesLK?si=sq8rybMSS0S_W86Ea11qOw', appleMusic: 'https://music.apple.com/us/artist/tove-lo/570136838', soundcloud: 'https://soundcloud.com/tovelo' },
  'Tricky': { spotify: 'https://open.spotify.com/artist/6hhA8TKRNryM8FNzqCqdDO', appleMusic: 'https://music.apple.com/us/artist/tricky/254458', soundcloud: 'https://soundcloud.com/trickyofficial' },
  'Underscores': { spotify: 'https://open.spotify.com/artist/7HfUJxeVTgrvhk0eWHFzV7', appleMusic: 'https://music.apple.com/us/artist/underscores/1204838812', soundcloud: 'https://soundcloud.com/underscores' },
  'VTSS': { spotify: 'https://open.spotify.com/artist/76mN55IvDOO4bEBbMtNpoY', appleMusic: 'https://music.apple.com/us/artist/vtss/1127456384', soundcloud: 'https://soundcloud.com/vtss' },
  'Zara Larsson': { spotify: 'https://open.spotify.com/artist/1Xylc3o4UrD53lo9CvFvVg?si=1XqwkvfOQZ6VqIauZQYsSg', appleMusic: 'https://music.apple.com/us/artist/zara-larsson/570372593', soundcloud: 'https://soundcloud.com/zaralarssonofficial' },
  'Zulan': { spotify: 'https://open.spotify.com/artist/2Yz9F5lQVc0p6SDxkw2BvF', appleMusic: 'https://music.apple.com/us/artist/zulan/1807249833', soundcloud: 'https://soundcloud.com/zulann' },
};

export default {
  slug,
  name: 'Portola Music Festival 2026',
  shortName: 'Portola',
  year: 2026,
  venue: 'Pier 80, San Francisco',
  place: {
    name: 'Pier 80',
    addressLocality: 'San Francisco',
    addressRegion: 'CA',
    addressCountry: 'US',
  },
  utcOffset: '-07:00',
  dateRange: 'September 26–27, 2026',
  officialUrl: 'https://portolamusicfestival.com/lineup/',
  dataVerifiedOn: '2026-08-13',
  headliners: ['Robyn', 'Dog Blood', 'Swedish House Mafia'],
  notableActs: ['Fatboy Slim', 'Skepta', 'Tove Lo', 'Tiësto', 'Zara Larsson', 'Four Tet', 'DJ Shadow'],
  stages,
  days,
  sets,
  artistLinks,
};
