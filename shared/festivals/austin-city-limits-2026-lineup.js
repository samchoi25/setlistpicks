// Austin City Limits Music Festival 2026 — shared lineup data.
//
// ACL 2026 runs as two near-identical weekends (Oct 2–4 and Oct 9–11), each
// with its own ticket and its own group of festival-goers — so it's modeled
// as two separate festivals, austin-city-limits-2026-week-1.js and
// -week-2.js, both built from this one transcription. Splitting the data out
// here rather than duplicating it into each week file keeps the ~127 acts
// and their links defined exactly once.
//
// Sourcing — two different dates, and one of them is known stale. Read this
// before trusting any part of the file:
//
//   lineupByDay   the 7.22 poster, transcribed at full resolution 2026-08-15:
//                 https://cdn.prod.website-files.com/67456b422d0e4219d58ef713/6a6111875abcb63a45fbce47_ACL26-Admat-ByDay-7.22-Confirmed.webp
//                 ⚠ KNOWN STALE. aclfestival.com/lineup has since replaced
//                 that admat with an 8.21 reissue (different filename and
//                 asset id), checked 2026-08-22:
//                 https://cdn.prod.website-files.com/67456b422d0e4219d58ef713/6a88b39303c21e3978a71fdb_ACL26-Admat-ByDay-8.21.webp
//                 Nobody has re-transcribed against it. The three moves
//                 marked "8.21 schedule update" below were applied by hand
//                 from a summary of that reissue, so those are in; any
//                 *other* change the 8.21 poster carries is silently
//                 missing. Re-read the artwork and diff it against this list
//                 before relying on the lineup being complete.
//
//   placements    the partial per-stage schedule release, 2026-08-21. Names
//                 the stage for the higher-billed acts and for the whole BMI
//                 Stage bill, but not for the rest of the lineup, and gives
//                 no end times. The full grid is published only as six
//                 client-side day images at aclfestival.com/schedule, which
//                 is why the smaller acts are still unplaced. So acts are a
//                 mix of staged and bare entries, and no day is timed yet —
//                 see `placements` for why that is forced, not a choice.
//
// An act billed [W1] or [W2] on the poster plays only that weekend; no tag
// means both. Encoded below as a bare string (both weekends) or a
// `[name, 'W1' | 'W2']` tuple (one weekend only) — weekLineup() filters and
// unwraps these into the plain string list each week's `sets` needs.
const lineupByDay = {
  fri: [
    'Charli XCX',
    ['Skrillex', 'W1'],
    ['Kings of Leon', 'W2'],
    'Turnstile',
    'Labrinth',
    'The Chainsmokers',
    'Leon Thomas',
    ['Brandon Flowers', 'W1'],
    'Amyl and the Sniffers',
    'Steve Aoki',
    'Jesse Welles',
    'BUNT.',
    ['Bella Kay', 'W2'],
    // 8.21 schedule update: moved off Saturday; plays Friday of W2.
    ['Sienna Spiro', 'W2'],
    'Paris Paloma',
    'LP',
    'Rusowsky',
    ['Natasha Bedingfield', 'W2'],
    ['Marlon Funaki', 'W1'],
    // 8.21 schedule update: dropped from week 2; W1 only now.
    ['CMAT', 'W1'],
    ['Rebecca Black', 'W1'],
    ['Bo Staloch', 'W1'],
    ['Molly Santana', 'W1'],
    ['World Famous Pets', 'W2'],
    'Faouzia',
    ['Hunx and His Punx', 'W1'],
    ['New Constellations', 'W1'],
    ['Asleep at the Wheel', 'W1'],
    ['S.G. Goodman', 'W2'],
    ['Cassandra Coleman', 'W2'],
    ['Brigitte Calls Me Baby', 'W2'],
    ['Dallas Wax', 'W2'],
    ['Night Traveler', 'W1'],
    ['Grocery Bag', 'W1'],
    ['Joe Jordan', 'W2'],
    ['Happy Landing', 'W2'],
    ['Girlfriend', 'W2'],
    ['Elle Coves', 'W1'],
    ['Izzy Escobar', 'W1'],
    ['Almost Heaven', 'W2'],
    ['Solomon Hicks', 'W1'],
    ['Leon Knight', 'W2'],
    ['The 4411', 'W1'],
  ],
  sat: [
    'RÜFÜS DU SOL',
    'Lorde',
    'Lola Young',
    'Young Miko',
    'Bleachers',
    'Lykke Li',
    'Levity',
    'Suki Waterhouse',
    // 8.21 schedule update: moved off Friday; plays Saturday of W2.
    ['Łaszewo', 'W2'],
    'Snow Strippers',
    "It's Murph",
    'Fakemink',
    ['Palace', 'W1'],
    '¥ØU$UK€ ¥UK1MAT$U',
    'Skye Newman',
    'Rodrigo y Gabriela',
    'Balu Brigada',
    ['Rochelle Jordan', 'W1'],
    'Arcy Drive',
    'Finn Wolfhard',
    'Ryan Beatty',
    'Don West',
    'Temper City',
    ['Gabriel Jacoby', 'W2'],
    'Annie DiRusso',
    'Night Tapes',
    ['DJ Cassandra', 'W1'],
    ['Cure for Paranoia', 'W1'],
    ['Nat Myers', 'W2'],
    ['Chloe Qisha', 'W2'],
    ['Fai Laci', 'W1'],
    ['Emma Ogier', 'W1'],
    ['Common People', 'W2'],
    ['Coleman Jennings', 'W1'],
    ['Damaris Bojor', 'W2'],
    ['Fightmaster', 'W1'],
    ['LLUVII', 'W2'],
    ['Montclair', 'W2'],
    ['Left Lucid', 'W1'],
    ['Presley Regier', 'W2'],
  ],
  sun: [
    'Twenty One Pilots',
    'The xx',
    'Geese',
    'Sofi Tukker',
    'Parcels',
    'The War on Drugs',
    'Blood Orange',
    'Max McNown',
    ['Cannons', 'W1'],
    'Audrey Hobert',
    'Saint Motel',
    ['Houndmouth', 'W2'],
    'FCUKERS',
    ['Stella Lefty', 'W1'],
    ['Underscores', 'W1'],
    'Claire Rosinkranz',
    'Noga Erez',
    ['Dexter and the Moonrocks', 'W1'],
    ['Grace Ives', 'W2'],
    'Rio Kosta',
    ['Josh Conway', 'W1'],
    ['Ethan Regan', 'W2'],
    ['Bad Nerves', 'W2'],
    ['Charlotte Lawrence', 'W2'],
    'Paloma Morphy',
    'Sunday (1994)',
    ['Rum Jungle', 'W2'],
    'Calder Allen',
    ['Fancy Hagood', 'W1'],
    ['Britton', 'W1'],
    ['Solya', 'W1'],
    ['Villanelle', 'W1'],
    ['Jess Williamson', 'W1'],
    ['Kevin Atwater', 'W2'],
    ['Thomas Day', 'W2'],
    ['Aaron Rowe', 'W1'],
    ['Lauren Sanderson', 'W1'],
    ['VWILLZ', 'W2'],
    ['Sasha Keable', 'W2'],
    ['Rubio', 'W1'],
    ['Marzz', 'W2'],
    ['Chelsea Jordan', 'W2'],
    ['The Moriah Sisters', 'W1'],
    ['The Huston-Tillotson University Jazz Collective', 'W2'],
  ],
};


