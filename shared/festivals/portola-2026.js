// Portola Music Festival 2026 — festival definition.
//
// Pure data: no schedule is built here. buildFestival() in shared/festival.js
// turns this into placed blocks, lanes and grid bounds.
//
// `sets` is transcribed from the official per-day set-times images at
// https://portolamusicfestival.com/set-times/ (that page otherwise only
// promotes the Portola app — none of this is on the page itself as text or
// JSON):
//   - Saturday: .../portola/2026/2026-Portola-SetTimes-Saturday.jpg
//   - Sunday:   .../portola/2026/2026-Portola-SetTimes-Sunday.jpg
// Cross-checked against the per-stage flyers (also linked from that page)
// for stage rosters:
//   - Pier Stage:  .../portola/2026/pier-stage-26.jpg
//   - Crane Stage: .../portola/2026/crane-stage-26.jpg
//   - Warehouse:   .../portola/2026/warehouse-26.jpg
//   - Ship Tent:   .../portola/2026/ship-tent-26.jpg
// Read at full resolution on 2026-08-31 — re-check against the images if any
// is reissued.
//
// Every act on the bill is now placed on one of the four stages with a set
// time — this replaces the earlier partial/untimed transcription (two of the
// ~30 acts a day placed by stage-only flyers, the rest as bare unstaged
// strings).
//
// "DJ Shadow Celebrates 30 Years of Endtroducing….." on the Crane flyer is
// one act billed with a descriptive subtitle — recorded here as plain
// "DJ Shadow".
//
// A B2B slot (two acts sharing one time slot) is one entry with both names,
// e.g. Erika b2b SF Cowboy → ['Erika', 'SF Cowboy'].
//
// Kaytree (Sunday, Ship Tent, 1:40–2:55pm) doesn't appear on the full lineup
// poster this file was originally transcribed from (see artistLinks header) —
// it's a late addition that only shows up on the set-times/Ship Tent images.
//
// Despacio — the ambient, continuous "ALL WEEKEND LONG" sound-system
// installation from the poster — is left off entirely rather than listed
// as an act: it isn't a musical act with its own sets or releases, so it
// doesn't fit the data model (no day-less slot, no artist streaming links).

const slug = 'portola-2026';

// Matched to each stage's own flyer color rather than guessing: Pier Stage
// is blue, Crane Stage orange, Warehouse yellow, Ship Tent green.
const stages = [
  { id: 'pier', name: 'Pier Stage', short: 'PIER', color: '--ocean-deep' },
  { id: 'crane', name: 'Crane Stage', short: 'CRANE', color: '--sunset-coral' },
  { id: 'warehouse', name: 'Warehouse', short: 'WH', color: '--marigold-gold' },
  { id: 'shiptent', name: 'Ship Tent', short: 'SHIP', color: '--jungle-green' },
];

const days = [
  { id: 'sat', name: 'Saturday', date: 'Sep 26' },
  { id: 'sun', name: 'Sunday', date: 'Sep 27' },
];

