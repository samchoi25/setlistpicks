// Hardly Strictly Bluegrass 2026 — festival definition.
//
// Pure data: no schedule is built here. buildFestival() in shared/festival.js
// turns this into placed blocks and grid bounds.
//
// Source: the festival's own schedule page, read on 2026-09-23,
//   https://hardlystrictlybluegrass.com/2026-2/
// Its "By Day" view is server-rendered HTML with one box per act carrying the
// day, stage, set time and billed name as separate elements, so every set
// below was parsed straight out of that markup — no OCR, no transcription.
// All 71 boxes parsed; each converts to a range inside the 11:00–19:00 park
// hours the page gives for each day.
//
// Changes against the day-split lineup this replaces (2026-09-08):
//   - Added: Rilo Kiley (Sat) and Robert Plant w/ Saving Grace and Suzi Dian
//     (Sun), both new on the schedule page.
//   - Dropped: Alison Krauss & Union Station feat. Jerry Douglas, which no
//     longer appears anywhere on the page (schedule, A–Z, grid or lineup).
//   - Renamed to the schedule's billing: "Joel ben Izzy – Traveling
//     Storyteller" and "Yasmin Williams and William Tyler". Only the page's
//     curly apostrophe in Mama's Broke is normalised to a straight one.
//
// Set ids are derived from day + stage + position, so moving from the untimed
// day lists to timed stage columns changes every id: votes cast against the
// untimed lineup don't carry across.
//
// Times are PT (24h). Nothing crosses midnight (latest end 19:00).

const slug = 'hardly-strictly-bluegrass-2026';

// The six stages, in HSB's traditional billing order. HSB publishes no stage
// colours of its own, so these are the shared base palette.
const stages = [
  { id: 'banjo', name: 'Banjo Stage', short: 'BANJO', color: '--ocean-deep' },
  { id: 'rooster', name: 'Rooster Stage', short: 'ROOST', color: '--brick-clay' },
  { id: 'towers', name: 'Towers of Gold Stage', short: 'TOWERS', color: '--marigold-gold' },
  { id: 'swan', name: 'Swan Stage', short: 'SWAN', color: '--dusk-purple' },
  { id: 'arrow', name: 'Arrow Stage', short: 'ARROW', color: '--deep-teal' },
  { id: 'horseshoe', name: 'Horseshoe Hill Stage', short: 'HSHOE', color: '--jungle-green' },
];

// The three festival days.
const days = [
  { id: 'fri', name: 'Friday', date: 'Oct 2' },
  { id: 'sat', name: 'Saturday', date: 'Oct 3' },
  { id: 'sun', name: 'Sunday', date: 'Oct 4' },
];