// The seven stages ACL 2026 runs, in the order the schedule lists them.
// Same stages both weekends, so they live here alongside the lineup rather
// than being duplicated into each week file. Tito's and BeatBox have no
// placed acts yet; buildFestival() drops stages with no sets from a day's
// columns, so carrying them here costs nothing and documents the full set.
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

// Stage and start time per act, from the partial schedule release, as
// `[stageId | null, 'HH:MM' | null]`. Both weekends play the same stage at
// the same time, so one map covers them; the acts absent from it had neither
// announced and stay bare strings in the day's stageless pool.
//
// The start times are recorded but deliberately NOT rendered as timed sets.
// A day has to be entirely timed or entirely untimed — dayModeOf() in
// shared/festival.js throws on a mix — and only 24 of the ~127 acts have a
// time, so emitting these as `[stage, start, end, artist]` would break both
// week festivals outright. They would also need end times, which the release
// doesn't give. What they do here is order each stage's column so it reads
// top-down in the order the acts actually play, which is real signal the
// bare alphabetical pool can't carry; and they're the transcription to build
// the timed days from once the rest of the grid and set lengths are out.
const placements = {
  // ── Friday ────────────────────────────────────────────────────────────
  'Asleep at the Wheel':   ['tmobile',    '13:00'],
  'Hunx and His Punx':     ['amex',       '13:15'],
  'Amyl and the Sniffers': ['amex',       '16:30'],
  'Turnstile':             ['tmobile',    '18:15'],
  'Labrinth':              ['amex',       '18:30'],
  'Leon Thomas':           ['millerlite', '19:15'],
  'The Chainsmokers':      ['snapchat',   '19:30'],
  // The Friday co-headline slot: Skrillex plays it W1, Kings of Leon W2.
  'Skrillex':              ['tmobile',    '20:15'],
  'Kings of Leon':         ['tmobile',    '20:15'],
  'Charli XCX':            ['amex',       '20:40'],

  // ── Saturday ──────────────────────────────────────────────────────────
  'Young Miko':            [null,         '16:30'],
  'Bleachers':             [null,         '18:15'],
  'Lola Young':            [null,         '18:30'],
  'Levity':                [null,         '19:15'],
  'Lykke Li':              [null,         '19:30'],
  'Lorde':                 ['tmobile',    '20:15'],
  'RÜFÜS DU SOL':          ['amex',       '20:30'],

  // ── Sunday ────────────────────────────────────────────────────────────
  'Geese':                 [null,         '18:30'],
  'Sofi Tukker':           [null,         '18:30'],
  'Parcels':               [null,         '19:30'],
  'Blood Orange':          [null,         '19:30'],
  'The War on Drugs':      [null,         '19:30'],
  'The xx':                ['tmobile',    '20:30'],
  'Twenty One Pilots':     ['amex',       '20:30'],

  // ── BMI Stage ─────────────────────────────────────────────────────────
  // The release named the full BMI bill but no individual set times, so
  // these sort alphabetically at the foot of the column rather than in a
  // play order that isn't known.
  'Elle Coves':      ['bmi', null],
  'Girlfriend':      ['bmi', null],
  'Grocery Bag':     ['bmi', null],
  'Izzy Escobar':    ['bmi', null],
  'Joe Jordan':      ['bmi', null],
  'Leon Knight':     ['bmi', null],
  'Chloe Qisha':     ['bmi', null],
  'Coleman Jennings':['bmi', null],
  'Common People':   ['bmi', null],
  'Damaris Bojor':   ['bmi', null],
  'Emma Ogier':      ['bmi', null],
  'Fai Laci':        ['bmi', null],
  'Fightmaster':     ['bmi', null],
  'Aaron Rowe':      ['bmi', null],
  'Chelsea Jordan':  ['bmi', null],
  'Fancy Hagood':    ['bmi', null],
  'Lauren Sanderson':['bmi', null],
  'Marzz':           ['bmi', null],
  'Rubio':           ['bmi', null],
  'Sasha Keable':    ['bmi', null],
  'VWILLZ':          ['bmi', null],
};

