/*
 * Festivals that are coming but aren't on Setlist Picks yet — listed on the
 * landing page under "Coming soon" so people can see what's next.
 *
 * These are NOT festival definitions: no stages, no days, no page, no votes.
 * They're kept out of the registry (./index.js) on purpose, since everything
 * there is routable and buildFestival() needs real days. When one gets a
 * lineup worth voting on, give it a proper definition module and delete its
 * entry here.
 *
 * Two kinds of entry:
 *   - US festivals whose 2027 dates aren't announced yet (`start` is null,
 *     shown as "Dates TBA"). Bonnaroo is deliberately absent: it was called
 *     off for 2027 on 2026-08-21 after storm damage at The Farm.
 *   - International festivals with 2027 dates and at least a partial lineup.
 *
 * Gathered 2026-11-16 from news and ticketing listings (ConcertVacay's 2027
 * presale guide, Festival Networks' 2027 dates list, MELODIC on Download), not
 * every festival's own site — recheck before turning one into a definition.
 *
 * `start`/`end` are ISO dates; an entry drops off the list once `end` passes.
 * `headliners` is billing order where the source gave one, else as listed.
 */
export const ANNOUNCED_FESTIVALS = [
  // ─── US, 2027 dates not announced ───────────────────────────────────────
  { id: 'lollapalooza-2027', name: 'Lollapalooza 2027', shortName: 'Lollapalooza', venue: 'Grant Park, Chicago', country: 'US' },
  { id: 'governors-ball-2027', name: 'Governors Ball 2027', shortName: 'Governors Ball', venue: 'New York City', country: 'US' },
  { id: 'jazz-fest-2027', name: 'New Orleans Jazz & Heritage Festival 2027', shortName: 'Jazz Fest', venue: 'Fair Grounds Race Course, New Orleans', country: 'US' },
  { id: 'shaky-knees-2027', name: 'Shaky Knees 2027', shortName: 'Shaky Knees', venue: 'Atlanta', country: 'US' },
  { id: 'welcome-to-rockville-2027', name: 'Welcome to Rockville 2027', shortName: 'Welcome to Rockville', venue: 'Daytona Beach', country: 'US' },
  { id: 'hangout-2027', name: 'Hangout Music Festival 2027', shortName: 'Hangout', venue: 'Gulf Shores', country: 'US' },
  { id: 'okeechobee-2027', name: 'Okeechobee Music & Arts Festival 2027', shortName: 'Okeechobee', venue: 'Sunshine Grove, Okeechobee', country: 'US' },
  { id: 'lightning-in-a-bottle-2027', name: 'Lightning in a Bottle 2027', shortName: 'Lightning in a Bottle', venue: 'Buena Vista Lake, Bakersfield', country: 'US' },
  { id: 'daisy-chain-fields-2027', name: 'Daisy Chain Fields 2027', shortName: 'Daisy Chain Fields', venue: 'Great Park, Irvine', country: 'US' },
  { id: 'louder-than-life-2027', name: 'Louder Than Life 2027', shortName: 'Louder Than Life', venue: 'Highland Festival Grounds, Louisville', country: 'US' },
  { id: 'bourbon-and-beyond-2027', name: 'Bourbon & Beyond 2027', shortName: 'Bourbon & Beyond', venue: 'Highland Festival Grounds, Louisville', country: 'US' },
  { id: 'portola-2027', name: 'Portola Music Festival 2027', shortName: 'Portola', venue: 'Pier 80, San Francisco', country: 'US' },
  { id: 'sea-hear-now-2027', name: 'Sea.Hear.Now 2027', shortName: 'Sea.Hear.Now', venue: 'Asbury Park', country: 'US' },

  // ─── International, dated with a lineup ─────────────────────────────────
  {
    id: 'tomorrowland-winter-2027', name: 'Tomorrowland Winter 2027', shortName: 'Tomorrowland Winter',
    start: '2027-03-20', end: '2027-03-27', dateRange: 'March 20–27, 2027',
    venue: "Alpe d'Huez, France", country: 'FR',
  },
  {
    id: 'primavera-sound-2027', name: 'Primavera Sound Barcelona 2027', shortName: 'Primavera Sound',
    start: '2027-06-02', end: '2027-06-06', dateRange: 'June 2–6, 2027',
    venue: 'Parc del Fòrum, Barcelona', country: 'ES',
    headliners: ['Doechii', 'Phoebe Bridgers', 'Massive Attack', 'The Chemical Brothers', 'Fontaines D.C.', 'Robyn'],
  },
  {
    id: 'rock-am-ring-2027', name: 'Rock am Ring 2027', shortName: 'Rock am Ring',
    start: '2027-06-04', end: '2027-06-06', dateRange: 'June 4–6, 2027',
    venue: 'Nürburgring, Germany', country: 'DE',
    headliners: ['blink-182'],
  },
  {
    id: 'rock-im-park-2027', name: 'Rock im Park 2027', shortName: 'Rock im Park',
    start: '2027-06-04', end: '2027-06-06', dateRange: 'June 4–6, 2027',
    venue: 'Zeppelinfeld, Nuremberg', country: 'DE',
    headliners: ['blink-182'],
  },
  {
    id: 'download-2027', name: 'Download Festival 2027', shortName: 'Download',
    start: '2027-06-09', end: '2027-06-13', dateRange: 'June 9–13, 2027',
    venue: 'Donington Park, UK', country: 'GB',
    headliners: ['blink-182', 'Bring Me The Horizon', 'Evanescence'],
  },
  {
    id: 'isle-of-wight-2027', name: 'Isle of Wight Festival 2027', shortName: 'Isle of Wight',
    start: '2027-06-17', end: '2027-06-20', dateRange: 'June 17–20, 2027',
    venue: 'Seaclose Park, Newport, UK', country: 'GB',
    headliners: ['Fatboy Slim', 'Robbie Williams', 'Kings of Leon'],
  },
  {
    id: 'sonar-2027', name: 'Sónar Barcelona 2027', shortName: 'Sónar',
    start: '2027-06-17', end: '2027-06-19', dateRange: 'June 17–19, 2027',
    venue: 'Barcelona', country: 'ES',
    headliners: ['Carl Cox', 'Peggy Gou', 'Bonobo', 'Jessie Ware'],
  },
];

// Midnight after the last day, UTC — a day-level cutoff, like festivalEndsAt.
const endsAt = (entry) => (entry.end ? Date.parse(`${entry.end}T23:59:59Z`) : Infinity);

// Still-to-come entries: dated ones by start, then the TBA ones by name. A
// TBA entry's dateRange reads "2027 · Dates TBA", the year taken from its name.
export function listAnnouncedFestivals(now = new Date()) {
  return ANNOUNCED_FESTIVALS
    .filter((e) => endsAt(e) >= now.getTime())
    .map((e) => (e.dateRange ? e : { ...e, dateRange: `${e.name.match(/\d{4}$/)[0]} · Dates TBA` }))
    .sort((a, b) => {
      if (a.start && b.start) return a.start.localeCompare(b.start);
      if (a.start || b.start) return a.start ? -1 : 1;
      return a.shortName.localeCompare(b.shortName);
    });
}
