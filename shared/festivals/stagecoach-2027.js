// Stagecoach 2027 — California's Country Music Festival, April 23–25, 2027,
// Empire Polo Club, Indio. Festival definition.
//
// Sources, gathered 2026-11-16:
//   - The act list is Goldenvoice's own: the 57 artist records behind
//     https://www.stagecoachfestival.com/lineup/ (AEG data path
//     734/VxmaxY3QikS6cXoD). Spellings and capitalisation follow those
//     records (HARDY, ERNEST, DASHA, STELLA LEFTY). They carry no day.
//   - Days and billing order come from JamBase
//     (https://www.jambase.com/festival/stagecoach-2027) and LineupScout
//     (https://lineupscout.com/stagecoach), which agree act for act and in
//     order on all 54 acts they date, 18 per day.
//
// Judgement calls worth knowing about:
//   - Florida Georgia Line, Sean Paul and Flo Rida are billed for the late-night
//     Mustang stage with no day on JamBase or LineupScout. TickPick's lineup
//     guide places them Saturday, Friday and Sunday respectively, so they sit
//     at the end of those days. Move them if Goldenvoice says otherwise.
//   - Both aggregators list a 58th act, Diplo (a "Honkytonk" DJ set), which
//     isn't among Goldenvoice's 57 records. Left out until it is.
//
// STAGES AND SET TIMES ARE UNANNOUNCED. Each day is bare-string entries (see
// dayModeOf()/buildUntimedDay() in shared/festival.js), rendering as one
// alphabetical list per day. When the schedule lands, swap them for
// `[stageId, 'HH:MM', 'HH:MM', 'Artist']` and fill in `stages` (Mane Stage,
// Palomino, Mustang, Toyota Music Den…) — set ids are derived from day +
// position, so votes cast before then won't carry across.

const slug = 'stagecoach-2027';

const days = [
  { id: 'fri', name: 'Friday', date: 'Apr 23' },
  { id: 'sat', name: 'Saturday', date: 'Apr 24' },
  { id: 'sun', name: 'Sunday', date: 'Apr 25' },
];

const sets = {
  fri: [
    'Riley Green',
    'HARDY',
    'Brothers Osborne',
    'Cody Jinks',
    'Shaboozey',
    'Dylan Gossett',
    'STELLA LEFTY',
    'Gretchen Wilson',
    'Joshua Slone',
    'Jo Dee Messina',
    'Kaitlin Butts',
    'Cameron Whitcomb',
    'Elizabeth Nichols',
    'Owen Riegling',
    'Tyce Delk',
    'Wade Forster',
    'Jacob Hackworth',
    'Jonas Conner',
    'Sean Paul',
  ],
  sat: [
    'Zach Top',
    'Willie Nelson & Family',
    'Journey',
    'Charley Crockett',
    'Stephen Wilson Jr.',
    'The Fray',
    'DASHA',
    'Tedeschi Trucks Band',
    'Maoli',
    'Vincent Mason',
    'Waylon Wyatt',
    'Carter Faith',
    'Ingrid Andress',
    'Mack Geiger',
    'Gustavo Mioto',
    'Maggie Antone',
    'Kevin Powers',
    'Jason Scott & The High Heat',
    'Florida Georgia Line',
  ],
  sun: [
    'Garth Brooks',
    'Kelly Clarkson',
    'Pitbull',
    'Turnpike Troubadours',
    'Carín León',
    'Matchbox Twenty',
    'David Lee Roth',
    'Buffalo Traffic Jam',
    'Hudson Westbrook',
    'ERNEST',
    'Melissa Etheridge',
    'Chris Lane',
    'Blake Whiten',
    'Dylan Marlowe',
    'Laci Kaye Booth',
    'Mackenzie Carpenter',
    'Tyler Nance',
    'Dalton Davis',
    'Flo Rida',
  ],
};

