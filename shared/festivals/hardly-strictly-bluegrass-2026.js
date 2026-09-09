// Hardly Strictly Bluegrass 2026 — festival definition.
//
// Pure data: no schedule is built here. buildFestival() in shared/festival.js
// turns this into placed blocks and grid bounds.
//
// Sources, both read on 2026-09-08:
//   - The day split comes from the festival's own "2026 Lineup by Day" poster,
//     https://hardlystrictlybluegrass.com/wp-content/uploads/2026/09/HSB26_FullLineUp_NamesDay.png
//     which is an image, so it was read by OCR rather than parsed.
//   - The names themselves come from the announced-lineup page,
//     https://hardlystrictlybluegrass.com/headline/2026-lineup-announcements/
//     whose markup carries each act's billed mixed-case form. The poster sets
//     names in upper case, so it can't settle capitalisation on its own.
//
// The two were reconciled against each other: all 70 acts on the poster match
// all 70 on the lineup page exactly, with nothing left over on either side and
// no act appearing on two days. That check is what makes the OCR trustworthy
// here — a dropped or hallucinated line would have shown up as a mismatch.
// (The one name that needed a judgement call: the lineup page bills the
// storyteller as "Joel ben Izzy - Storyteller" and the poster as plain "JOEL
// BEN IZZY"; the page's fuller form is used below.)
//
// STAGES AND SET TIMES ARE STILL UNANNOUNCED. HSB has now published which day
// each act plays, but not where or when — those land much closer to the event.
// So each day is modeled with bare-string entries (see dayModeOf() and
// buildUntimedDay() in shared/festival.js), which render as one alphabetical
// list per day. Inventing a stage per act or placeholder start times would put
// fabricated detail in front of people voting on what to go see.
//
// When set times land: swap the bare strings for
// `[stageId, 'HH:MM start', 'HH:MM end', 'Artist']` and fill in `stages`. Set
// ids are derived from day + position, so they *will* change at that point and
// any votes cast against the current ids won't map across — worth rolling out
// the real schedule before it matters, or accepting the reset. Note that the
// same caveat applied to the ids this commit replaces: the whole lineup
// previously sat under a single 'weekend' day, so every id has just changed.

const slug = 'hardly-strictly-bluegrass-2026';

// No stages announced. HSB traditionally runs six (Banjo, Rooster, Towers of
// Gold, Swan, Arrow, Porch), but which act plays which is exactly what hasn't
// been said yet, so the list stays empty and the days render stageless rather
// than guessing. See the header comment.
const stages = [];

// The three real festival days, now that the lineup is split by day.
const days = [
  { id: 'fri', name: 'Friday', date: 'Oct 2' },
  { id: 'sat', name: 'Saturday', date: 'Oct 3' },
  { id: 'sun', name: 'Sunday', date: 'Oct 4' },
];

// Every announced act, as a bare string: no stage, no set time (see
// entryKind() in shared/festival.js). buildUntimedDay() sorts these
// alphabetically, so the order here doesn't matter — it's listed alphabetically
// anyway for ease of re-checking against the source.
const sets = {
  fri: [
    'Larry Campbell & Teresa Williams',
    'Los Lobos',
    'Lukas Nelson',
    "Mama's Broke",
    'Marty Stuart and His Fabulous Superlatives',
    'Meels',
    'Molly Tuttle',
    'My Morning Jacket',
    'Reckless Kelly',
    'Shawn Camp',
    'Sierra Hull',
    'Stacey Earle',
    'Stella Heath Quartet',
    'The Crooked Jades',
    'Todd Snider Rules!',
    'Tyler Ballgame',
    'Wreckless Strangers',
  ],
  sat: [
    'Aaron Lee Tasjan',
    'AJ Lee & Blue Summit',
    'Alex Amen',
    'Alison Brown',
    'Alison Krauss & Union Station feat. Jerry Douglas',
    'Anna Moss',
    'Bandits on the Run',
    'Buddy Miller',
    'DUG',
    'Elizabeth Cook',
    'Fantastic Cat',
    'Gillian Welch & David Rawlings',
    'Hot Tuna Acoustic',
    'Ismay',
    'John Craigie w/ The Coffis Brothers',
    'Kathleen Edwards',
    'Laurie Lewis & The Right Hands',
    'Martha Scanlan & Jon Neufeld',
    'Mavis Staples',
    'Moonalice',
    'Old Crow Medicine Show',
    'SCUFF: Queer Line Dancing F: Jail Preacher',
    'SF Porchfest: Los Jefes, Seldon, Isabel Dumaa',
    'Steve Earle & the Hardly Strictly Dukes',
    'Sweet Sally',
    'The Crosby Collective',
    'The Deslondes',
    'Tony Kamel & Kym Warner',
  ],
  sun: [
    'A Tribute to Joe Ely With The Flatlanders and Friends',
    'Cristina Vane',
    'Darrell Scott String Band w/ Rob Ickes',
    'Dean Johnson',
    'Dry Branch F: Ron Thomason & Friends',
    'El Khat',
    'Emmylou Harris',
    'Grace Cummings',
    'Hiss Golden Messenger',
    'Jesse Welles',
    'Joel ben Izzy - Storyteller',
    'Kam Franklin',
    'Langford, Hogan & Timms',
    'Marco and The Polos w/ Special Guests Hills to Hollers',
    'Miko Marks',
    'Punch Brothers',
    '¿Qiensave?',
    'Rahim AlHaj',
    'Steve Poltz',
    'The Record Company',
    'The Third Mind',
    'Theo Lawrence',
    'Tift Merritt',
    'Willy Tea Taylor',
    'Yasmin Williams & William Tyler',
  ],
};

// Spotify/Apple Music links, shown on long-press (see ArtistPopup.jsx).
//
// Most come from the festival's own lineup page, which links a Spotify artist
// page from each act's social row — same provenance as Portola's links, and
// the festival's own pick of which page represents an act. Every id was then
// confirmed to resolve to the expected name through Spotify's public oEmbed
// endpoint (the original batch on 2026-08-21, the acts added with the day
// split on 2026-09-08); the handful the page didn't link were found via
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
//   Yasmin Williams & William Tyler            → Yasmin Williams
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
//   Joel ben Izzy - Storyteller (a storyteller, not a recording act)
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
  'Alison Krauss & Union Station feat. Jerry Douglas': { spotify: 'https://open.spotify.com/artist/0OTnx2X2FDXeewcm72lavT' },
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
  'Yasmin Williams & William Tyler': { spotify: 'https://open.spotify.com/artist/4j8CsPzssbM8TCjSvgnmSs' },
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
  officialUrl: 'https://hardlystrictlybluegrass.com/headline/2026-lineup-announcements/',
  dataVerifiedOn: '2026-09-08',
  // HSB deliberately bills its lineup alphabetically with no headliner tier —
  // there is no poster hierarchy to read this off, unlike every other festival
  // in here. These are the biggest draws on the bill, picked to give the SEO
  // page a <title> and description worth reading; they carry no billing claim.
  headliners: [
    'My Morning Jacket', 'Emmylou Harris', 'Gillian Welch & David Rawlings',
    'Alison Krauss & Union Station feat. Jerry Douglas', 'Mavis Staples', 'Los Lobos',
  ],
  notableActs: [
    'Old Crow Medicine Show', 'Punch Brothers',
    'Steve Earle & the Hardly Strictly Dukes', 'Molly Tuttle',
    'Marty Stuart and His Fabulous Superlatives', 'Hot Tuna Acoustic',
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
