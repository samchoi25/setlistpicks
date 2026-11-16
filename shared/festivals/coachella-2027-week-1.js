// Coachella 2027, Weekend One (April 9–11, 2027) — festival definition.
// Lineup, sourcing and judgement calls live in coachella-2027-lineup.js; both
// weekends play the same bill, so this file only carries the dates.

import { common, sets, stages } from './coachella-2027-lineup.js';

const slug = 'coachella-2027-week-1';

const days = [
  { id: 'fri', name: 'Friday', date: 'Apr 9' },
  { id: 'sat', name: 'Saturday', date: 'Apr 10' },
  { id: 'sun', name: 'Sunday', date: 'Apr 11' },
];

export default {
  ...common,
  slug,
  name: 'Coachella 2027 — Weekend One',
  shortName: 'Coachella Week 1',
  dateRange: 'April 9–11, 2027',
  stages,
  days,
  sets,
  groupNames: [
    'Polo Field Posse', 'Indio Insiders', 'Desert Heat Crew', 'Sahara Tent Squad', 'Mojave Mob', 'Gobi Gang', 'Weekend One Wolfpack', 'Palm Tree Posse', 'Coachella Valley Crew', 'Do LaB Drifters', 'Ferris Wheel Fam', 'Golden Hour Gang',
  ],
};
