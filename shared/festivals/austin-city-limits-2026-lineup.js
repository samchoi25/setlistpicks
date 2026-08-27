// Austin City Limits Music Festival 2026 — shared lineup data.
//
// ACL 2026 runs as two near-identical weekends (Oct 2–4 and Oct 9–11), each
// with its own ticket and its own group of festival-goers — so it's modeled
// as two separate festivals, austin-city-limits-2026-week-1.js and
// -week-2.js, each with its own complete, independently-timed `sets` table.
// This module holds only what both weekends share: the stage list and the
// artist links.
//
// Sourcing — the full per-stage, per-time schedule, published as six images
// (the schedule page itself has no text or API) at
// https://www.aclfestival.com/schedule, read at full resolution 2026-08-26:
//   W1 Fri (8.17): https://cdn.prod.website-files.com/67456b422d0e4219d58ef713/6a8353b915c46429a38e9ea7_ACL26-Schedule-Wk1-1002-Fri-8.17.webp
//   W1 Sat (8.17): https://cdn.prod.website-files.com/67456b422d0e4219d58ef713/6a836c83915b2704cea92aee_ACL26-Schedule-Wk1-1003-Sat-8.17.png
//   W1 Sun (8.21): https://cdn.prod.website-files.com/67456b422d0e4219d58ef713/6a88b3d87a5ae67ffc9f20db_ACL26-Schedule-Wk1-1004-Sun-8.21.webp
//   W2 Fri (8.17): https://cdn.prod.website-files.com/67456b422d0e4219d58ef713/6a8353c65160f0771ba3f4eb_ACL26-Schedule-Wk2-1009-Fri-8.17.webp
//   W2 Sat (8.17): https://cdn.prod.website-files.com/67456b422d0e4219d58ef713/6a836c70cc2c2b925252a6e2_ACL26-Schedule-Wk2-1010-Sat-8.17.png
//   W2 Sun (8.17): https://cdn.prod.website-files.com/67456b422d0e4219d58ef713/6a8353efac62c6baed54c80c_ACL26-Schedule-Wk2-1011-Sun-8.17.webp
// This replaces the old two-source situation (a lineup admat plus a partial
// per-stage placement release with no end times) — the schedule above gives
// a real start AND end time for every act except the last set on each stage
// each day, which prints a start time only (see the closing-set comment in
// each week file). Silent Disco is printed on the Tito's Handmade Vodka
// column 8:00–10:00 every day, both weekends; it's a festival activity, not
// a bookable artist, and is deliberately left out of `sets`.
//
// Reconciling the new schedule against the old admat-derived lineup surfaced
// three discrepancies worth flagging rather than silently resolving:
//   - Bo Staloch was previously tagged W1-only (Friday, Tito's). The
//     schedule shows him at the identical Friday Tito's slot (3:15–4:00)
//     both weekends, so he's untagged (both weeks) below and in both week
//     files now.
//   - Presley Regier was previously listed W2-only (Saturday, BMI-tier).
//     He does not appear anywhere on any of the six schedule images —
//     possibly cut from the bill. Not included in either week's `sets`.
//     Flag for review if he resurfaces on a future schedule update.
//   - Josh Conway was previously listed W1-only (Sunday, Miller-Lite-tier).
//     He does not appear on the W1 Sunday schedule; the analogous W2 Sunday
//     Miller Lite early slot instead lists Joshua Jensen. These read as two
//     different people rather than one act renamed — not merged. Josh
//     Conway is not included in either week's `sets`; Joshua Jensen is
//     included in week 2 only.
//
// The seven stages ACL 2026 runs, in the order the schedule lists them.
// Colours are the festival's own brand cues where there is an obvious one
// (Amex blue, T-Mobile magenta, Miller gold) and distinct picks elsewhere.
export const stages = [
  { id: 'amex',       name: 'American Express Stage', short: 'AMEX', color: '--ocean-deep' },
  { id: 'tmobile',    name: 'T-Mobile Stage',         short: 'TMO',  color: '--pink-carnation' },
  { id: 'millerlite', name: 'Miller Lite Stage',      short: 'MIL',  color: '--marigold-gold' },
  { id: 'snapchat',   name: 'Snapchat Stage',         short: 'SNAP', color: '--dusk-purple' },
  { id: 'titos',      name: "Tito's Stage",           short: 'TITO', color: '--deep-teal' },
  { id: 'bmi',        name: 'BMI Stage',              short: 'BMI',  color: '--jungle-green' },
  { id: 'beatbox',    name: 'BeatBox Stage',          short: 'BBX',  color: '--brick-clay' },
];

