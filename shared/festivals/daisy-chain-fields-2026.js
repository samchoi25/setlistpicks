// Daisy Chain Fields 2026 — festival definition.
//
// Pure data: no schedule is built here. buildFestival() in shared/festival.js
// turns this into placed blocks, lanes and grid bounds.
//
// Source: the official schedule poster at
// https://www.daisychainfields.com/schedule — the page renders it as a single
// image (DCF26_Schedule-08.12.webp), so these times were read off the artwork
// at full resolution rather than scraped. Re-check against the poster if it is
// reissued; the footer warns times are subject to change.
//
// A one-day festival, so `days` has a single entry.
//
// Format per set: [stageId, 'HH:MM start', 'HH:MM end', 'Artist', meta?]
// All times are PT (24h).

const slug = 'daisy-chain-fields-2026';

// The poster colours Dandelion pink and Marigold yellow — matched here rather
// than guessing from the flower names.
const stages = [
  { id: 'dandelion', name: 'Dandelion Stage', short: 'DAN', color: '--pink-carnation', headerColor: '--daisy-chain-fields-2026-dandelion-header' },
  { id: 'marigold',  name: 'Marigold Stage',  short: 'MAR', color: '--marigold-gold', headerColor: '--daisy-chain-fields-2026-marigold-header' },
];

const days = [
  { id: 'sat', name: 'Saturday', date: 'Aug 29' },
];

// `asl: true` marks the performances the poster flags as ASL-interpreted.
// Carried through to each block; the grid does not surface it yet.
const asl = { asl: true };

// Each set: [stageId, start, end, artist, meta?]
const sets = {
  sat: [
    // ── Dandelion Stage ─────────────────────────────────────────────────
    ['dandelion', '11:55', '12:25', 'ELI'],
    ['dandelion', '13:05', '13:35', 'Santigold'],
    ['dandelion', '14:15', '14:45', 'KATSEYE'],
    ['dandelion', '15:40', '16:20', 'Mitski'],
    ['dandelion', '17:20', '18:00', 'Doechii', asl],
    ['dandelion', '19:00', '19:40', 'Chappell Roan', asl],
    ['dandelion', '20:40', '22:00', 'Olivia Rodrigo & Special Guests', asl],

    // ── Marigold Stage ──────────────────────────────────────────────────
    ['marigold', '11:20', '11:50', 'Quiet Light'],
    ['marigold', '12:30', '13:00', 'Rachel Chinouriri'],
    ['marigold', '13:40', '14:10', 'Die Spitz'],
    ['marigold', '14:50', '15:30', 'Bikini Kill', asl],
    ['marigold', '16:30', '17:10', 'The Breeders', asl],
    ['marigold', '18:10', '18:50', 'Garbage', asl],
    ['marigold', '19:50', '20:30', 'Not for Radio'],
  ],
};

// Theme. Sampled from daisychainfields.com: grass green (#88C55D) ground,
// poster pink (#E06287), poster yellow (#F8E165), near-black ink.
//
// The one festival here that keeps a poster colour exactly — the marigold
// yellow is untouched — because this is the only palette pale enough to carry
// dark block text. The dandelion pink is softened well past the poster's: at
// its real value neither white nor dark text reaches 4.5:1 once the
// highlighter wash lands on it.
const theme = {
  tokens: {
    '--bg': '#88C55D',
    '--paper': '#F2F7EC',
    '--ink': '#231F20',
    '--btn-secondary': '#8A3A52',
    '--block-ink': '#231F20',
    '--pink-carnation': '#F7D5DF',
    '--marigold-gold': '#F8E165',
    '--daisy-chain-fields-2026-dandelion-header': '#703144',
    '--daisy-chain-fields-2026-marigold-header': '#4D461F',
    '--font-display': 'playfair-display',
    '--font-body': 'montserrat',
  },
};

// Artist links: MusicBrainz exact-name matches (one unambiguous artist
// only), taking that artist's Spotify / Apple Music / SoundCloud links;
// each Spotify link was fetched and its page title checked against the
// billing. Acts with several same-named artists are left out.
const artistLinks = {
  'Bikini Kill': { spotify: 'https://open.spotify.com/artist/0gvHPdYxlU94W7V5MSIlFe', appleMusic: 'https://music.apple.com/us/artist/2893586' },
  'Chappell Roan': { spotify: 'https://open.spotify.com/artist/7GlBOeep6PqTfFi59PTUUN', appleMusic: 'https://music.apple.com/us/artist/1264818718', soundcloud: 'https://soundcloud.com/chappellroan' },
  'Die Spitz': { spotify: 'https://open.spotify.com/artist/0zfZmpHTu0MlkkNr5KHeXE', appleMusic: 'https://music.apple.com/gb/artist/1545875931' },
  'Doechii': { spotify: 'https://open.spotify.com/artist/4E2rKHVDssGJm2SCDOMMJB', appleMusic: 'https://music.apple.com/fr/artist/1437641643', soundcloud: 'https://soundcloud.com/iam-doechii' },
  'KATSEYE': { spotify: 'https://open.spotify.com/artist/3c0gDdb9lhnHGFtP4prQpn', appleMusic: 'https://music.apple.com/us/artist/1754284416' },
  'Mitski': { spotify: 'https://open.spotify.com/artist/2uYWxilOVlUdk4oV9DvwqK', appleMusic: 'https://music.apple.com/us/artist/497546276', soundcloud: 'https://soundcloud.com/mitskiofficial' },
  'Not for Radio': { spotify: 'https://open.spotify.com/artist/0oXhGlRUQ8aVTx8eO4MoMT', soundcloud: 'https://soundcloud.com/notforradio' },
  'Rachel Chinouriri': { spotify: 'https://open.spotify.com/artist/4wrzxtBZw20ufDstKyTnnP', appleMusic: 'https://music.apple.com/gb/artist/1033202344', soundcloud: 'https://soundcloud.com/rachel-chinouriri' },
  'Santigold': { spotify: 'https://open.spotify.com/artist/6Jrxnp0JgqmeUX1veU591p', soundcloud: 'https://soundcloud.com/santigold' },
  'The Breeders': { spotify: 'https://open.spotify.com/artist/1xgFexIwrf2QjbU0buCNnp', appleMusic: 'https://music.apple.com/us/artist/790125', soundcloud: 'https://soundcloud.com/thebreeders' },
};

export default {
  slug,
  artistLinks,
  name: 'Daisy Chain Fields 2026',
  shortName: 'Daisy Chain Fields',
  year: 2026,
  venue: 'Great Park, Irvine',
  place: {
    name: 'Great Park',
    addressLocality: 'Irvine',
    addressRegion: 'CA',
    addressCountry: 'US',
  },
  utcOffset: '-07:00',
  dateRange: 'August 29, 2026',
  officialUrl: 'https://www.daisychainfields.com/schedule',
  dataVerifiedOn: '2026-08-12',
  headliners: ['Olivia Rodrigo & Special Guests', 'Chappell Roan', 'Doechii', 'Mitski'],
  notableActs: ['Bikini Kill', 'The Breeders', 'Garbage', 'Santigold', 'KATSEYE'],
  theme,
  stages,
  days,
  sets,
  groupNames: [
    'Daisy Chain Gang', 'Flower Crown Crew', 'Great Park Getaway', 'Petal Pushers',
    'Field Day Fam', 'Orange County Outlaws', 'Wildflower Wanderers', 'Meadow Mob',
    'Sunkissed Squad', 'Balloon Ranch Bunch', 'Chain Reaction Crew', 'SoCal Sunshine Crew',
  ],
};
