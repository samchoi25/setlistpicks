// Hardly Strictly Bluegrass 2026 — festival definition.
//
// Pure data: no schedule is built here. buildFestival() in shared/festival.js
// turns this into placed blocks and grid bounds.
//
// Source: the festival's own announced-lineup page,
// https://hardlystrictlybluegrass.com/headline/2026-lineup-announcements/
// Read on 2026-08-21 — 41 acts, each name taken verbatim from the page's own
// billing (it renders them upper-case; the underlying markup carries the
// mixed-case form used here).
//
// NOTHING BUT THE NAMES IS ANNOUNCED YET. No stages, no set times, and — the
// part that makes this festival different from every other one in here — no
// day assignments either. HSB publishes one alphabetical list for the whole
// weekend and only splits it by day much closer to the event.
//
// So this is modeled the honest way the data model already allows: bare-string
// entries (see dayModeOf()/buildUntimedDay() in shared/festival.js) under a
// single day that stands for the whole weekend, rendering as one alphabetical
// list. Inventing a day split, a stage per act or placeholder start times
// would put three days' worth of fabricated detail in front of people who are
// voting on what to go see — worse than showing them exactly what the
// festival has actually said.
//
// When the real schedule lands: give `days` its three real entries, move each
// act under the day it plays, and swap bare strings for
// `[stageId, 'HH:MM start', 'HH:MM end', 'Artist']` (plus a real `stages`
// list). Set ids are derived from day + position, so they *will* change at
// that point and any votes cast against these placeholder ids won't map
// across — worth rolling out the real schedule before it matters, or
// accepting the reset.

const slug = 'hardly-strictly-bluegrass-2026';

// No stages announced. HSB traditionally runs six (Banjo, Rooster, Towers of
// Gold, Swan, Arrow, Porch), but which act plays which is exactly what hasn't
// been said yet, so the list stays empty and the day renders stageless rather
// than guessing. See the header comment.
const stages = [];

// One pseudo-day for the whole Oct 2–4 weekend, because the lineup isn't split
// by day yet. `date` is the *last* day so festivalEndsAt() keeps the festival
// in "upcoming" listings through the close of Sunday; `dateLabel` is what the
// day heading actually shows, since "Oct 4th" alone would misstate a
// three-day festival. Replace with the three real days once the schedule is
// announced.
const days = [
  { id: 'weekend', name: 'All Weekend', date: 'Oct 4', dateLabel: 'Oct 2–4' },
];

// Every announced act, as a bare string: no stage, no set time (see
// entryKind() in shared/festival.js). buildUntimedDay() sorts these
// alphabetically, so the order here doesn't matter — it mirrors the source
// page for ease of re-checking against it.
const sets = {
  weekend: [
    'Aaron Lee Tasjan',
    'AJ Lee & Blue Summit',
    'Alison Krauss & Union Station feat. Jerry Douglas',
    'Anna Moss',
    'Bandits on the Run',
    'Buddy Miller',
    'Darrell Scott String Band w/ Rob Ickes',
    'DUG',
    'El Khat',
    'Elizabeth Cook',
    'Emmylou Harris',
    'Gillian Welch & David Rawlings',
    'Hiss Golden Messenger',
    'Hot Tuna Acoustic',
    'Ismay',
    'Jesse Welles',
    'A Tribute to Joe Ely With The Flatlanders and Friends',
    'John Craigie w/ The Coffis Brothers',
    'Kam Franklin',
    'Kathleen Edwards',
    'Langford, Hogan & Timms',
    'Larry Campbell & Teresa Williams',
    'Los Lobos',
    'Lukas Nelson',
    "Mama's Broke",
    'Marty Stuart and His Fabulous Superlatives',
    'Mavis Staples',
    'Meels',
    'Molly Tuttle',
    'Moonalice',
    'My Morning Jacket',
    'Old Crow Medicine Show',
    '¿Qiensave?',
    'Reckless Kelly',
    'Shawn Camp',
    'Sierra Hull',
    'Stacey Earle',
    'Steve Earle & the Hardly Strictly Dukes',
    'Tift Merritt',
    'Tyler Ballgame',
    'Yasmin Williams & William Tyler',
  ],
};

