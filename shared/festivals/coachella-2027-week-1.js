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

// Theme: Coachella's official brand colours — #121515 charcoal, #336D8E
// slate blue, #859A2E olive, #4E6234 moss, #44A1A4 teal, #85CFC4 soft aqua.
// There's no dark mode, so the charcoal is the text rather than the ground,
// and the page is a pale wash of the soft aqua. Lineup blocks (and primary
// buttons) take the slate blue: it's the one mid-tone that carries white text
// (5.65:1) and stays dark enough for the highlighter washes to read on it.
// Olive carries charcoal labels (5.82:1) on secondary buttons. Moss and teal
// have nothing to colour until stages are announced; they're the natural
// stage fills then (teal needs dark text: white is 3.05:1 on it).
const theme = {
  tokens: {
    '--bg': '#D6EEEA',
    '--paper': '#EEF8F6',
    '--ink': '#121515',
    '--btn-primary': '#336D8E',
    '--btn-secondary': '#859A2E',
    '--on-btn-secondary': '#121515',
    '--block-ink': '#FFFFFF',
  },
};

export default {
  ...common,
  slug,
  name: 'Coachella 2027 — Weekend One',
  shortName: 'Coachella Week 1',
  theme,
  dateRange: 'April 9–11, 2027',
  stages,
  days,
  sets,
  groupNames: [
    'Polo Field Posse', 'Indio Insiders', 'Desert Heat Crew', 'Sahara Tent Squad', 'Mojave Mob', 'Gobi Gang', 'Weekend One Wolfpack', 'Palm Tree Posse', 'Coachella Valley Crew', 'Do LaB Drifters', 'Ferris Wheel Fam', 'Golden Hour Gang',
  ],
};