// Artist links: Spotify from Goldenvoice's own artist records, SoundCloud and
// Apple Music via MusicBrainz, the rest of Apple Music from iTunes Search on a
// single exact-name match, each checked against the act's genre. Left out:
// Chris Lane, Kevin Powers (several same-named artists) and Willie Nelson &
// Family (billed as a group no service carries under that name).
export const artistLinks = {
  'Blake Whiten': { spotify: 'https://open.spotify.com/artist/1BjlNhp6EsDG0UMroeJbRM', appleMusic: 'https://music.apple.com/us/artist/1761470610' },
  'Brothers Osborne': { spotify: 'https://open.spotify.com/artist/39NR3AUhpbbqKM33vWn2fp', appleMusic: 'https://music.apple.com/us/artist/695313023', soundcloud: 'https://soundcloud.com/brothers-osborne' },
  'Buffalo Traffic Jam': { spotify: 'https://open.spotify.com/artist/22LEPYRDhoThnbpShy6fV7', appleMusic: 'https://music.apple.com/us/artist/1744636210' },
  'Cameron Whitcomb': { spotify: 'https://open.spotify.com/artist/6dhXvR5MsnlwYguRuqoapR', appleMusic: 'https://music.apple.com/ca/artist/1542957700' },
  'Carter Faith': { spotify: 'https://open.spotify.com/artist/4X5CTYQmx1NNyz9S1IpNko', appleMusic: 'https://music.apple.com/us/artist/1489205896' },
  'Carín León': { spotify: 'https://open.spotify.com/artist/66ihevNkSYNzRAl44dx6jJ', appleMusic: 'https://music.apple.com/us/artist/1370196486', soundcloud: 'https://soundcloud.com/carinleon' },
  'Charley Crockett': { spotify: 'https://open.spotify.com/artist/3BJX1nYizKvWpZTY5HOAr4', appleMusic: 'https://music.apple.com/us/artist/987849844' },
  'Cody Jinks': { appleMusic: 'https://music.apple.com/us/artist/cody-jinks/363412711' },
  'DASHA': { spotify: 'https://open.spotify.com/artist/7Ez6lTtSMjMf2YSYpukP1I', appleMusic: 'https://music.apple.com/us/artist/1462663731' },
  'Dalton Davis': { spotify: 'https://open.spotify.com/artist/6J9RN4Pef3aGhMaIPt4d6B' },
  'David Lee Roth': { spotify: 'https://open.spotify.com/artist/0KyCXNSa7ZMb5LydfKbLG3', appleMusic: 'https://music.apple.com/us/artist/187035', soundcloud: 'https://soundcloud.com/david-lee-roth' },
  'Dylan Gossett': { spotify: 'https://open.spotify.com/artist/4H4M0Y4cN39zIVDHvdW53x', appleMusic: 'https://music.apple.com/us/artist/1526025679' },
  'Dylan Marlowe': { spotify: 'https://open.spotify.com/artist/0ZZLr8EH3aNFzYpXtaTIax', appleMusic: 'https://music.apple.com/gb/artist/1286815085' },
  'ERNEST': { spotify: 'https://open.spotify.com/artist/4GGfAshSkqoxpZdoaHm7ky' },
  'Elizabeth Nichols': { spotify: 'https://open.spotify.com/artist/06cAJQBSPkt3bG7uMoWfmA', appleMusic: 'https://music.apple.com/us/artist/elizabeth-nichols/1781318321' },
  'Flo Rida': { spotify: 'https://open.spotify.com/artist/0jnsk9HBra6NMjO2oANoPY', appleMusic: 'https://music.apple.com/us/artist/255303209', soundcloud: 'https://soundcloud.com/official_flo' },
  'Florida Georgia Line': { spotify: 'https://open.spotify.com/artist/3b8QkneNDz4JHKKKlLgYZg', appleMusic: 'https://music.apple.com/us/artist/399241518' },
  'Garth Brooks': { appleMusic: 'https://music.apple.com/us/artist/garth-brooks/329451' },
  'Gretchen Wilson': { spotify: 'https://open.spotify.com/artist/0IdYRFTswLdsGwSnzOaGNF', appleMusic: 'https://music.apple.com/gb/artist/6838616', soundcloud: 'https://soundcloud.com/gretchen-wilson-official' },
  'Gustavo Mioto': { spotify: 'https://open.spotify.com/artist/1X6ORK7IekgmyjV6IFPszP', appleMusic: 'https://music.apple.com/us/artist/gustavo-mioto/976743661' },
  'HARDY': { spotify: 'https://open.spotify.com/artist/5QNm7E7RU2m64l6Gliu8Oy', appleMusic: 'https://music.apple.com/us/artist/1438874739' },
  'Hudson Westbrook': { spotify: 'https://open.spotify.com/artist/0C4gtx1iHMfuaQ73GKWvtZ', appleMusic: 'https://music.apple.com/us/artist/1740125054' },
  'Ingrid Andress': { spotify: 'https://open.spotify.com/artist/0jPnVIasXzBYjrlpO5irii', appleMusic: 'https://music.apple.com/us/artist/404574146', soundcloud: 'https://soundcloud.com/ingridandress' },
  'Jacob Hackworth': { spotify: 'https://open.spotify.com/artist/4uXRM5wXBQkzYXPannKV66', appleMusic: 'https://music.apple.com/us/artist/jacob-hackworth/1505896509' },
  'Jason Scott & The High Heat': { spotify: 'https://open.spotify.com/artist/03IlJFWZVEYHlSKSBYlfAm', appleMusic: 'https://music.apple.com/us/artist/jason-scott-the-high-heat/1770828691' },
  'Jo Dee Messina': { spotify: 'https://open.spotify.com/artist/3ltFy7g6KKQPPttsdOMlq3', appleMusic: 'https://music.apple.com/gb/artist/15136745' },
  'Jonas Conner': { appleMusic: 'https://music.apple.com/us/artist/jonas-conner/1775933996' },
  'Joshua Slone': { spotify: 'https://open.spotify.com/artist/2rkJFJhJwqL5ZKbPoFwFN9', appleMusic: 'https://music.apple.com/us/artist/1633809648' },
  'Journey': { spotify: 'https://open.spotify.com/artist/0rvjqX7ttXeg3mTy8Xscbt', appleMusic: 'https://music.apple.com/us/artist/486597' },
  'Kaitlin Butts': { spotify: 'https://open.spotify.com/artist/6QmSTo72BYMATkQVOV1axD', appleMusic: 'https://music.apple.com/us/artist/650660366' },
  'Kelly Clarkson': { spotify: 'https://open.spotify.com/artist/3BmGtnKgCSGYIUhmivXKWX', appleMusic: 'https://music.apple.com/us/artist/316265', soundcloud: 'https://soundcloud.com/kellyclarksonofficial' },
  'Laci Kaye Booth': { spotify: 'https://open.spotify.com/artist/6Gd7wERviclMCCWOG8qVR4', appleMusic: 'https://music.apple.com/gb/artist/1226731184' },
  'Mack Geiger': { spotify: 'https://open.spotify.com/artist/1ylRveckaItA2kOhQh8rnQ', appleMusic: 'https://music.apple.com/ca/artist/1793284156' },
  'Mackenzie Carpenter': { spotify: 'https://open.spotify.com/artist/1gYlQ5LjfQz9QPaCApCsDZ', appleMusic: 'https://music.apple.com/us/artist/1545066309' },
  'Maggie Antone': { spotify: 'https://open.spotify.com/artist/6mEP6006jfAcrzLbxyEZxp', appleMusic: 'https://music.apple.com/ca/artist/1648278605' },
  'Maoli': { spotify: 'https://open.spotify.com/artist/6EKzehEG2fwJtRMH4KbjsA' },
  'Matchbox Twenty': { spotify: 'https://open.spotify.com/artist/3Ngh2zDBRPEriyxQDAMKd1', appleMusic: 'https://music.apple.com/us/artist/matchbox-twenty/711111' },
  'Melissa Etheridge': { spotify: 'https://open.spotify.com/artist/01Ppu7N8uYJI8SAONo2YZA', appleMusic: 'https://music.apple.com/us/artist/117519', soundcloud: 'https://soundcloud.com/melissaetheridge' },
  'Owen Riegling': { appleMusic: 'https://music.apple.com/us/artist/owen-riegling/1471251438' },
  'Pitbull': { spotify: 'https://open.spotify.com/artist/0TnOYISbd1XYRBk9myaseg', appleMusic: 'https://music.apple.com/us/artist/27044968', soundcloud: 'https://soundcloud.com/pitbull' },
  'Riley Green': { spotify: 'https://open.spotify.com/artist/2QMsj4XJ7ne2hojxt6v5eb', appleMusic: 'https://music.apple.com/us/artist/662432971' },
  'STELLA LEFTY': { spotify: 'https://open.spotify.com/artist/6hp2uD84OrQ3u3ukmTjLz2', appleMusic: 'https://music.apple.com/us/artist/1641742186' },
  'Sean Paul': { spotify: 'https://open.spotify.com/artist/3Isy6kedDrgPYoTS1dazA9', appleMusic: 'https://music.apple.com/jm/artist/155138', soundcloud: 'https://soundcloud.com/seanpaul2' },
  'Shaboozey': { spotify: 'https://open.spotify.com/artist/3y2cIKLjiOlp1Np37WiUdH', appleMusic: 'https://music.apple.com/gb/artist/914125510', soundcloud: 'https://soundcloud.com/shaboozey' },
  'Stephen Wilson Jr.': { spotify: 'https://open.spotify.com/artist/4DSDa4HvAWqvb3dMHUOAfd', appleMusic: 'https://music.apple.com/us/artist/1456928834' },
  'Tedeschi Trucks Band': { spotify: 'https://open.spotify.com/artist/2gFsmDBM0hkoZPmrO5EdyO', appleMusic: 'https://music.apple.com/us/artist/433405113' },
  'The Fray': { spotify: 'https://open.spotify.com/artist/0zOcE3mg9nS6l3yxt1Y0bK', appleMusic: 'https://music.apple.com/us/artist/31239777', soundcloud: 'https://soundcloud.com/the_fray' },
  'Turnpike Troubadours': { spotify: 'https://open.spotify.com/artist/1YSA4byX5AL1zoTsSTlB03', appleMusic: 'https://music.apple.com/us/artist/turnpike-troubadours/271045477' },
  'Tyce Delk': { spotify: 'https://open.spotify.com/artist/75jIXNJTz4SWN3gNpKGy6f' },
  'Tyler Nance': { spotify: 'https://open.spotify.com/artist/38zCEnwAxIJWMCeMd9tO7z', appleMusic: 'https://music.apple.com/us/artist/tyler-nance/1484602101' },
  'Vincent Mason': { spotify: 'https://open.spotify.com/artist/6QJ5CE7ujPr7oZCURhFZVS', appleMusic: 'https://music.apple.com/us/artist/1602781449' },
  'Wade Forster': { appleMusic: 'https://music.apple.com/us/artist/wade-forster/1576096307' },
  'Waylon Wyatt': { spotify: 'https://open.spotify.com/artist/6Ff2omMMZOd8FWNqb980Ol', appleMusic: 'https://music.apple.com/us/artist/1713519329' },
  'Zach Top': { spotify: 'https://open.spotify.com/artist/4FGPzWzgjURDNT7JQ8pYgH', appleMusic: 'https://music.apple.com/us/artist/1350125124' },
};