// Each set: [stageId, start, end, artist]
const sets = {
  fri: [
    // ── Banjo Stage ─────────────────────────────────────────────
    ['banjo', '13:00', '13:45', 'Larry Campbell & Teresa Williams'],
    ['banjo', '14:30', '15:20', 'Reckless Kelly'],
    ['banjo', '16:05', '17:00', 'Marty Stuart and His Fabulous Superlatives'],
    ['banjo', '17:50', '19:00', 'Molly Tuttle'],

    // ── Towers of Gold Stage ────────────────────────────────────
    ['towers', '13:40', '14:20', 'Tyler Ballgame'],
    ['towers', '15:05', '16:00', 'Todd Snider Rules!'],
    ['towers', '16:55', '18:00', 'My Morning Jacket'],

    // ── Swan Stage ──────────────────────────────────────────────
    ['swan', '13:00', '13:40', 'Shawn Camp'],
    ['swan', '14:20', '15:05', 'Sierra Hull'],
    ['swan', '16:00', '16:55', 'Los Lobos'],
    ['swan', '18:00', '19:00', 'Lukas Nelson'],

    // ── Arrow Stage ─────────────────────────────────────────────
    ['arrow', '13:45', '14:30', 'Meels'],
    ['arrow', '15:20', '16:05', 'Wreckless Strangers'],
    ['arrow', '17:00', '17:50', 'Stacey Earle'],

    // ── Horseshoe Hill Stage ────────────────────────────────────
    ['horseshoe', '13:45', '14:25', 'The Crooked Jades'],
    ['horseshoe', '15:10', '16:00', "Mama's Broke"],
    ['horseshoe', '16:55', '18:00', 'Stella Heath Quartet'],
  ],
  sat: [
    // ── Banjo Stage ─────────────────────────────────────────────
    ['banjo', '12:25', '13:15', 'Laurie Lewis & The Right Hands'],
    ['banjo', '14:15', '15:05', 'Mavis Staples'],
    ['banjo', '15:50', '17:00', 'Gillian Welch & David Rawlings'],
    ['banjo', '17:45', '19:00', 'Steve Earle & the Hardly Strictly Dukes'],

    // ── Rooster Stage ───────────────────────────────────────────
    ['rooster', '11:00', '11:40', 'Alex Amen'],
    ['rooster', '12:10', '12:55', 'Tony Kamel & Kym Warner'],
    ['rooster', '13:05', '13:55', 'Kathleen Edwards'],
    ['rooster', '14:10', '15:00', 'The Deslondes'],
    ['rooster', '15:25', '16:15', 'Elizabeth Cook'],
    ['rooster', '16:30', '17:20', 'Buddy Miller'],
    ['rooster', '18:00', '19:00', 'John Craigie w/ The Coffis Brothers'],

    // ── Towers of Gold Stage ────────────────────────────────────
    ['towers', '11:40', '12:25', 'Fantastic Cat'],
    ['towers', '13:15', '14:05', 'Aaron Lee Tasjan'],
    ['towers', '14:55', '15:50', 'Hot Tuna Acoustic'],
    ['towers', '16:50', '17:55', 'Rilo Kiley'],

    // ── Swan Stage ──────────────────────────────────────────────
    ['swan', '11:00', '11:40', 'The Crosby Collective'],
    ['swan', '12:25', '13:15', 'Moonalice'],
    ['swan', '14:05', '14:55', 'Alison Brown'],
    ['swan', '15:50', '16:50', 'AJ Lee & Blue Summit'],
    ['swan', '17:55', '19:00', 'Old Crow Medicine Show'],

    // ── Arrow Stage ─────────────────────────────────────────────
    ['arrow', '11:15', '12:25', 'SF Porchfest: Los Jefes, Seldon, Isabel Dumaa'],
    ['arrow', '13:15', '14:15', 'Anna Moss'],
    ['arrow', '15:05', '15:50', 'Ismay'],
    ['arrow', '16:55', '17:45', 'SCUFF: Queer Line Dancing F: Jail Preacher'],

    // ── Horseshoe Hill Stage ────────────────────────────────────
    ['horseshoe', '11:40', '12:25', 'Sweet Sally'],
    ['horseshoe', '13:15', '14:05', 'Martha Scanlan & Jon Neufeld'],
    ['horseshoe', '14:55', '15:45', 'Bandits on the Run'],
    ['horseshoe', '16:50', '17:45', 'DUG'],
  ],
  sun: [
    // ── Banjo Stage ─────────────────────────────────────────────
    ['banjo', '11:00', '11:50', 'Dry Branch F: Ron Thomason & Friends'],
    ['banjo', '12:35', '13:25', 'Miko Marks'],
    ['banjo', '14:10', '15:00', '¿Qiensave?'],
    ['banjo', '15:45', '17:00', 'A Tribute to Joe Ely With The Flatlanders and Friends'],
    ['banjo', '17:45', '19:00', 'Emmylou Harris'],

    // ── Rooster Stage ───────────────────────────────────────────
    ['rooster', '11:00', '11:45', 'Kam Franklin'],
    ['rooster', '12:30', '13:25', 'Dean Johnson'],
    ['rooster', '14:10', '15:05', 'Darrell Scott String Band w/ Rob Ickes'],
    ['rooster', '15:50', '16:50', 'Punch Brothers'],
    ['rooster', '17:35', '18:50', 'Hiss Golden Messenger'],

    // ── Towers of Gold Stage ────────────────────────────────────
    ['towers', '11:20', '12:10', 'Grace Cummings'],
    ['towers', '13:00', '13:50', 'Tift Merritt'],
    ['towers', '14:40', '15:45', 'Jesse Welles'],
    ['towers', '16:40', '17:55', 'Robert Plant w/ Saving Grace and Suzi Dian'],

    // ── Swan Stage ──────────────────────────────────────────────
    ['swan', '12:10', '13:00', 'Steve Poltz'],
    ['swan', '13:50', '14:40', 'Langford, Hogan & Timms'],
    ['swan', '15:45', '16:40', 'The Record Company'],
    ['swan', '17:55', '19:00', 'The Third Mind'],

    // ── Arrow Stage ─────────────────────────────────────────────
    ['arrow', '11:50', '12:35', 'El Khat'],
    ['arrow', '13:25', '14:10', 'Marco and The Polos w/ Special Guests Hills to Hollers'],
    ['arrow', '15:00', '15:45', 'Cristina Vane'],
    ['arrow', '17:00', '17:45', 'Theo Lawrence'],

    // ── Horseshoe Hill Stage ────────────────────────────────────
    ['horseshoe', '11:20', '12:10', 'Joel ben Izzy – Traveling Storyteller'],
    ['horseshoe', '13:00', '13:50', 'Yasmin Williams and William Tyler'],
    ['horseshoe', '14:45', '15:40', 'Willy Tea Taylor'],
    ['horseshoe', '16:50', '17:50', 'Rahim AlHaj'],
  ],
};

