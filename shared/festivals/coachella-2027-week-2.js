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

// Theme: Coachella's festive palette — #eab041 golden yellow, #d85454 coral
// red, #5680db sky blue, #8e4cc7 purple, #4fb3d0 cyan. The page is a pale wash
// of the gold, and the text a deepened sky blue (#2A3F8F; the sky blue itself
// is 3.8:1 on a light ground, too faint for text). Lineup blocks and primary
// buttons are the purple, which carries white text (5.24:1); cyan secondary
// buttons take dark labels (7.6:1). Coral is left out on purpose: red can't
// fill a block, because MUST-SEE is a red highlighter wash and a red block
// would barely change when voted for.
const theme = {
  tokens: {
    '--bg': '#FBF0D6',
    '--paper': '#FFF9EC',
    '--ink': '#2A3F8F',
    '--btn-primary': '#8E4CC7',
    '--btn-secondary': '#4FB3D0',
    '--on-btn-secondary': '#121515',
    '--block-ink': '#FFFFFF',
  },
};

export default {
  ...common,
  slug,
  name: 'Coachella 2027 — Weekend Two',
  shortName: 'Coachella Week 2',
  theme,
  dateRange: 'April 16–18, 2027',
  stages,
  days,
  sets,
  groupNames: [
    'Polo Field Posse', 'Indio Insiders', 'Desert Heat Crew', 'Sahara Tent Squad', 'Mojave Mob', 'Gobi Gang', 'Weekend Two Wolfpack', 'Palm Tree Posse', 'Coachella Valley Crew', 'Do LaB Drifters', 'Ferris Wheel Fam', 'Golden Hour Gang',
  ],
};