// Palette from stagecoachfestival.com (read 2026-11-16): a deep desert-night
// teal (#012F44) under cream type (#FFF5E3), with marigold (#F6C140) buttons
// and an orange accent (#E48500). The site is dark, but the grid's vote washes
// multiply onto the page, so this flips it: cream ground, teal ink, the gold
// kept for the secondary button. Lineup blocks and primary buttons take the
// site's mid teal (#255B6A) rather than the navy: white reads on it, and it
// is light enough for the Want/Must See washes, which multiply onto the
// block, to show. Headings are a distressed western slab
// (Vicente); Rye is the allowlisted face closest to it.
const theme = {
  tokens: {
    '--bg': '#F6E9CF',
    '--paper': '#FFF5E3',
    '--ink': '#012F44',
    '--btn-primary': '#255B6A',
    '--btn-secondary': '#F6C140',
    '--on-btn-secondary': '#0E0E0C',
    '--block-ink': '#FFFFFF',
    '--font-display': 'rye',
    '--font-body': 'montserrat',
  },
};

export default {
  slug,
  theme,
  name: 'Stagecoach 2027',
  shortName: 'Stagecoach',
  dateRange: 'April 23–25, 2027',
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
  officialUrl: 'https://www.stagecoachfestival.com/lineup/',
  dataVerifiedOn: '2026-11-16',
  headliners: ['Riley Green', 'Zach Top', 'Garth Brooks'],
  notableActs: ['Willie Nelson & Family', 'Kelly Clarkson', 'Journey', 'HARDY', 'Pitbull', 'Brothers Osborne'],
  stages: [],
  days,
  sets,
  artistLinks,
  groupNames: [
    'Mane Stage Mavericks', 'Palomino Posse', 'Mustang Mob', 'Polo Field Pardners',
    'Indio Outlaws', 'Honky Tonk Herd', 'Desert Rodeo Crew', 'Boot Scoot Brigade',
    'Tailgate Troupe', 'Coachella Valley Cowpokes', 'Two-Step Squad', 'Lasso Legends',
  ],
};