// Spotify/Apple Music/SoundCloud links, shown on long-press (see
// ArtistPopup.jsx). None of this is published by the festival itself (no
// per-artist API the way Portola/AEG-produced festivals have) — every entry
// was found and verified individually (name, bio, genre and/or a matching
// "Zilker Park Parking, Austin" tour date, not just first search hit) on
// 2026-08-15 (2026-08-26 for Elijah Delgado, added when the schedule was
// transcribed), using a mix of web search, MusicBrainz's editor-verified
// cross-platform artist relationships, and Apple's iTunes Search API.
// Omitted entirely where nothing could be confidently verified: Aaron Rowe,
// Chelsea Jordan, Coleman Jennings, Don West, Girlfriend, The
// Huston-Tillotson University Jazz Collective, Radio Free Alice, LIVE, Macy
// Todd, and Joshua Jensen — all smaller acts with enough same-named
// collisions elsewhere (a Melbourne post-punk band on Atlantic Records for
// "Radio Free Alice", the 90s rock band for "LIVE", a Georgia-based
// songwriter for "Macy Todd", none clearly the Austin-scale acts booked
// here) that guessing felt worse than leaving them blank.
export const artistLinks = {
  '¥ØU$UK€ ¥UK1MAT$U': { spotify: 'https://open.spotify.com/artist/0BEmPeY22LTrZJFFP2xIyk', appleMusic: 'https://music.apple.com/us/artist/1830360631', soundcloud: 'https://soundcloud.com/yousukeyukimatsu' },
  'Almost Heaven': { spotify: 'https://open.spotify.com/artist/25M75SztfGLmmWJK09R1dN', appleMusic: 'https://music.apple.com/us/artist/almost-heaven/1625944016' },
  'Amyl and the Sniffers': { spotify: 'https://open.spotify.com/artist/3NqV2DJoAWsjl787bWaHW7', appleMusic: 'https://music.apple.com/us/artist/amyl-and-the-sniffers/1215764503', soundcloud: 'https://soundcloud.com/amylandthesniffers' },
  'Annie DiRusso': { spotify: 'https://open.spotify.com/artist/58jk0945bnQBG9xfij6hHw', appleMusic: 'https://music.apple.com/us/artist/annie-dirusso/1213903929', soundcloud: 'https://soundcloud.com/anniedirusso' },
  'Arcy Drive': { spotify: 'https://open.spotify.com/artist/7o1TBmx7Ube5h2Czlam84O', appleMusic: 'https://music.apple.com/us/artist/1623935681', soundcloud: 'https://soundcloud.com/arcydrive' },
  'Asleep at the Wheel': { spotify: 'https://open.spotify.com/artist/54tWKkrjv4bQgKrQrNlecm', appleMusic: 'https://music.apple.com/us/artist/asleep-at-the-wheel/814340' },
  'Audrey Hobert': { spotify: 'https://open.spotify.com/artist/4N0TAwz9vhnQtjCqS65aKS', appleMusic: 'https://music.apple.com/us/artist/audrey-hobert/1812750994', soundcloud: 'https://soundcloud.com/audreyhobert' },
  'Bad Nerves': { spotify: 'https://open.spotify.com/artist/7IPyXY4ZHkuvQY1ny8TnMQ', appleMusic: 'https://music.apple.com/us/artist/bad-nerves/1213806228', soundcloud: 'https://soundcloud.com/badnerves' },
  'Balu Brigada': { spotify: 'https://open.spotify.com/artist/0hL7kSYBJfbF9RtzCP0bza', appleMusic: 'https://music.apple.com/us/artist/balu-brigada/1171521321', soundcloud: 'https://soundcloud.com/balu-brigada' },
  'Bella Kay': { spotify: 'https://open.spotify.com/artist/4Z8MrrKMBHMPa8d04Ivur8', appleMusic: 'https://music.apple.com/us/artist/bella-kay/1706434165' },
  'Bleachers': { spotify: 'https://open.spotify.com/artist/2eam0iDomRHGBypaDQLwWI', appleMusic: 'https://music.apple.com/us/artist/bleachers/824434533', soundcloud: 'https://soundcloud.com/bleachers' },
  'Blood Orange': { spotify: 'https://open.spotify.com/artist/6LEeAFiJF8OuPx747e1wxR', appleMusic: 'https://music.apple.com/us/artist/blood-orange/440698865', soundcloud: 'https://soundcloud.com/bloodorange' },
  'Bo Staloch': { spotify: 'https://open.spotify.com/artist/2EtiCherSxAKu7mnbU8Poh', appleMusic: 'https://music.apple.com/us/artist/1698048247', soundcloud: 'https://soundcloud.com/bostaloch' },
  'Brandon Flowers': { spotify: 'https://open.spotify.com/artist/18Zv2g2vUcEGqJf6WnjfXN', appleMusic: 'https://music.apple.com/us/artist/brandon-flowers/23934543' },
  'Brigitte Calls Me Baby': { spotify: 'https://open.spotify.com/artist/3sB1RV3IE5yCyMbl01FzBN', appleMusic: 'https://music.apple.com/us/artist/brigitte-calls-me-baby/1647490311', soundcloud: 'https://soundcloud.com/brigittecallsmebaby' },
  'Britton': { spotify: 'https://open.spotify.com/artist/2VjEhHV3KaZlYg2js0Mqr0', appleMusic: 'https://music.apple.com/us/artist/britton/250599027' },
  'BUNT.': { spotify: 'https://open.spotify.com/artist/2CpLIMBoE2ZzyY3ZBCRZ7j', appleMusic: 'https://music.apple.com/us/artist/bunt/1436090348', soundcloud: 'https://soundcloud.com/buntmusic' },
  'Calder Allen': { spotify: 'https://open.spotify.com/artist/1XlVbGlQaBoESaJ43y2sCD', appleMusic: 'https://music.apple.com/us/artist/calder-allen/1608248970', soundcloud: 'https://soundcloud.com/calderallen' },
  'Cannons': { spotify: 'https://open.spotify.com/artist/7FtCyCJCJaxabYO7Uyda5B', appleMusic: 'https://music.apple.com/us/artist/cannons/65568551' },
  'Cassandra Coleman': { spotify: 'https://open.spotify.com/artist/1O6GvgnaHzgcFlCX6RlhYV' },
  'Charli XCX': { spotify: 'https://open.spotify.com/artist/25uiPmTg16RbhZWAqwLBy5', appleMusic: 'https://music.apple.com/us/artist/charli-xcx/432942256', soundcloud: 'https://soundcloud.com/charlixcx' },
  'Charlotte Lawrence': { spotify: 'https://open.spotify.com/artist/7LImGq5KnzQobZciDJpeJb', appleMusic: 'https://music.apple.com/us/artist/charlotte-lawrence/766217679' },
  'Chloe Qisha': { spotify: 'https://open.spotify.com/artist/1WNmfSqydnt1FDJKg3l6lw', appleMusic: 'https://music.apple.com/us/artist/chloe-qisha/1751460376', soundcloud: 'https://soundcloud.com/chloeqisha' },
  'Claire Rosinkranz': { spotify: 'https://open.spotify.com/artist/3V0ZQW0dNuVaFtbVYgSI24', appleMusic: 'https://music.apple.com/us/artist/1483262366', soundcloud: 'https://soundcloud.com/clairerosinkranz' },
  'CMAT': { spotify: 'https://open.spotify.com/artist/3VBNIRx1LxVdRqOiPgkLwv', appleMusic: 'https://music.apple.com/us/artist/cmat/1506697965' },
  'Common People': { spotify: 'https://open.spotify.com/artist/6MPvMut19soRca5EoF92uX', appleMusic: 'https://music.apple.com/us/artist/common-people/1829795802' },
  'Cure for Paranoia': { appleMusic: 'https://music.apple.com/us/artist/cure-for-paranoia/1223853229' },
  'Dallas Wax': { appleMusic: 'https://music.apple.com/us/artist/dallas-wax/1727008720' },
  'Damaris Bojor': { appleMusic: 'https://music.apple.com/us/artist/damaris-bojor/1657753052' },
  'Dexter and the Moonrocks': { spotify: 'https://open.spotify.com/artist/72sOBVpZpUwHq7i0vb26lT', appleMusic: 'https://music.apple.com/us/artist/1581657500' },
  'DJ Cassandra': { appleMusic: 'https://music.apple.com/us/artist/dj-cassandra/6779930773' },
  'Elijah Delgado': { spotify: 'https://open.spotify.com/artist/2Xx6jD7k7Tja7AIJolg98F' },
  'Elle Coves': { spotify: 'https://open.spotify.com/artist/3Hey7RF0bxnjPP8IEXmPRa', appleMusic: 'https://music.apple.com/us/artist/elle-coves/1687094318' },
  'Emma Ogier': { spotify: 'https://open.spotify.com/artist/7lVBH2nQlHcpcU4RiY7izm', appleMusic: 'https://music.apple.com/us/artist/emma-ogier/1571801234' },
  'Ethan Regan': { appleMusic: 'https://music.apple.com/us/artist/ethan-regan/1329542870' },
  'Fai Laci': { spotify: 'https://open.spotify.com/artist/6ilTnouFQzuDsvGY1jamfF', appleMusic: 'https://music.apple.com/us/artist/fai-laci/1524039071' },
  'Fakemink': { spotify: 'https://open.spotify.com/artist/0qc4BFxcwRFZfevTck4fOi', appleMusic: 'https://music.apple.com/us/artist/fakemink/1744500063', soundcloud: 'https://soundcloud.com/fakemink' },
  'Fancy Hagood': { spotify: 'https://open.spotify.com/artist/1klmpKnfBdJkVqr94BnuOF', appleMusic: 'https://music.apple.com/us/artist/fancy-hagood/859825960' },
  'Faouzia': { spotify: 'https://open.spotify.com/artist/5NhgsV7qPWHZqYEMKzbYvo', appleMusic: 'https://music.apple.com/us/artist/faouzia/414067643', soundcloud: 'https://soundcloud.com/faouziaofficial' },
  'FCUKERS': { spotify: 'https://open.spotify.com/artist/3UtzOHYm3lQALkKzVD4wyO', appleMusic: 'https://music.apple.com/us/artist/1679474991', soundcloud: 'https://soundcloud.com/fcukers' },
  'Fightmaster': { spotify: 'https://open.spotify.com/artist/3ejIpQTvOb6XjUhX96RrMw', appleMusic: 'https://music.apple.com/us/artist/fightmaster/1695043324' },
  'Finn Wolfhard': { spotify: 'https://open.spotify.com/artist/2nmWcAqQtfgNp8Kpixa2CG', appleMusic: 'https://music.apple.com/us/artist/finn-wolfhard/1275324142' },
  'Gabriel Jacoby': { spotify: 'https://open.spotify.com/artist/05pLxSVIyZiQTqQnR4QQ9H', appleMusic: 'https://music.apple.com/us/artist/gabriel-jacoby/1610957262' },
  'Geese': { spotify: 'https://open.spotify.com/artist/0WCo84qtCKfbyIf1lqQWB4', appleMusic: 'https://music.apple.com/us/artist/1378038472', soundcloud: 'https://soundcloud.com/geeseband' },
  'Grace Ives': { spotify: 'https://open.spotify.com/artist/4TZieE5978SbTInJswaay2', appleMusic: 'https://music.apple.com/us/artist/1390289298' },
  'Grocery Bag': { appleMusic: 'https://music.apple.com/us/artist/grocery-bag/1690916530' },
  'Happy Landing': { spotify: 'https://open.spotify.com/artist/2Jsv2nBcTfKpM9dbZcBbk6', appleMusic: 'https://music.apple.com/us/artist/happy-landing/1525416582' },
  'Houndmouth': { spotify: 'https://open.spotify.com/artist/7EGwUS3c5dXduO4sMyLWC5', appleMusic: 'https://music.apple.com/us/artist/houndmouth/552021268' },
  'Hunx and His Punx': { spotify: 'https://open.spotify.com/artist/5xTWck1vHVlTTI0jTQzUuF', appleMusic: 'https://music.apple.com/us/artist/hunx-his-punx/398666859', soundcloud: 'https://soundcloud.com/hunx-and-his-punx' },
  'It\'s Murph': { spotify: 'https://open.spotify.com/artist/3zW0xazqnHoq9QV9zBROVC', appleMusic: 'https://music.apple.com/us/artist/its-murph/1650216419', soundcloud: 'https://soundcloud.com/its-murph-987074444' },
  'Izzy Escobar': { spotify: 'https://open.spotify.com/artist/63iuP8EumHpqaaMKyi0pxO', appleMusic: 'https://music.apple.com/us/artist/izzy-escobar/1411652186', soundcloud: 'https://soundcloud.com/izzyescobar' },
  'Jess Williamson': { spotify: 'https://open.spotify.com/artist/784kOgkd1H6jU4KgPMYHi9', appleMusic: 'https://music.apple.com/us/artist/jess-williamson/501248881' },
  'Jesse Welles': { spotify: 'https://open.spotify.com/artist/366xgdzfRGQoiDRGidGlDJ', appleMusic: 'https://music.apple.com/us/artist/jesse-welles/1737507146', soundcloud: 'https://soundcloud.com/jesse-welles' },
  'Joe Jordan': { appleMusic: 'https://music.apple.com/us/artist/joe-jordan/1681115748' },
  // Not on any of the six schedule images (see the reconciliation note
  // above) — kept here since the link was already verified, in case a
  // future schedule update brings him back.
  'Josh Conway': { appleMusic: 'https://music.apple.com/us/artist/josh-conway/463848254' },
  'Kevin Atwater': { appleMusic: 'https://music.apple.com/us/artist/kevin-atwater/1523576425' },
  'Kings of Leon': { spotify: 'https://open.spotify.com/artist/2qk9voo8llSGYcZ6xrBzKx', appleMusic: 'https://music.apple.com/us/artist/kings-of-leon/1883403', soundcloud: 'https://soundcloud.com/kingsofleon' },
  'Labrinth': { spotify: 'https://open.spotify.com/artist/2feDdbD5araYcm6JhFHHw7', appleMusic: 'https://music.apple.com/us/artist/labrinth/205732582', soundcloud: 'https://soundcloud.com/labrinth' },
  'Łaszewo': { appleMusic: 'https://music.apple.com/us/artist/%C5%82aszewo/1438035296' },
  'Lauren Sanderson': { spotify: 'https://open.spotify.com/artist/06vRrrjT3DBRkhBlXoBdYj', appleMusic: 'https://music.apple.com/us/artist/lauren-sanderson/993820394' },
  'Left Lucid': { appleMusic: 'https://music.apple.com/us/artist/left-lucid/1584511635' },
  'Leon Knight': { appleMusic: 'https://music.apple.com/us/artist/leon-knight/454550073' },
  'Leon Thomas': { spotify: 'https://open.spotify.com/artist/0nnBZ8FXWjG9wZgM2cpfeb', appleMusic: 'https://music.apple.com/us/artist/leon-thomas/267251475', soundcloud: 'https://soundcloud.com/leonthomasmusic' },
  'Levity': { appleMusic: 'https://music.apple.com/us/artist/levity/1505353688' },
  'LLUVII': { appleMusic: 'https://music.apple.com/us/artist/lluvii/1720462063' },
  'Lola Young': { spotify: 'https://open.spotify.com/artist/67FB4n52MgexGQIG8s0yUH', appleMusic: 'https://music.apple.com/us/artist/lola-young/452271760', soundcloud: 'https://soundcloud.com/lolayoung-music' },
  'Lorde': { spotify: 'https://open.spotify.com/artist/163tK9Wjr9P9DmM0AVK7lm', appleMusic: 'https://music.apple.com/us/artist/lorde/602767352', soundcloud: 'https://soundcloud.com/lordemusic' },
  'LP': { spotify: 'https://open.spotify.com/artist/0J7U24vlOOIeMpuaO6Q85A', appleMusic: 'https://music.apple.com/us/artist/lp/516169807', soundcloud: 'https://soundcloud.com/iamlpmusic' },
  'Lykke Li': { spotify: 'https://open.spotify.com/artist/6oBm8HB0yfrIc9IHbxs6in', appleMusic: 'https://music.apple.com/us/artist/lykke-li/263435943', soundcloud: 'https://soundcloud.com/lykkeli' },
  'Marlon Funaki': { appleMusic: 'https://music.apple.com/us/artist/marlon-funaki/1513742282' },
  'Marzz': { appleMusic: 'https://music.apple.com/us/artist/marzz/1475549778' },
  'Max McNown': { spotify: 'https://open.spotify.com/artist/340PS4ZcZ4UCBgyrXzEjcp', appleMusic: 'https://music.apple.com/us/artist/max-mcnown/1682299543' },
  'Molly Santana': { appleMusic: 'https://music.apple.com/us/artist/molly-santana/1589625158' },
  'Montclair': { appleMusic: 'https://music.apple.com/us/artist/montclair/1581652549' },
  'Nat Myers': { spotify: 'https://open.spotify.com/artist/2QMlNryks9wyxBCsBGciTS', appleMusic: 'https://music.apple.com/us/artist/nat-myers/1446778023', soundcloud: 'https://soundcloud.com/natmyersyall' },
  'Natasha Bedingfield': { spotify: 'https://open.spotify.com/artist/7o95ZoZt5ZYn31e9z1Hc0a', appleMusic: 'https://music.apple.com/us/artist/natasha-bedingfield/17768486' },
  'New Constellations': { spotify: 'https://open.spotify.com/artist/5WF5jtgP0H31QTl5g4WxW9', appleMusic: 'https://music.apple.com/us/artist/new-constellations/1543078051', soundcloud: 'https://soundcloud.com/newconstellations-music' },
  'Night Tapes': { spotify: 'https://open.spotify.com/artist/5APEQlUaQ5K70LgPqAdTuU', appleMusic: 'https://music.apple.com/us/artist/night-tapes/1476057311', soundcloud: 'https://soundcloud.com/nighttapes-music' },
  'Night Traveler': { spotify: 'https://open.spotify.com/artist/1Yybte8g5co6ZQaFZdhMQH', appleMusic: 'https://music.apple.com/us/artist/night-traveler/1363342724', soundcloud: 'https://soundcloud.com/nighttravelermusic' },
  'Noga Erez': { spotify: 'https://open.spotify.com/artist/5VwCIS8jdx9ZHjApLFNrTZ', appleMusic: 'https://music.apple.com/us/artist/noga-erez/1166657901', soundcloud: 'https://soundcloud.com/nogaerez' },
  'Palace': { spotify: 'https://open.spotify.com/artist/48vDIufGC8ujPuBiTxY8dm', appleMusic: 'https://music.apple.com/us/artist/palace/899652201', soundcloud: 'https://soundcloud.com/palaceband' },
  'Paloma Morphy': { spotify: 'https://open.spotify.com/artist/30Ph7pfibYhG9VcdOj7xZw', appleMusic: 'https://music.apple.com/us/artist/paloma-morphy/1654342484', soundcloud: 'https://soundcloud.com/palomamorphy' },
  'Parcels': { spotify: 'https://open.spotify.com/artist/3oKRxpszQKUjjaHz388fVA', appleMusic: 'https://music.apple.com/us/artist/parcels/1148094312', soundcloud: 'https://soundcloud.com/parcels-music' },
  'Paris Paloma': { spotify: 'https://open.spotify.com/artist/2EXpthNgSeTDeX8nGwxppp', appleMusic: 'https://music.apple.com/us/artist/paris-paloma/1530898376' },
  // Not on any of the six schedule images (see the reconciliation note
  // above) — kept here since the link was already verified, in case a
  // future schedule update brings her back.
  'Presley Regier': { spotify: 'https://open.spotify.com/artist/7AAHfakMQan4p04ozZhhwc', appleMusic: 'https://music.apple.com/us/artist/presley-regier/1398568172', soundcloud: 'https://soundcloud.com/presleyregier' },
  'Rebecca Black': { spotify: 'https://open.spotify.com/artist/3Vl9fyKMIdLMswk8ai3mm9', appleMusic: 'https://music.apple.com/us/artist/rebecca-black/426285675', soundcloud: 'https://soundcloud.com/rebeccareneeblack' },
  'Rio Kosta': { spotify: 'https://open.spotify.com/artist/4xU7M9wEvpnvkNOyPdVi5y', appleMusic: 'https://music.apple.com/us/artist/rio-kosta/1641407453', soundcloud: 'https://soundcloud.com/riokosta' },
  'Rochelle Jordan': { spotify: 'https://open.spotify.com/artist/3MM3uKNdJbvefUael12dl3', appleMusic: 'https://music.apple.com/us/artist/537708607', soundcloud: 'https://soundcloud.com/rojoproto' },
  'Rodrigo y Gabriela': { spotify: 'https://open.spotify.com/artist/7vX3cMVyW8gtDA4y855ynF', appleMusic: 'https://music.apple.com/mx/artist/68341685', soundcloud: 'https://soundcloud.com/rodgab' },
  'Rubio': { spotify: 'https://open.spotify.com/artist/79YjWaAoD88XGLETIsnnQV', appleMusic: 'https://music.apple.com/ec/artist/34747724' },
  'RÜFÜS DU SOL': { spotify: 'https://open.spotify.com/artist/5Pb27ujIyYb33zBqVysBkj', appleMusic: 'https://music.apple.com/us/artist/799587823', soundcloud: 'https://soundcloud.com/rufusdusol' },
  'Rum Jungle': { spotify: 'https://open.spotify.com/artist/2xQ0QRK08xh3WWBf2RKpsm', appleMusic: 'https://music.apple.com/au/artist/1316375874', soundcloud: 'https://soundcloud.com/rumjungleband' },
  'Rusowsky': { spotify: 'https://open.spotify.com/artist/1XEVu7gdRFfzEFqsPrancH', appleMusic: 'https://music.apple.com/gb/artist/1388592825', soundcloud: 'https://soundcloud.com/rusowsky' },
  'Ryan Beatty': { spotify: 'https://open.spotify.com/artist/60NNvDqsif0u40CXMV6jDQ', appleMusic: 'https://music.apple.com/us/artist/483234172', soundcloud: 'https://soundcloud.com/ryanbeatty' },
  'S.G. Goodman': { spotify: 'https://open.spotify.com/artist/7hzn6FoCsEaUNPnPn7TJWd', appleMusic: 'https://music.apple.com/am/artist/1450439730', soundcloud: 'https://soundcloud.com/sggoodman' },
  'Saint Motel': { spotify: 'https://open.spotify.com/artist/1dWEYMPtNmvSVaDNLgB6NV', appleMusic: 'https://music.apple.com/us/artist/301341347', soundcloud: 'https://soundcloud.com/saintmotel' },
  'Sasha Keable': { spotify: 'https://open.spotify.com/artist/7MxGWmiAbqjNOGmj23wbWf', appleMusic: 'https://music.apple.com/gb/artist/325850892', soundcloud: 'https://soundcloud.com/sasha-keable' },
  'Sienna Spiro': { spotify: 'https://open.spotify.com/artist/02gSuSAWEdWa5UOvqzjX6v', appleMusic: 'https://music.apple.com/us/artist/1745678083', soundcloud: 'https://soundcloud.com/siennaspiro' },
  'Skrillex': { spotify: 'https://open.spotify.com/artist/5he5w2lnU9x7JFhnwcekXX', appleMusic: 'https://music.apple.com/us/artist/356545647', soundcloud: 'https://soundcloud.com/skrillex' },
  'Skye Newman': { spotify: 'https://open.spotify.com/artist/4UoEzpWZrFWvlGYOzTEn1M', appleMusic: 'https://music.apple.com/gb/artist/1799174381' },
  'Snow Strippers': { spotify: 'https://open.spotify.com/artist/6TsAG8Ve1icEC8ydeHm3C8', appleMusic: 'https://music.apple.com/us/artist/snow-strippers/1597165659', soundcloud: 'https://soundcloud.com/snowstrippers' },
  'Sofi Tukker': { spotify: 'https://open.spotify.com/artist/586uxXMyD5ObPuzjtrzO1Q', appleMusic: 'https://music.apple.com/us/artist/sofi-tukker/998656537', soundcloud: 'https://soundcloud.com/sofitukker' },
  'Solomon Hicks': { spotify: 'https://open.spotify.com/artist/1kwMZiFnFBuniUpHpNHEds', appleMusic: 'https://music.apple.com/us/artist/king-solomon-hicks/711917710' },
  'Solya': { spotify: 'https://open.spotify.com/artist/4q2k0Txoo06ZQ41MWnQMza', appleMusic: 'https://music.apple.com/us/artist/solya/1663977507', soundcloud: 'https://soundcloud.com/solya-618179851' },
  'Stella Lefty': { spotify: 'https://open.spotify.com/artist/6hp2uD84OrQ3u3ukmTjLz2', appleMusic: 'https://music.apple.com/us/artist/stella-lefty/1641742186' },
  'Steve Aoki': { spotify: 'https://open.spotify.com/artist/77AiFEVeAVj2ORpC85QVJs', appleMusic: 'https://music.apple.com/us/artist/steve-aoki/271066694', soundcloud: 'https://soundcloud.com/steveaoki' },
  'Suki Waterhouse': { spotify: 'https://open.spotify.com/artist/5GGJosGMs08YEmKTZJe1fL', appleMusic: 'https://music.apple.com/us/artist/suki-waterhouse/926014669', soundcloud: 'https://soundcloud.com/suki_waterhouse' },
  'Sunday (1994)': { spotify: 'https://open.spotify.com/artist/1vTFaCiaR50b2IXELHW52U', appleMusic: 'https://music.apple.com/us/artist/sunday-1994/1728938785' },
  'Temper City': { spotify: 'https://open.spotify.com/artist/5mHUmlJWkcoOk1NbjfrXWz', appleMusic: 'https://music.apple.com/us/artist/temper-city/1872869285' },
  'The 4411': { spotify: 'https://open.spotify.com/artist/7ihRkM2a3CvPVKDkE1ZRnx', appleMusic: 'https://music.apple.com/us/artist/the-4411/1533032757', soundcloud: 'https://soundcloud.com/the4411' },
  'The Chainsmokers': { spotify: 'https://open.spotify.com/artist/69GGBxA162lTqCwzJG5jLp', appleMusic: 'https://music.apple.com/us/artist/the-chainsmokers/580391756', soundcloud: 'https://soundcloud.com/thechainsmokers' },
  'The Moriah Sisters': { appleMusic: 'https://music.apple.com/us/artist/the-moriah-sisters/1266062300' },
  'The War on Drugs': { spotify: 'https://open.spotify.com/artist/6g0mn3tzAds6aVeUYRsryU', appleMusic: 'https://music.apple.com/us/artist/the-war-on-drugs/282078681', soundcloud: 'https://soundcloud.com/thewarondrugs' },
  'The xx': { spotify: 'https://open.spotify.com/artist/3iOvXCl6edW5Um0fXEBRXy', appleMusic: 'https://music.apple.com/us/artist/the-xx/315473044', soundcloud: 'https://soundcloud.com/thexxofficial' },
  'Thomas Day': { spotify: 'https://open.spotify.com/artist/5TwUXL3I6RaLckHy8le2Hq', appleMusic: 'https://music.apple.com/us/artist/thomas-day/1576542827' },
  'Turnstile': { spotify: 'https://open.spotify.com/artist/2qnpHrOzdmOo1S4ox3j17x', appleMusic: 'https://music.apple.com/us/artist/turnstile/4472006', soundcloud: 'https://soundcloud.com/turnstileofficial' },
  'Twenty One Pilots': { spotify: 'https://open.spotify.com/artist/3YQKmKGau1PzlVlkL1iodx', appleMusic: 'https://music.apple.com/us/artist/twenty-one-pilots/349736311', soundcloud: 'https://soundcloud.com/twentyonepilots' },
  'Underscores': { spotify: 'https://open.spotify.com/artist/7HfUJxeVTgrvhk0eWHFzV7', appleMusic: 'https://music.apple.com/us/artist/underscores/1204838812', soundcloud: 'https://soundcloud.com/underscores' },
  'Villanelle': { spotify: 'https://open.spotify.com/artist/3J9QwmRJDdn9Oq1fB6mfcF', appleMusic: 'https://music.apple.com/us/artist/villanelle/1836519194' },
  'VWILLZ': { spotify: 'https://open.spotify.com/artist/0S7eN9KAsbAaIZtFyCn1q1', appleMusic: 'https://music.apple.com/us/artist/vwillz/1483708170' },
  'World Famous Pets': { appleMusic: 'https://music.apple.com/us/artist/world-famous-pets/1896255592' },
  'Young Miko': { spotify: 'https://open.spotify.com/artist/3qsKSpcV3ncke3hw52JSMB', appleMusic: 'https://music.apple.com/us/artist/young-miko/1576521417', soundcloud: 'https://soundcloud.com/youngmiko' },
};