// A placement keyed by a name that isn't in the lineup — a typo, or an act
// named in a schedule release but never transcribed off the poster — would
// silently do nothing, so fail loudly at import instead.
const lineupNames = new Set(
  Object.values(lineupByDay).flatMap((day) =>
    day.map((e) => (typeof e === 'string' ? e : e[0])),
  ),
);
const stageIds = new Set(stages.map((s) => s.id));
for (const [name, [stageId]] of Object.entries(placements)) {
  if (!lineupNames.has(name)) {
    throw new Error(`ACL 2026: placement for '${name}', who is not in the lineup`);
  }
  if (stageId !== null && !stageIds.has(stageId)) {
    throw new Error(`ACL 2026: placement for '${name}' names unknown stage '${stageId}'`);
  }
}

// Filters lineupByDay down to one weekend's `sets` shape: `[stageId, name]`
// for an act `placements` puts on a stage, a bare name for one it doesn't
// (see entryKind() in shared/festival.js). Both-weekend and single-weekend
// acts resolve the same way once the week is known.
//
// Staged acts are emitted in stage order, then by start time, so each stage
// column reads in play order — buildUntimedDay keeps the order it's given
// within a stage, treating it as the flyer's own. Acts with no announced
// time sort last, alphabetically. Unstaged acts trail behind in any order;
// buildUntimedDay alphabetizes that pool itself.
const NO_TIME = '99:99';

export function weekLineup(week) {
  const tag = week === 1 ? 'W1' : 'W2';
  const stageRank = new Map(stages.map((s, i) => [s.id, i]));
  const out = {};
  for (const [day, entries] of Object.entries(lineupByDay)) {
    const names = entries
      .filter((e) => typeof e === 'string' || e[1] === tag)
      .map((e) => (typeof e === 'string' ? e : e[0]));
    const staged = names.filter((n) => placements[n]?.[0]);
    const unstaged = names.filter((n) => !placements[n]?.[0]);
    staged.sort((a, b) => {
      const [stageA, startA] = placements[a];
      const [stageB, startB] = placements[b];
      return stageRank.get(stageA) - stageRank.get(stageB)
        || (startA ?? NO_TIME).localeCompare(startB ?? NO_TIME)
        || a.localeCompare(b);
    });
    out[day] = [...staged.map((n) => [placements[n][0], n]), ...unstaged];
  }
  return out;
}

// Spotify/Apple Music/SoundCloud links, shown on long-press (see
// ArtistPopup.jsx). None of this is published by the festival itself (no
// per-artist API the way Portola/AEG-produced festivals have) — every entry
// was found and verified individually (name, bio, genre and/or a matching
// "Zilker Park Parking, Austin" tour date, not just first search hit) on
// 2026-08-15, using a mix of web search, MusicBrainz's editor-verified
// cross-platform artist relationships, and Apple's iTunes Search API.
// Omitted entirely where nothing could be confidently verified: Aaron Rowe,
// Chelsea Jordan, Coleman Jennings, Don West, Girlfriend, and The
// Huston-Tillotson University Jazz Collective — all smaller acts with
// enough same-named collisions elsewhere that guessing felt worse than
// leaving them blank.
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