// Each set: [stageId, start, end, artist]
const sets = {
  sat: [
    // ── Pier Stage ────────────────────────────────────────────────────────
    ['pier', '13:30', '14:30', 'Airwolf Paradise'],
    ['pier', '14:40', '15:30', 'Gelli Haha'],
    ['pier', '15:40', '16:30', 'Oskar Med K'],
    ['pier', '16:40', '17:30', 'FCUKERS'],
    ['pier', '17:40', '18:30', 'Tove Lo'],
    ['pier', '19:10', '20:10', 'Robyn'],
    ['pier', '21:00', '22:15', 'Dog Blood'],
    // ── Crane Stage ───────────────────────────────────────────────────────
    ['crane', '13:30', '15:00', ['Erika', 'SF Cowboy']],
    ['crane', '15:20', '16:10', 'Tricky'],
    ['crane', '16:25', '17:15', 'Nimino'],
    ['crane', '17:30', '18:30', 'DJ Shadow'],
    ['crane', '18:45', '19:35', 'Skepta'],
    ['crane', '19:55', '21:25', 'Fatboy Slim'],
    ['crane', '21:55', '22:55', 'Soulwax'],
    // ── Warehouse ─────────────────────────────────────────────────────────
    ['warehouse', '13:30', '14:45', 'Sam Alfred'],
    ['warehouse', '14:45', '15:45', ['Ranger Trucco', 'Alisha']],
    ['warehouse', '15:45', '16:45', 'Chloé Caillet'],
    ['warehouse', '16:45', '18:00', 'Groove Armada'],
    ['warehouse', '18:00', '19:15', 'Max Styler'],
    ['warehouse', '19:15', '20:30', 'KETTAMA'],
    ['warehouse', '20:30', '21:45', ['Beltran', 'Ben Sterling']],
    ['warehouse', '21:45', '23:00', 'Prospa'],
    // ── Ship Tent ─────────────────────────────────────────────────────────
    ['shiptent', '13:40', '14:40', 'Felly Fell'],
    ['shiptent', '14:50', '15:30', 'Mgna Crrrta'],
    ['shiptent', '15:40', '16:20', 'Six Sex'],
    ['shiptent', '16:40', '17:30', 'Mike D 5D'],
    ['shiptent', '17:40', '18:40', 'Jyoty'],
    ['shiptent', '18:50', '19:40', 'Bassvictim'],
    ['shiptent', '19:50', '20:40', 'Jigitz'],
    ['shiptent', '20:55', '21:35', 'Nate Sib'],
    ['shiptent', '21:50', '22:30', 'Melanie C (DJ Set)'],
  ],
  sun: [
    // ── Pier Stage ────────────────────────────────────────────────────────
    ['pier', '13:30', '14:20', 'Clearcast'],
    ['pier', '14:30', '15:20', 'Mind Enterprises'],
    ['pier', '15:30', '16:20', 'Channel Tres'],
    ['pier', '16:30', '17:25', 'SG Lewis (Live)'],
    ['pier', '17:35', '18:35', 'Mochakk'],
    ['pier', '19:05', '20:05', 'Zara Larsson'],
    ['pier', '20:45', '22:00', 'Swedish House Mafia'],
    // ── Crane Stage ───────────────────────────────────────────────────────
    ['crane', '13:30', '14:30', 'Torren Foot'],
    ['crane', '14:30', '15:30', 'Azzecca'],
    ['crane', '15:50', '16:30', 'Adéla'],
    ['crane', '16:45', '17:35', 'Zulan'],
    ['crane', '17:50', '18:40', 'Underscores'],
    ['crane', '19:00', '19:50', 'Ninajirachi'],
    ['crane', '20:10', '21:00', 'Horsegiirl'],
    ['crane', '21:30', '22:45', 'Parcels'],
    // ── Warehouse ─────────────────────────────────────────────────────────
    ['warehouse', '13:30', '14:30', 'Dean Turnley'],
    ['warehouse', '14:30', '15:30', 'Silva Bumpa'],
    ['warehouse', '15:30', '16:30', 'Brunello'],
    ['warehouse', '16:30', '17:30', 'VTSS'],
    ['warehouse', '17:30', '18:45', 'Marlon Hoffstadt'],
    ['warehouse', '18:45', '20:15', 'Tiësto'],
    ['warehouse', '20:20', '21:20', 'Overmono'],
    ['warehouse', '21:30', '23:00', 'Four Tet'],
    // ── Ship Tent ─────────────────────────────────────────────────────────
    ['shiptent', '13:40', '14:55', 'Kaytree'],
    ['shiptent', '14:55', '16:10', 'Riria'],
    ['shiptent', '16:20', '17:00', 'Ear'],
    ['shiptent', '17:10', '18:30', 'Ben UFO'],
    ['shiptent', '18:30', '19:50', 'Daphni'],
    ['shiptent', '20:05', '20:50', 'Kelela'],
    ['shiptent', '21:00', '21:30', 'JT'],
    ['shiptent', '21:40', '22:30', 'Baby J'],
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
// bio and follower count, not just first search hit). A couple of fields in
// the source data were dropped rather than trusted: an "Apple Music" field
// that actually held an x.com link for a few artists, and UTM tracking
// parameters on a couple of SoundCloud links.
//
// Kaytree — added to the bill after the above sourcing pass (see the `sets`
// header comment) — isn't in that API dump either; its SoundCloud URL below
// was found fresh via search on 2026-08-31 and confirmed against the bio
// ("San Francisco-based DJ & promoter").
//
// Each B2B pair (Beltran b2b Ben Sterling, Ranger Trucco b2b Alisha, Erika
// b2b SF Cowboy) is keyed here by individual member, same as everyone else —
// ArtistPopup looks each artist in the pair up separately and labels the
// links it finds with whichever name they belong to. The festival's source
// data was no help distinguishing pair members (its one record per pair
// held a single undifferentiated set of links); every entry below for a
// paired artist was instead confirmed against that specific person — e.g.
// Beltran's Apple Music/SoundCloud URLs literally contain "beltran", and
// Erika's bio in the source data matches the b0nitababy handle exactly —
// or found fresh via search where the source had nothing to go on (Ben
// Sterling, Alisha, SF Cowboy).
const artistLinks = {
  'Adéla': { spotify: 'https://open.spotify.com/artist/2qanRMyA5bNuTvz1dK45OP?si=6HLyTjilSbmyHBtcX9P4mA', appleMusic: 'https://music.apple.com/us/artist/ad%C3%A9la/1765924916' },
  'Airwolf Paradise': { spotify: 'https://open.spotify.com/artist/0c3I7EPZUCCG7khbUwQDjl', appleMusic: 'https://music.apple.com/us/artist/airwolf-paradise/272547821', soundcloud: 'https://soundcloud.com/airwolfparadise' },
  'Alisha': { spotify: 'https://open.spotify.com/artist/1zUgvtlUR6jXtCUCF0j3fe', appleMusic: 'https://music.apple.com/us/artist/alisha/1453979950', soundcloud: 'https://soundcloud.com/djalishauk' },
  'Azzecca': { spotify: 'https://open.spotify.com/artist/2k5DY2QDU3kBi5DX7OQlWj?si=EquIL1k1SYq_u9AGqMQN9g', soundcloud: 'https://soundcloud.com/azzecca' },
  'Baby J': { appleMusic: 'https://music.apple.com/au/artist/baby-j/1804205102', soundcloud: 'https://soundcloud.com/babyj4lyfe' },
  'Bassvictim': { spotify: 'https://open.spotify.com/artist/7f8ydynRRnrJBqWxevKLcM?si=vfkF-oERRgyhicJt-mWl4A', appleMusic: 'https://music.apple.com/us/artist/bassvictim/1704163385' },
  'Beltran': { spotify: 'https://open.spotify.com/artist/1jgSqmZTBltb5O2L7ErmEP', appleMusic: 'https://music.apple.com/es/artist/beltran/90369561', soundcloud: 'https://soundcloud.com/listenbeltran' },
  'Ben Sterling': { spotify: 'https://open.spotify.com/artist/79uJoLQkQ621xZy7MyH4uL', appleMusic: 'https://music.apple.com/us/artist/ben-sterling/302969723', soundcloud: 'https://soundcloud.com/bensterling' },
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
  'Erika': { soundcloud: 'https://soundcloud.com/b0nitababy' },
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
  'Kaytree': { soundcloud: 'https://soundcloud.com/kaytree' },
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
  'Ranger Trucco': { spotify: 'https://open.spotify.com/artist/36N80lh8tNu7XedcW55NC3', appleMusic: 'https://music.apple.com/us/artist/ranger-trucco/1503491295', soundcloud: 'https://soundcloud.com/ranger-trucco' },
  'Riria': { soundcloud: 'https://soundcloud.com/floatingriri' },
  'Robyn': { spotify: 'https://open.spotify.com/artist/6UE7nl9mha6s8z0wFQFIZ2', appleMusic: 'https://music.apple.com/us/artist/robyn/535211' },
  'Sam Alfred': { spotify: 'https://open.spotify.com/artist/4PVzoVUDxey3mxGdkf4HgR?si=5aBwrgpERby7xsOFWfR99w', appleMusic: 'https://music.apple.com/us/artist/sam-alfred/1458925637' },
  'SF Cowboy': { soundcloud: 'https://soundcloud.com/sfcowboy69' },
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
  dataVerifiedOn: '2026-08-31',
  headliners: ['Robyn', 'Dog Blood', 'Swedish House Mafia'],
  notableActs: ['Fatboy Slim', 'Skepta', 'Tove Lo', 'Tiësto', 'Zara Larsson', 'Four Tet', 'DJ Shadow'],
  stages,
  days,
  sets,
  artistLinks,
};