// Spotify/Apple Music links, shown on long-press (see ArtistPopup.jsx).
//
// Most come from the festival's own lineup page, which links a Spotify artist
// page from each act's social row — same provenance as Portola's links, and
// the festival's own pick of which page represents an act. Every id was then
// confirmed to resolve to the expected name through Spotify's public oEmbed
// endpoint (the original batch on 2026-08-21, the acts added with the day
// split on 2026-09-08, and Rilo Kiley and Robert Plant with the set times on
// 2026-09-23); the handful the page didn't link were found via
// MusicBrainz's editor-verified artist-URL relationships or Wikidata's Spotify
// artist id (P1902) and confirmed the same way.
//
// A billed collaboration gets the page of whoever the festival's own link
// points at — one act is one entry here, so there's only room for one link:
//   Darrell Scott String Band w/ Rob Ickes     → Darrell Scott
//   Gillian Welch & David Rawlings             → Gillian Welch
//   A Tribute to Joe Ely With The Flatlanders  → Joe Ely
//   John Craigie w/ The Coffis Brothers        → John Craigie
//   Marty Stuart and His Fabulous Superlatives → Marty Stuart
//   Steve Earle & the Hardly Strictly Dukes    → Steve Earle
//   Yasmin Williams and William Tyler          → Yasmin Williams
//   Robert Plant w/ Saving Grace and Suzi Dian → Robert Plant
//   Lukas Nelson                               → Lukas Nelson and Promise of
//     the Real (billed solo here, but that is the page the festival links)
//   Dry Branch F: Ron Thomason & Friends       → Dry Branch Fire Squad
//   Laurie Lewis & The Right Hands             → Laurie Lewis
// Larry Campbell & Teresa Williams is the exception that goes the other way:
// the festival links one of the duo's albums rather than an artist page, so
// this uses the duo's own artist page instead.
//
// Omitted — no Spotify artist page linked from the festival's page, and none
// found that unambiguously matches the billing, so these are left blank rather
// than guessed at:
//   Langford, Hogan & Timms (a one-off trio; Jon Langford and Sally Timms have
//     pages together, but that is a different billing missing a third member)
//   Martha Scanlan & Jon Neufeld (the page links an album, not an artist)
//   Grace Cummings, Rahim AlHaj, Stella Heath Quartet, The Crosby Collective,
//     The Deslondes, Tony Kamel & Kym Warner, Wreckless Strangers
//   Joel ben Izzy – Traveling Storyteller (a storyteller, not a recording act)
//   Marco and The Polos w/ Special Guests Hills to Hollers, SCUFF: Queer Line
//     Dancing F: Jail Preacher, SF Porchfest: Los Jefes, Seldon, Isabel Dumaa,
//     Todd Snider Rules! — festival-specific billings with no page of their own
//
// Apple Music appears only where the festival's page linked it directly; no
// attempt was made to fill it in for the rest. Miko Marks is the one act with
// an Apple Music link but no Spotify one — the popup renders whichever
// platforms are present, so a single-platform entry is fine.
const artistLinks = {
  'A Tribute to Joe Ely With The Flatlanders and Friends': { spotify: 'https://open.spotify.com/artist/388Y4nUQbYSyonhNlBEypT' },
  'AJ Lee & Blue Summit': { spotify: 'https://open.spotify.com/artist/1VwMKPdHxC7tI21tynmXEr' },
  'Aaron Lee Tasjan': { spotify: 'https://open.spotify.com/artist/4PztbfCny3X9gBjlpgvjYo' },
  'Alex Amen': { spotify: 'https://open.spotify.com/artist/70qCuX4YtspN8K6g4lKHnM' },
  'Alison Brown': { spotify: 'https://open.spotify.com/artist/01ts5a7R3WkeE2oKIouXEK' },
  'Anna Moss': { spotify: 'https://open.spotify.com/artist/79EqLrXbrtaK3sNgSQYoRE' },
  'Bandits on the Run': { spotify: 'https://open.spotify.com/artist/40wE5c0s5AtxRwWXoPzBg6' },
  'Buddy Miller': { spotify: 'https://open.spotify.com/artist/6RwBVkrxTbbtS4bwxYQXcp' },
  'Cristina Vane': { spotify: 'https://open.spotify.com/artist/7lfl96v1nJCpVeAmr6lgJD' },
  'DUG': { spotify: 'https://open.spotify.com/artist/69piW3ldzIeMfFEVN6rT4T' },
  'Darrell Scott String Band w/ Rob Ickes': { spotify: 'https://open.spotify.com/artist/1qMgGon16RoDAfujk41Em0' },
  'Dean Johnson': { spotify: 'https://open.spotify.com/artist/4EIdxKX5DkSd7DQhtmY5DN' },
  'Dry Branch F: Ron Thomason & Friends': { spotify: 'https://open.spotify.com/artist/4DXFh21YxTFGzlwIiIItZ2' },
  'El Khat': { spotify: 'https://open.spotify.com/artist/27VOCF4yATFcBGe9N7943c' },
  'Elizabeth Cook': { spotify: 'https://open.spotify.com/artist/0dyEUZv8ftA0dzL5vb2Y9s' },
  'Emmylou Harris': { spotify: 'https://open.spotify.com/artist/5s6TJEuHTr9GR894wc6VfP' },
  'Fantastic Cat': { spotify: 'https://open.spotify.com/artist/1UuGqBhc9CLkj8qgKCHjw5' },
  'Gillian Welch & David Rawlings': { spotify: 'https://open.spotify.com/artist/2H5elA2mJKrHmqkN9GSfkz' },
  'Hiss Golden Messenger': { spotify: 'https://open.spotify.com/artist/37eqxl8DyLd5sQN54wYJbE' },
  'Hot Tuna Acoustic': { spotify: 'https://open.spotify.com/artist/5tOrTQaBRD5yPHqbEwsRn7', appleMusic: 'https://music.apple.com/us/artist/hot-tuna/179244' },
  'Ismay': { spotify: 'https://open.spotify.com/artist/77sFDwywxshHFqKu6rVXIp' },
  'Jesse Welles': { spotify: 'https://open.spotify.com/artist/366xgdzfRGQoiDRGidGlDJ' },
  'John Craigie w/ The Coffis Brothers': { spotify: 'https://open.spotify.com/artist/7ytgyYmtUPfxXHsXEvgObK' },
  'Kam Franklin': { spotify: 'https://open.spotify.com/artist/65gyjFbvFFUqcTBliaFo40' },
  'Kathleen Edwards': { spotify: 'https://open.spotify.com/artist/7x4So74vIUx3DaLk93JCFf' },
  'Larry Campbell & Teresa Williams': { spotify: 'https://open.spotify.com/artist/09rIwq5Yn0wmHD0Si2A14q' },
  'Laurie Lewis & The Right Hands': { spotify: 'https://open.spotify.com/artist/4TFUM3dwVVxsJ6vCnMDVCb' },
  'Los Lobos': { spotify: 'https://open.spotify.com/artist/6OWapcJm9xd55ci9CYbAuT' },
  'Lukas Nelson': { spotify: 'https://open.spotify.com/artist/5iXYJYmMcjlTFL1qA8UfgY' },
  "Mama's Broke": { spotify: 'https://open.spotify.com/artist/18kqY0obPXyo3oXtuzrS7k' },
  'Marty Stuart and His Fabulous Superlatives': { spotify: 'https://open.spotify.com/artist/3OyGv7XUYQwQgECYSzJhyO' },
  'Mavis Staples': { spotify: 'https://open.spotify.com/artist/0cTSCsVx04SSht9V6cpKN0' },
  'Meels': { spotify: 'https://open.spotify.com/artist/5AH6zdOi1I9eHP2jlUHLnq' },
  'Miko Marks': { appleMusic: 'https://music.apple.com/us/artist/miko-marks/152397749' },
  'Molly Tuttle': { spotify: 'https://open.spotify.com/artist/4LX0KCPnH7gvxEbVXqXmAE', appleMusic: 'https://music.apple.com/us/artist/molly-tuttle/864763421' },
  'Moonalice': { spotify: 'https://open.spotify.com/artist/03UgRdV3bSLEHGmdagyM0e' },
  'My Morning Jacket': { spotify: 'https://open.spotify.com/artist/43O3c6wewpzPKwVaGEEtBM' },
  'Old Crow Medicine Show': { spotify: 'https://open.spotify.com/artist/4DBi4EYXgiqbkxvWUXUzMi' },
  'Rilo Kiley': { spotify: 'https://open.spotify.com/artist/2cevwbv7ISD92VMNLYLHZA' },
  'Robert Plant w/ Saving Grace and Suzi Dian': { spotify: 'https://open.spotify.com/artist/1OwarW4LEHnoep20ixRA0y' },
  'Punch Brothers': { spotify: 'https://open.spotify.com/artist/4gFssfOmWNY3LfIZ3zyoy4' },
  'Reckless Kelly': { spotify: 'https://open.spotify.com/artist/0jmPjksXqVrO92Urmx58vg' },
  'Shawn Camp': { spotify: 'https://open.spotify.com/artist/7McONMYw24sAXoYYhMRpY4' },
  'Sierra Hull': { spotify: 'https://open.spotify.com/artist/0JGGxsAD1Eg4X9AcKNcxEB' },
  'Stacey Earle': { spotify: 'https://open.spotify.com/artist/0iaGkh8pMKkJPFaYnwG4f8' },
  'Steve Earle & the Hardly Strictly Dukes': { spotify: 'https://open.spotify.com/artist/2UBTfUoLI07iRqGeUrwhZh', appleMusic: 'https://music.apple.com/us/artist/steve-earle/71239' },
  'Steve Poltz': { spotify: 'https://open.spotify.com/artist/7AAenH06H5mjmOh4tj3z5Y' },
  'Sweet Sally': { spotify: 'https://open.spotify.com/artist/71iKAqpq65sEhaUc1GYHOC' },
  'The Crooked Jades': { spotify: 'https://open.spotify.com/artist/3xiYiyyYuIG9fhVsJyQYP3' },
  'The Record Company': { spotify: 'https://open.spotify.com/artist/6vYg01ZFt1nREsUDMDPUYX' },
  'The Third Mind': { spotify: 'https://open.spotify.com/artist/1LkLIVstA1IoipK1nx0RAD' },
  'Theo Lawrence': { spotify: 'https://open.spotify.com/artist/28eXJYBZVGDRy1c7j4dIw2' },
  'Tift Merritt': { spotify: 'https://open.spotify.com/artist/2jL1PBvL0gBZBPk6B38p3z' },
  'Tyler Ballgame': { spotify: 'https://open.spotify.com/artist/1pQ0Axx7UF8LDDOqSgdVmK' },
  'Willy Tea Taylor': { spotify: 'https://open.spotify.com/artist/7wFk6kv7WudeSu1bEhG89g' },
  '¿Qiensave?': { spotify: 'https://open.spotify.com/artist/2zzLwsB8sY1dkIDAKevDrc' },
  'Yasmin Williams and William Tyler': { spotify: 'https://open.spotify.com/artist/4j8CsPzssbM8TCjSvgnmSs' },
};

