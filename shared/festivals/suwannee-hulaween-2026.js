// Suwannee Hulaween 2026 — festival definition.
//
// Pure data: no schedule is built here. buildFestival() in shared/festival.js
// turns this into placed blocks, lanes and grid bounds.
//
// Source: the four per-day set-time grids on the festival's schedule page,
// https://hulaween.com/schedule/ , uploaded 2026-10-02 as
//   https://hulaween.com/wp-content/uploads/2026/10/HL26_{Thurs,Friday,Sat,Sun}.png
// (they supersede the 2026-09-24 "R01" grids in the same media library). The
// page renders them only as images, so these times were read off the artwork
// at full resolution rather than scraped. Every act on the grids was checked
// against the A–Z lineup poster
// (https://hulaween.com/wp-content/uploads/2026/06/HulaLineup_6-23-26.png);
// the poster's spelling wins where the grid abbreviates:
//   - "EOTO & Friends" is the grid's billing for the poster's "EOTO feat. Kyle
//     Hollingsworth & Scott Metzger"; the grid's is kept, being the slot's.
//   - "Big Gramatik" is Big Gigantic b2b Gramatik, as both sources say.
//   - Drama's Sunday slot is "DRAMA [CLUB]" on the grid and "DRAMA (DJ SET)"
//     on the poster; billed here as the grid's club set.
//   - The Ain't Sisters are on the poster but on none of the four grids, so
//     they are left out rather than given an invented slot.
// "Surprise Sets" and Sunday's "Open Aux Contest Winner" are kept: they are
// real slots on the grid, and people plan around a 1 AM surprise set.
//
// Takeovers the grids label but don't name as stages: Of The Trees' "Memory
// Palace" on Friday's Amphitheatre, and Green Velvet's "La La Land" across
// Saturday night's Def: Off Limits.
//
// Format per set: [stageId, 'HH:MM start', 'HH:MM end', 'Artist', meta?]
//
// All times are ET (24h). Late sets run past midnight, so a time of 24:00 or
// later belongs to the small hours *after* the day it is listed under — the
// festival's own convention, and the only way to keep a 1 AM set on the night
// people think of it as part of. Latest end: 27:45 (3:45 AM).

const slug = 'suwannee-hulaween-2026';

// Column order matches the grids, left to right. No stage colours on the
// artwork (each day is one tint), so these are the shared base palette.
const stages = [
  { id: 'meadow', name: 'The Meadow', short: 'MEADOW', color: '--dusk-purple' },
  { id: 'hallows', name: 'The Hallows', short: 'HALLOWS', color: '--brick-clay' },
  { id: 'amphitheatre', name: 'The Amphitheatre', short: 'AMPH', color: '--ocean-deep' },
  { id: 'spiritlake', name: 'Spirit Lake', short: 'LAKE', color: '--deep-teal' },
  { id: 'def', name: 'Def: Off Limits', short: 'DEF', color: '--jungle-green' },
];

const days = [
  { id: 'thu', name: 'Thursday', date: 'Oct 22' },
  { id: 'fri', name: 'Friday', date: 'Oct 23' },
  { id: 'sat', name: 'Saturday', date: 'Oct 24' },
  { id: 'sun', name: 'Sunday', date: 'Oct 25' },
];

// `asl: true` marks the sets the grids flag with the ASL-interpreter icon.
const asl = { asl: true };

