// Coachella 2027, Weekend Two (April 16–18, 2027) — festival definition.
// Lineup, sourcing and judgement calls live in coachella-2027-lineup.js; both
// weekends play the same bill, so this file only carries the dates.

import { common, sets, stages } from './coachella-2027-lineup.js';

const slug = 'coachella-2027-week-2';

const days = [
  { id: 'fri', name: 'Friday', date: 'Apr 16' },
  { id: 'sat', name: 'Saturday', date: 'Apr 17' },
  { id: 'sun', name: 'Sunday', date: 'Apr 18' },
];

export default {
  ...common,
  slug,
  name: 'Coachella 2027 — Weekend Two',
  shortName: 'Coachella Week 2',
  dateRange: 'April 16–18, 2027',
  stages,
  days,
  sets,
  groupNames: [
    'Polo Field Posse', 'Indio Insiders', 'Desert Heat Crew', 'Sahara Tent Squad', 'Mojave Mob', 'Gobi Gang', 'Weekend Two Wolfpack', 'Palm Tree Posse', 'Coachella Valley Crew', 'Do LaB Drifters', 'Ferris Wheel Fam', 'Golden Hour Gang',
  ],
};