export default {
  slug,
  name: 'Hardly Strictly Bluegrass 2026',
  shortName: 'Hardly Strictly',
  year: 2026,
  venue: 'Golden Gate Park, San Francisco',
  place: {
    name: 'Golden Gate Park',
    streetAddress: '501 Stanyan St',
    addressLocality: 'San Francisco',
    addressRegion: 'CA',
    postalCode: '94117',
    addressCountry: 'US',
  },
  utcOffset: '-07:00',
  dateRange: 'October 2–4, 2026',
  officialUrl: 'https://hardlystrictlybluegrass.com/2026-2/',
  dataVerifiedOn: '2026-09-23',
  // HSB deliberately bills its lineup alphabetically with no headliner tier —
  // there is no poster hierarchy to read this off, unlike every other festival
  // in here. These are the biggest draws on the bill, picked to give the SEO
  // page a <title> and description worth reading; they carry no billing claim.
  headliners: [
    'My Morning Jacket', 'Emmylou Harris', 'Gillian Welch & David Rawlings',
    'Robert Plant w/ Saving Grace and Suzi Dian', 'Mavis Staples', 'Los Lobos',
  ],
  notableActs: [
    'Old Crow Medicine Show', 'Punch Brothers',
    'Steve Earle & the Hardly Strictly Dukes', 'Molly Tuttle',
    'Marty Stuart and His Fabulous Superlatives', 'Hot Tuna Acoustic', 'Rilo Kiley',
  ],
  stages,
  days,
  sets,
  artistLinks,
  groupNames: [
    'Banjo Brigade', 'Hellman Hollow Hangout', 'Free Festival Fam', "Pickin' Party",
    'Fiddle Faddle Crew', 'Bluegrass Buddies', 'Towers Meadow Troupe', 'Porch Stomp Posse',
    'Rosin Up Crew', 'Foggy Mountain Fam', 'String Band Squad', 'Golden Gate Grass Crew',
  ],
};