const sets = {
  thu: [
    ['meadow', '16:00', '17:00', 'Casey Club'],
    ['meadow', '18:00', '19:00', 'Richard Finger'],
    ['meadow', '20:00', '21:00', 'HAMDI'],
    ['meadow', '22:30', '24:00', 'Excision', asl],

    ['hallows', '15:15', '16:00', 'Costa'],
    ['hallows', '17:00', '18:00', 'Steller'],
    ['hallows', '19:00', '20:00', 'AHEE', asl],
    ['hallows', '21:00', '22:25', 'Crankdat', asl],

    ['amphitheatre', '16:00', '17:00', 'Baalti'],
    ['amphitheatre', '18:00', '19:30', 'Dean Turnley'],
    ['amphitheatre', '20:30', '22:00', 'Riordan'],
    ['amphitheatre', '22:30', '24:00', 'KETTAMA'],

    ['spiritlake', '16:30', '17:30', 'Joy Wagon'],
    ['spiritlake', '18:30', '19:30', 'Minim'],
    ['spiritlake', '20:30', '21:30', 'Supertaste'],
    ['spiritlake', '22:30', '24:00', 'Midnight Generation'],
    ['spiritlake', '25:00', '26:45', 'Magoo'],

    ['def', '17:30', '18:30', 'Karan!'],
    ['def', '19:30', '20:30', 'Gravagerz'],
    ['def', '21:30', '22:30', 'Effy'],
    ['def', '24:00', '25:00', '¥ØU$UK€ ¥UK1MAT$U'],
    ['def', '25:15', '26:45', 'Surprise Sets'],
  ],
  fri: [
    ['meadow', '15:15', '16:15', 'Karina Rykman'],
    ['meadow', '17:15', '18:30', 'The String Cheese Incident'],
    ['meadow', '19:30', '21:00', 'The String Cheese Incident'],
    ['meadow', '22:00', '24:30', 'My Morning Jacket'],

    ['hallows', '16:15', '17:15', 'Caitlin Krisko & The Broadcast'],
    ['hallows', '18:30', '19:30', 'Eggy'],
    ['hallows', '21:00', '22:00', 'Lettuce'],
    ['hallows', '24:30', '26:00', 'STS9'],

    ['amphitheatre', '16:00', '17:00', 'Curra'],
    ['amphitheatre', '17:30', '18:30', 'Saka x Fly'],
    ['amphitheatre', '19:00', '20:00', 'Opiuo'],
    ['amphitheatre', '20:30', '21:45', 'LYNY'],
    ['amphitheatre', '22:15', '23:45', 'Of The Trees', asl],

    ['spiritlake', '15:30', '16:30', 'The Yeah Babys'],
    ['spiritlake', '17:30', '18:30', 'Natalie Brooke'],
    ['spiritlake', '19:30', '20:30', 'Anthill Cinema w/ Jon Ditty'],
    ['spiritlake', '21:30', '22:30', 'Guavatron'],
    ['spiritlake', '23:30', '24:30', 'EOTO & Friends'],
    ['spiritlake', '26:15', '27:45', 'LaMP'],

    ['def', '16:30', '17:30', 'Rudashi'],
    ['def', '18:30', '19:30', 'AK Sports'],
    ['def', '20:30', '21:30', 'HHunter'],
    ['def', '22:30', '23:30', 'Frost Children (DJ Set)'],
    ['def', '24:30', '27:00', 'Surprise Sets'],
  ],
  sat: [
    ['meadow', '15:45', '16:45', 'Sneezy'],
    ['meadow', '17:45', '19:00', 'The String Cheese Incident'],
    ['meadow', '20:15', '21:45', 'The Warren Haynes Incident'],
    ['meadow', '23:00', '26:00', 'Pretty Lights', asl],

    ['hallows', '15:15', '15:45', 'Motifv'],
    ['hallows', '16:45', '17:45', 'Heyz'],
    ['hallows', '19:00', '20:15', 'Daily Bread', asl],
    ['hallows', '21:45', '23:00', 'Levity', asl],

    ['amphitheatre', '16:00', '17:15', 'Jerro'],
    ['amphitheatre', '17:30', '18:45', 'Gudfella'],
    ['amphitheatre', '19:30', '21:00', 'Kasablanca'],
    ['amphitheatre', '21:30', '23:15', 'Ben Böhmer (Live)'],

    ['spiritlake', '15:30', '16:30', 'Tire Fire'],
    ['spiritlake', '17:00', '18:00', 'Jon Stickley Trio'],
    ['spiritlake', '18:30', '19:30', 'Asydequest'],
    ['spiritlake', '20:15', '21:15', 'Willis'],
    ['spiritlake', '22:00', '23:30', 'Dope Lemon'],
    ['spiritlake', '26:15', '27:45', 'Mountain Grass Unit'],

    ['def', '20:00', '21:00', 'Close Friends Only'],
    ['def', '21:00', '22:00', 'Tini Gessler'],
    ['def', '22:00', '23:00', 'Jackie Hollander'],
    ['def', '23:00', '25:00', 'Green Velvet'],
    ['def', '25:00', '26:00', 'Green Velvet B3B & Surprise Sets'],
  ],
  sun: [
    ['meadow', '13:00', '14:00', "Taper's Choice"],
    ['meadow', '15:00', '17:00', 'The String Cheese Incident'],
    ['meadow', '18:30', '20:00', 'Geese'],

    ['hallows', '12:15', '13:00', 'Playlunch'],
    ['hallows', '14:00', '15:00', 'Guerilla Toss'],
    ['hallows', '17:00', '18:30', 'Unknown Mortal Orchestra'],

    ['amphitheatre', '13:15', '14:15', 'Hershe'],
    ['amphitheatre', '14:30', '15:30', 'A Hundred Drums'],
    ['amphitheatre', '15:45', '16:45', "Maddy O'Neal"],
    ['amphitheatre', '17:00', '18:00', 'Manic Focus', asl],
    ['amphitheatre', '18:30', '20:00', 'Big Gramatik (Big Gigantic b2b Gramatik)'],

    ['spiritlake', '13:00', '14:00', 'Moonstone Riders'],
    ['spiritlake', '15:00', '16:00', 'True Loves'],
    ['spiritlake', '17:00', '18:00', 'Lewis OfMan'],
    ['spiritlake', '19:00', '20:00', 'Drama (Club Set)'],
    ['spiritlake', '21:30', '23:30', 'The Greyboy Allstars'],

    ['def', '14:00', '15:00', 'Open Aux Contest Winner'],
    ['def', '16:00', '17:00', 'INVT'],
    ['def', '18:00', '19:00', 'Daniel Allan'],
    ['def', '20:00', '21:15', 'Salute'],
    ['def', '22:15', '23:30', 'Surprise Sets'],
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
//   The Warren Haynes Incident               → Warren Haynes
//   EOTO & Friends                           → EOTO
//   Big Gramatik (Big Gigantic b2b Gramatik) → Big Gigantic
//   Saka x Fly                               → Saka
//
// Left blank — no page that unambiguously matches the billing: Costa, Curra,
// Eggy, Minim, Riordan, Willis, Tire Fire, Natalie Brooke, The Yeah Babys,
// Asydequest, Anthill Cinema w/ Jon Ditty, Richard Finger, Playlunch,
// Moonstone Riders, and LaMP (the only LaMP with a page is an unrelated
// Japanese group). Surprise Sets and the Open Aux Contest Winner aren't acts.
const artistLinks = {
  'A Hundred Drums': { spotify: 'https://open.spotify.com/artist/1dUCaUhp2RZRXrwOyUnHxQ', appleMusic: 'https://music.apple.com/us/artist/1373017496' },
  'AHEE': { spotify: 'https://open.spotify.com/artist/1gbDc1TANALgP8lLvO5UEf', appleMusic: 'https://music.apple.com/us/artist/688432748', soundcloud: 'https://soundcloud.com/ahee' },
  'AK Sports': { spotify: 'https://open.spotify.com/artist/7qiOBa5jCbTeyLY2Chw9ju', soundcloud: 'https://soundcloud.com/aksportsdj' },
  'Baalti': { spotify: 'https://open.spotify.com/artist/2CtpjGWvsq4QnUIx9PHDAN', appleMusic: 'https://music.apple.com/us/artist/1547868337', soundcloud: 'https://soundcloud.com/baalti' },
  'Ben Böhmer (Live)': { spotify: 'https://open.spotify.com/artist/5tDjiBYUsTqzd0RkTZxK7u', appleMusic: 'https://music.apple.com/us/artist/794108530', soundcloud: 'https://soundcloud.com/ben-bohmer' },
  'Big Gramatik (Big Gigantic b2b Gramatik)': { spotify: 'https://open.spotify.com/artist/7o7mC95EDbJKTcPAAs8C3r', appleMusic: 'https://music.apple.com/us/artist/353636649', soundcloud: 'https://soundcloud.com/biggigantic' },
  'Caitlin Krisko & The Broadcast': { spotify: 'https://open.spotify.com/artist/7EUd5VylN6IFwj3hb8VxkY', appleMusic: 'https://music.apple.com/us/artist/1635611678' },
  'Casey Club': { spotify: 'https://open.spotify.com/artist/2bmnpyZiHHOCrU988FwaJj', appleMusic: 'https://music.apple.com/us/artist/1732526802' },
  'Close Friends Only': { appleMusic: 'https://music.apple.com/us/artist/1783526861' },
  'Crankdat': { spotify: 'https://open.spotify.com/artist/5lCekoJW9jNq01B1wiqdAb', appleMusic: 'https://music.apple.com/us/artist/1073027547', soundcloud: 'https://soundcloud.com/crankdatmusic' },
  'Daily Bread': { spotify: 'https://open.spotify.com/artist/4IsiG6RpDyRq6Frd2CvddW', soundcloud: 'https://soundcloud.com/daily-bread' },
  'Daniel Allan': { spotify: 'https://open.spotify.com/artist/5JQ1XqKJ2Art01rF4tu1Ra', appleMusic: 'https://music.apple.com/us/artist/193197922' },
  'Dean Turnley': { spotify: 'https://open.spotify.com/artist/3BcWcwYXVjvLWHMGKsuvsd?si=mhZej_eyRdasjP2E-GAZOQ', appleMusic: 'https://music.apple.com/au/artist/dean-turnley/1561296990', soundcloud: 'https://soundcloud.com/dean_turnley' },
  'Dope Lemon': { spotify: 'https://open.spotify.com/artist/7oZLKL1GjYiaAgssXsLmW8', appleMusic: 'https://music.apple.com/us/artist/1087204900' },
  'Drama (Club Set)': { spotify: 'https://open.spotify.com/artist/0OjVCtRRq44GkCafNuuHXQ', appleMusic: 'https://music.apple.com/us/artist/1179641041', soundcloud: 'https://soundcloud.com/dramaduo' },
  'Effy': { spotify: 'https://open.spotify.com/artist/19SX00qkAvpVQroAka9GI0', appleMusic: 'https://music.apple.com/us/artist/1499378208', soundcloud: 'https://soundcloud.com/its_effy' },
  'EOTO & Friends': { spotify: 'https://open.spotify.com/artist/71YgkzZVmQsmWGDsu0jmqR', soundcloud: 'https://soundcloud.com/eotoofficial' },
  'Excision': { spotify: 'https://open.spotify.com/artist/5FKchcZpQOkqFvXBj1aCvb', appleMusic: 'https://music.apple.com/us/artist/287726822', soundcloud: 'https://soundcloud.com/excision' },
  'Frost Children (DJ Set)': { spotify: 'https://open.spotify.com/artist/2armP2pVQFy1awZ8HLbCib', appleMusic: 'https://music.apple.com/us/artist/1505504789' },
  'Geese': { spotify: 'https://open.spotify.com/artist/0WCo84qtCKfbyIf1lqQWB4', appleMusic: 'https://music.apple.com/us/artist/1378038472', soundcloud: 'https://soundcloud.com/geeseband' },
  'Gravagerz': { spotify: 'https://open.spotify.com/artist/2zoy9aYWHueNXCIqh2MStc', appleMusic: 'https://music.apple.com/us/artist/1470583576', soundcloud: 'https://soundcloud.com/gravagerzarchive' },
  'Green Velvet': { spotify: 'https://open.spotify.com/artist/3ABaec4jjl95VqmG1iD4k2', appleMusic: 'https://music.apple.com/us/artist/4638965' },
  'Guavatron': { appleMusic: 'https://music.apple.com/us/artist/1173744864' },
  'Gudfella': { spotify: 'https://open.spotify.com/artist/3KjZMSSy0BaCVdvL0VABRO', appleMusic: 'https://music.apple.com/us/artist/1380740145', soundcloud: 'https://soundcloud.com/gudfellaofficial' },
  'Guerilla Toss': { spotify: 'https://open.spotify.com/artist/2PlLrStX2yK6CzyRi3TKnO', appleMusic: 'https://music.apple.com/us/artist/643320255' },
  'HAMDI': { spotify: 'https://open.spotify.com/artist/5CaHcocKuQuw805XFdSEQt', appleMusic: 'https://music.apple.com/us/artist/157234503', soundcloud: 'https://soundcloud.com/hamdiofficialmusic' },
  'Hershe': { spotify: 'https://open.spotify.com/artist/572W2DIMj2JYViwkIpae6J' },
  'Heyz': { spotify: 'https://open.spotify.com/artist/5X1EM1jg35YB5jmw7qVIlh', appleMusic: 'https://music.apple.com/us/artist/1281037215', soundcloud: 'https://soundcloud.com/heyzmsc' },
  'HHunter': { spotify: 'https://open.spotify.com/artist/5KH7MeHHmovSJL3Muoeqiw' },
  'INVT': { spotify: 'https://open.spotify.com/artist/7iS41tYQBUyJsZYcxCse0D', appleMusic: 'https://music.apple.com/us/artist/1233995602' },
  'Jackie Hollander': { spotify: 'https://open.spotify.com/artist/5ykY9Uweo3gl5VFpb6z6pQ', appleMusic: 'https://music.apple.com/us/artist/1593254397' },
  'Jerro': { spotify: 'https://open.spotify.com/artist/1WHFu22zN1C6F11Z1rt12K', appleMusic: 'https://music.apple.com/us/artist/1445444097' },
  'Jon Stickley Trio': { spotify: 'https://open.spotify.com/artist/72Swt388IKfP1jAgkiE17L', appleMusic: 'https://music.apple.com/us/artist/925037383' },
  'Joy Wagon': { appleMusic: 'https://music.apple.com/us/artist/1801566233' },
  'Karan!': { spotify: 'https://open.spotify.com/artist/6yP4wtuCtanniMox38L6NE', soundcloud: 'https://soundcloud.com/karanzera' },
  'Karina Rykman': { spotify: 'https://open.spotify.com/artist/4uiRvtezQs3mZ2OichIhYj', appleMusic: 'https://music.apple.com/us/artist/1467536824' },
  'Kasablanca': { spotify: 'https://open.spotify.com/artist/297Z0teiCkp5s9eneWROpI', appleMusic: 'https://music.apple.com/us/artist/1494470922', soundcloud: 'https://soundcloud.com/wearekasablanca' },
  'KETTAMA': { spotify: 'https://open.spotify.com/artist/2IkkP6VpsELlCC07Vp4Omr', appleMusic: 'https://music.apple.com/us/artist/kettama/1425703970', soundcloud: 'https://soundcloud.com/kettamabro' },
  'Lettuce': { spotify: 'https://open.spotify.com/artist/1fZXjUQEkVbB0TvZX4qFR8', appleMusic: 'https://music.apple.com/us/artist/3567105', soundcloud: 'https://soundcloud.com/lettucefunk' },
  'Levity': { appleMusic: 'https://music.apple.com/us/artist/levity/1505353688' },
  'Lewis OfMan': { spotify: 'https://open.spotify.com/artist/1hkRfKGoJisJDbo6eSf1pg', appleMusic: 'https://music.apple.com/us/artist/1096069043', soundcloud: 'https://soundcloud.com/lewis-ofman' },
  'LYNY': { spotify: 'https://open.spotify.com/artist/7xqIp1044Z2vd9v9ZphjLa', appleMusic: 'https://music.apple.com/us/artist/1299141955', soundcloud: 'https://soundcloud.com/lynyofficial' },
  "Maddy O'Neal": { spotify: 'https://open.spotify.com/artist/2G4VZIbfdmr60dYUB0oIxF', appleMusic: 'https://music.apple.com/us/artist/1126892905', soundcloud: 'https://soundcloud.com/maddy-oneal' },
  'Magoo': { spotify: 'https://open.spotify.com/artist/7pv3MRGkgkXa9Qn8sMctxT', appleMusic: 'https://music.apple.com/us/artist/magoo/59302844' },
  'Manic Focus': { spotify: 'https://open.spotify.com/artist/2xx0ChFyXa0a4S48GAXFUz', appleMusic: 'https://music.apple.com/us/artist/490073032', soundcloud: 'https://soundcloud.com/manicfocus' },
  'Midnight Generation': { spotify: 'https://open.spotify.com/artist/4CKIGHCZRzNoiNDSaW5eaq', appleMusic: 'https://music.apple.com/us/artist/1036865731' },
  'Motifv': { spotify: 'https://open.spotify.com/artist/3Q3g3xC2lDdLo3a04uK3Wp', appleMusic: 'https://music.apple.com/us/artist/1412553255' },
  'Mountain Grass Unit': { spotify: 'https://open.spotify.com/artist/0FWlJ725NEZpxqxjZG3yGl', appleMusic: 'https://music.apple.com/us/artist/1569370237' },
  'My Morning Jacket': { spotify: 'https://open.spotify.com/artist/43O3c6wewpzPKwVaGEEtBM' },
  'Of The Trees': { spotify: 'https://open.spotify.com/artist/5V7NIXgCnX2KuQ01Bxg20c', appleMusic: 'https://music.apple.com/us/artist/587967131', soundcloud: 'https://soundcloud.com/ofthetrees' },
  'Opiuo': { spotify: 'https://open.spotify.com/artist/69Fy7EM9qAFPdKSKLFU66b', appleMusic: 'https://music.apple.com/us/artist/350121467', soundcloud: 'https://soundcloud.com/opiuo' },
  'Pretty Lights': { spotify: 'https://open.spotify.com/artist/4iVhFmG8YCCEHANGeUUS9q', appleMusic: 'https://music.apple.com/us/artist/294600594', soundcloud: 'https://soundcloud.com/prettylights' },
  'Rudashi': { spotify: 'https://open.spotify.com/artist/4WosFotHevdwioaN3nqF6K', appleMusic: 'https://music.apple.com/us/artist/1466169504' },
  'Saka x Fly': { spotify: 'https://open.spotify.com/artist/78JjBYPpCRwGwaZff4qQrv', appleMusic: 'https://music.apple.com/us/artist/1489571289', soundcloud: 'https://soundcloud.com/soundslikesaka' },
  'Salute': { spotify: 'https://open.spotify.com/artist/1np8xozf7ATJZDi9JX8Dx5', appleMusic: 'https://music.apple.com/us/artist/969249942', soundcloud: 'https://soundcloud.com/saluteaut' },
  'Sneezy': { soundcloud: 'https://soundcloud.com/sneezymusic' },
  'Steller': { spotify: 'https://open.spotify.com/artist/7fNu9x4iV166BQmQQKOmXl' },
  'STS9': { spotify: 'https://open.spotify.com/artist/1eZ4td9oadjw7GkW0LzxNK', appleMusic: 'https://music.apple.com/us/artist/61286446', soundcloud: 'https://soundcloud.com/sts9' },
  'Supertaste': { spotify: 'https://open.spotify.com/artist/6C4cWzfNlyH0l5xTQPLQa6', soundcloud: 'https://soundcloud.com/supertastemusic' },
  "Taper's Choice": { spotify: 'https://open.spotify.com/artist/2hdj9S5AHGhs0VEM4RHYvL', appleMusic: 'https://music.apple.com/us/artist/1838505039' },
  'The Greyboy Allstars': { spotify: 'https://open.spotify.com/artist/3G8x1XQX8nCXYouEfMrP07', appleMusic: 'https://music.apple.com/us/artist/6326444' },
  'The String Cheese Incident': { spotify: 'https://open.spotify.com/artist/7N3JfLDzzjXdPbsyco7X0l', appleMusic: 'https://music.apple.com/us/artist/4071404' },
  'The Warren Haynes Incident': { spotify: 'https://open.spotify.com/artist/73iWh9WUMf0xK6cRkNJK4h', appleMusic: 'https://music.apple.com/us/artist/549279' },
  'Tini Gessler': { spotify: 'https://open.spotify.com/artist/5k1fr2qbGZrk40njMAyv0x', appleMusic: 'https://music.apple.com/us/artist/1153542075', soundcloud: 'https://soundcloud.com/tini-gessler' },
  'True Loves': { spotify: 'https://open.spotify.com/artist/1IlKHxSbOJDx10sotxhk4Z', appleMusic: 'https://music.apple.com/us/artist/269633170', soundcloud: 'https://soundcloud.com/truelovesband' },
  'Unknown Mortal Orchestra': { spotify: 'https://open.spotify.com/artist/1LeVJ5GPeYDOVUjxx1y7Rp', appleMusic: 'https://music.apple.com/us/artist/437580308' },
  '¥ØU$UK€ ¥UK1MAT$U': { spotify: 'https://open.spotify.com/artist/0BEmPeY22LTrZJFFP2xIyk', appleMusic: 'https://music.apple.com/us/artist/1830360631', soundcloud: 'https://soundcloud.com/yousukeyukimatsu' },
};

export default {
  slug,
  name: 'Suwannee Hulaween 2026',
  shortName: 'Hulaween',
  year: 2026,
  venue: 'Spirit of the Suwannee Music Park, Live Oak, FL',
  place: {
    name: 'Spirit of the Suwannee Music Park',
    streetAddress: '3076 95th Dr',
    addressLocality: 'Live Oak',
    addressRegion: 'FL',
    postalCode: '32060',
    addressCountry: 'US',
  },
  utcOffset: '-04:00',
  dateRange: 'October 22–25, 2026',
  officialUrl: 'https://hulaween.com/schedule/',
  dataVerifiedOn: '2026-10-05',
  // The poster's top line, one headliner per day.
  headliners: ['Excision', 'My Morning Jacket', 'Pretty Lights', 'Geese'],
  notableActs: [
    'The String Cheese Incident', 'The Warren Haynes Incident',
    'Unknown Mortal Orchestra', 'Green Velvet', 'STS9', 'Levity',
    'Ben Böhmer (Live)', 'Lettuce',
  ],
  stages,
  days,
  sets,
  artistLinks,
  groupNames: [
    'Spirit Lake Swimmers', 'Suwannee Spooks', 'Hula Hoopers', 'Meadow Moonwalkers',
    'Hallows Haunters', 'Live Oak Lurkers', 'Spanish Moss Posse', 'Cheese Heads',
    'Amphitheatre Apparitions', 'Costume Crew', 'Riverbank Revelers', 'Night Owl Squad',
  ],
};
