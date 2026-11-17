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
 * Three kinds of entry:
 *   - US festivals whose 2027 dates aren't announced yet (`start` is null,
 *     shown as "Dates TBA"). Bonnaroo is deliberately absent: it was called
 *     off for 2027 on 2026-08-21 after storm damage at The Farm.
 *   - US festivals with 2027 dates, lineup or not. Festivals with a page of
 *     their own (Coachella, Stagecoach, Big Ears, Welcome to Rockville, Sonic
 *     Temple, Primavera Sound) aren't here. A few dates are softer than others and say so in
 *     their dateRange (ACL and When We Were Young are month-level guesses;
 *     Rolling Loud's length was unclear in listings).
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
  { id: 'hangout-2027', name: 'Hangout Music Festival 2027', shortName: 'Hangout', venue: 'Gulf Shores', country: 'US' },
  { id: 'okeechobee-2027', name: 'Okeechobee Music & Arts Festival 2027', shortName: 'Okeechobee', venue: 'Sunshine Grove, Okeechobee', country: 'US' },
  { id: 'lightning-in-a-bottle-2027', name: 'Lightning in a Bottle 2027', shortName: 'Lightning in a Bottle', venue: 'Buena Vista Lake, Bakersfield', country: 'US' },
  { id: 'daisy-chain-fields-2027', name: 'Daisy Chain Fields 2027', shortName: 'Daisy Chain Fields', venue: 'Great Park, Irvine', country: 'US' },
  { id: 'louder-than-life-2027', name: 'Louder Than Life 2027', shortName: 'Louder Than Life', venue: 'Highland Festival Grounds, Louisville', country: 'US' },
  { id: 'bourbon-and-beyond-2027', name: 'Bourbon & Beyond 2027', shortName: 'Bourbon & Beyond', venue: 'Highland Festival Grounds, Louisville', country: 'US' },
  { id: 'portola-2027', name: 'Portola Music Festival 2027', shortName: 'Portola', venue: 'Pier 80, San Francisco', country: 'US' },
  { id: 'sea-hear-now-2027', name: 'Sea.Hear.Now 2027', shortName: 'Sea.Hear.Now', venue: 'Asbury Park', country: 'US' },

  // ─── US, 2027 dates announced ───────────────────────────────────────────
  {
    id: 'ultra-miami-2027', name: 'Ultra Music Festival 2027', shortName: 'Ultra Miami',
    start: '2027-03-26', end: '2027-03-28', dateRange: 'March 26–28, 2027',
    venue: 'Bayfront Park, Miami', country: 'US',
  },
  {
    id: 'treefort-2027', name: 'Treefort Music Fest 2027', shortName: 'Treefort',
    start: '2027-03-31', end: '2027-04-04', dateRange: 'March 31 – April 4, 2027',
    venue: 'Boise', country: 'US',
  },
  {
    id: 'rolling-loud-florida-2027', name: 'Rolling Loud Florida 2027', shortName: 'Rolling Loud Florida',
    start: '2027-05-07', end: '2027-05-09', dateRange: 'May 7–9, 2027 (to be confirmed)',
    venue: 'Camping World Stadium, Orlando', country: 'US',
  },
  {
    // Two separate weekends with their own tickets, so two entries, like
    // Coachella's week-1/week-2 definitions. Insomniac bills them Dusk and Dawn.
    id: 'edc-las-vegas-2027-week-1', name: 'EDC Las Vegas 2027 — Weekend One', shortName: 'EDC Las Vegas Week 1',
    start: '2027-05-14', end: '2027-05-16', dateRange: 'May 14–16, 2027',
    venue: 'Las Vegas Motor Speedway', country: 'US',
  },
  {
    id: 'edc-las-vegas-2027-week-2', name: 'EDC Las Vegas 2027 — Weekend Two', shortName: 'EDC Las Vegas Week 2',
    start: '2027-05-21', end: '2027-05-23', dateRange: 'May 21–23, 2027',
    venue: 'Las Vegas Motor Speedway', country: 'US',
  },
  {
    id: 'bottlerock-2027', name: 'BottleRock Napa Valley 2027', shortName: 'BottleRock',
    start: '2027-05-28', end: '2027-05-30', dateRange: 'May 28–30, 2027',
    venue: 'Napa Valley Expo, Napa', country: 'US',
  },
  {
    id: 'outside-lands-2027', name: 'Outside Lands 2027', shortName: 'Outside Lands',
    start: '2027-08-06', end: '2027-08-08', dateRange: 'August 6–8, 2027',
    venue: 'Golden Gate Park, San Francisco', country: 'US',
  },
  {
    id: 'aftershock-2027', name: 'Aftershock 2027', shortName: 'Aftershock',
    start: '2027-09-30', end: '2027-10-03', dateRange: 'September 30 – October 3, 2027',
    venue: 'Discovery Park, Sacramento', country: 'US',
  },
  {
    // Two weekends, same bill, like ACL 2026's week-1/week-2 definitions.
    // Dates are the expected Oct 1–3 and 8–10 pattern, not yet official.
    id: 'austin-city-limits-2027-week-1', name: 'Austin City Limits Music Festival 2027 — Weekend One', shortName: 'ACL Week 1',
    start: '2027-10-01', end: '2027-10-03', dateRange: 'October 1–3, 2027 (expected)',
    venue: 'Zilker Park, Austin', country: 'US',
  },
  {
    id: 'austin-city-limits-2027-week-2', name: 'Austin City Limits Music Festival 2027 — Weekend Two', shortName: 'ACL Week 2',
    start: '2027-10-08', end: '2027-10-10', dateRange: 'October 8–10, 2027 (expected)',
    venue: 'Zilker Park, Austin', country: 'US',
  },
  {
    id: 'when-we-were-young-2027', name: 'When We Were Young 2027', shortName: 'When We Were Young',
    start: '2027-10-01', end: '2027-10-31', dateRange: 'October 2027',
    venue: 'Las Vegas', country: 'US',
  },

  // ─── International, dated with a lineup ─────────────────────────────────
  {
    id: 'tomorrowland-winter-2027', name: 'Tomorrowland Winter 2027', shortName: 'Tomorrowland Winter',
    start: '2027-03-20', end: '2027-03-27', dateRange: 'March 20–27, 2027',
    venue: "Alpe d'Huez, France", country: 'FR',
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