// Spotify/Apple Music links, shown on long-press (see ArtistPopup.jsx).
//
// Most come from the festival's own lineup page, which links a Spotify artist
// page from each act's social row — same provenance as Portola's links, and
// the festival's own pick of which page represents an act. Every id was then
// confirmed to resolve to the expected name through Spotify's public oEmbed
// endpoint on 2026-08-21; the handful the page didn't link were found via
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
// Larry Campbell & Teresa Williams is the exception that goes the other way:
// the festival links one of the duo's albums rather than an artist page, so
// this uses the duo's own artist page instead.
//
// Omitted: Langford, Hogan & Timms — a one-off trio with no links at all on
// the festival's page and no Spotify artist page of its own. Jon Langford and
// Sally Timms have pages together, but that is a different billing missing a
// third member, so this is left blank rather than guessed at.
//
// Apple Music appears only where the festival's page linked it directly; no
// attempt was made to fill it in for the rest.
const artistLinks = {
  'A Tribute to Joe Ely With The Flatlanders and Friends': { spotify: 'https://open.spotify.com/artist/388Y4nUQbYSyonhNlBEypT' },
  'AJ Lee & Blue Summit': { spotify: 'https://open.spotify.com/artist/1VwMKPdHxC7tI21tynmXEr' },
  'Aaron Lee Tasjan': { spotify: 'https://open.spotify.com/artist/4PztbfCny3X9gBjlpgvjYo' },
  'Alison Krauss & Union Station feat. Jerry Douglas': { spotify: 'https://open.spotify.com/artist/0OTnx2X2FDXeewcm72lavT' },
  'Anna Moss': { spotify: 'https://open.spotify.com/artist/79EqLrXbrtaK3sNgSQYoRE' },
  'Bandits on the Run': { spotify: 'https://open.spotify.com/artist/40wE5c0s5AtxRwWXoPzBg6' },
  'Buddy Miller': { spotify: 'https://open.spotify.com/artist/6RwBVkrxTbbtS4bwxYQXcp' },
  'DUG': { spotify: 'https://open.spotify.com/artist/69piW3ldzIeMfFEVN6rT4T' },
  'Darrell Scott String Band w/ Rob Ickes': { spotify: 'https://open.spotify.com/artist/1qMgGon16RoDAfujk41Em0' },
  'El Khat': { spotify: 'https://open.spotify.com/artist/27VOCF4yATFcBGe9N7943c' },
  'Elizabeth Cook': { spotify: 'https://open.spotify.com/artist/0dyEUZv8ftA0dzL5vb2Y9s' },
  'Emmylou Harris': { spotify: 'https://open.spotify.com/artist/5s6TJEuHTr9GR894wc6VfP' },
  'Gillian Welch & David Rawlings': { spotify: 'https://open.spotify.com/artist/2H5elA2mJKrHmqkN9GSfkz' },
  'Hiss Golden Messenger': { spotify: 'https://open.spotify.com/artist/37eqxl8DyLd5sQN54wYJbE' },
  'Hot Tuna Acoustic': { spotify: 'https://open.spotify.com/artist/5tOrTQaBRD5yPHqbEwsRn7', appleMusic: 'https://music.apple.com/us/artist/hot-tuna/179244' },
  'Ismay': { spotify: 'https://open.spotify.com/artist/77sFDwywxshHFqKu6rVXIp' },
  'Jesse Welles': { spotify: 'https://open.spotify.com/artist/366xgdzfRGQoiDRGidGlDJ' },
  'John Craigie w/ The Coffis Brothers': { spotify: 'https://open.spotify.com/artist/7ytgyYmtUPfxXHsXEvgObK' },
  'Kam Franklin': { spotify: 'https://open.spotify.com/artist/65gyjFbvFFUqcTBliaFo40' },
  'Kathleen Edwards': { spotify: 'https://open.spotify.com/artist/7x4So74vIUx3DaLk93JCFf' },
  'Larry Campbell & Teresa Williams': { spotify: 'https://open.spotify.com/artist/09rIwq5Yn0wmHD0Si2A14q' },
  'Los Lobos': { spotify: 'https://open.spotify.com/artist/6OWapcJm9xd55ci9CYbAuT' },
  'Lukas Nelson': { spotify: 'https://open.spotify.com/artist/5iXYJYmMcjlTFL1qA8UfgY' },
  "Mama's Broke": { spotify: 'https://open.spotify.com/artist/18kqY0obPXyo3oXtuzrS7k' },
  'Marty Stuart and His Fabulous Superlatives': { spotify: 'https://open.spotify.com/artist/3OyGv7XUYQwQgECYSzJhyO' },
  'Mavis Staples': { spotify: 'https://open.spotify.com/artist/0cTSCsVx04SSht9V6cpKN0' },
  'Meels': { spotify: 'https://open.spotify.com/artist/5AH6zdOi1I9eHP2jlUHLnq' },
  'Molly Tuttle': { spotify: 'https://open.spotify.com/artist/4LX0KCPnH7gvxEbVXqXmAE', appleMusic: 'https://music.apple.com/us/artist/molly-tuttle/864763421' },
  'Moonalice': { spotify: 'https://open.spotify.com/artist/03UgRdV3bSLEHGmdagyM0e' },
  'My Morning Jacket': { spotify: 'https://open.spotify.com/artist/43O3c6wewpzPKwVaGEEtBM' },
  'Old Crow Medicine Show': { spotify: 'https://open.spotify.com/artist/4DBi4EYXgiqbkxvWUXUzMi' },
  'Reckless Kelly': { spotify: 'https://open.spotify.com/artist/0jmPjksXqVrO92Urmx58vg' },
  'Shawn Camp': { spotify: 'https://open.spotify.com/artist/7McONMYw24sAXoYYhMRpY4' },
  'Sierra Hull': { spotify: 'https://open.spotify.com/artist/0JGGxsAD1Eg4X9AcKNcxEB' },
  'Stacey Earle': { spotify: 'https://open.spotify.com/artist/0iaGkh8pMKkJPFaYnwG4f8' },
  'Steve Earle & the Hardly Strictly Dukes': { spotify: 'https://open.spotify.com/artist/2UBTfUoLI07iRqGeUrwhZh', appleMusic: 'https://music.apple.com/us/artist/steve-earle/71239' },
  'Tift Merritt': { spotify: 'https://open.spotify.com/artist/2jL1PBvL0gBZBPk6B38p3z' },
  'Tyler Ballgame': { spotify: 'https://open.spotify.com/artist/1pQ0Axx7UF8LDDOqSgdVmK' },
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
  dataVerifiedOn: '2026-08-21',
  // HSB deliberately bills its lineup alphabetically with no headliner tier —
  // there is no poster hierarchy to read this off, unlike every other festival
  // in here. These are the biggest draws on the bill, picked to give the SEO
  // page a <title> and description worth reading; they carry no billing claim.
  headliners: [
    'My Morning Jacket', 'Emmylou Harris', 'Gillian Welch & David Rawlings',
    'Alison Krauss & Union Station feat. Jerry Douglas', 'Mavis Staples', 'Los Lobos',
  ],
  notableActs: [
    'Old Crow Medicine Show', 'Steve Earle & the Hardly Strictly Dukes',
    'Molly Tuttle', 'Marty Stuart and His Fabulous Superlatives',
    'Hot Tuna Acoustic', 'Sierra Hull',
  ],
  stages,
  days,
  sets,
  artistLinks,
};
