// Build-time SEO prerender helpers.
// Imported by vite.config.js via transformIndexHtml.
// Generates static HTML (lineup) and JSON-LD (MusicFestival schema) so
// Googlebot sees real content without running JS.
//
// Everything here is a function of the festival passed in — nothing reads a
// module-level schedule — so one build can emit a page per festival.

import { DEFAULT_FESTIVAL_SLUG } from '../shared/festivals/index.js';

export const SITE_ORIGIN = 'https://setlistpicks.com';

// The default festival is served at the site root until there is a picker;
// every other festival lives under its slug.
export function canonicalPath(festival) {
  return festival.slug === DEFAULT_FESTIVAL_SLUG ? '/' : `/${festival.slug}/`;
}

export function canonicalUrl(festival) {
  return SITE_ORIGIN + canonicalPath(festival);
}

// 'HH:MM' (24h) → '12:30 PM' display form
function fmtTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = String(m).padStart(2, '0');
  return `${h12}:${mm} ${ampm}`;
}

const MONTHS = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

// 'HH:MM' + a day's date string ('Aug 7') → ISO 8601 with the festival's offset
function toIso(festival, hhmm, dateStr) {
  const [mon, day] = dateStr.split(' ');
  const month = String(MONTHS[mon]).padStart(2, '0');
  const dayPad = String(day).padStart(2, '0');
  return `${festival.year}-${month}-${dayPad}T${hhmm}:00${festival.utcOffset}`;
}

function list(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

export function renderLineupHtml(festival) {
  const dayGroups = festival.DAYS.map((day) => {
    const sets = festival.SCHEDULE.filter((s) => s.dayId === day.id);
    // Group by stage, in canonical order, using each stage's name for this day.
    const stageBlocks = festival.stagesForDay(day.id).map((stage) => {
      const stageSets = sets
        .filter((s) => s.stageId === stage.id)
        .sort((a, b) => a.startMin - b.startMin);
      if (!stageSets.length) return '';
      const items = stageSets
        .map((s) => `<li><time datetime="${toIso(festival, s.start, day.date)}">${fmtTime(s.start)}</time> &ndash; ${escHtml(s.artist)}</li>`)
        .join('');
      return `<div class="seo-stage"><h3>${escHtml(stage.name)}</h3><ul>${items}</ul></div>`;
    }).join('');
    return `<section class="seo-day"><h2>${escHtml(day.name)}, ${escHtml(day.date)}</h2>${stageBlocks}</section>`;
  }).join('');

  const actCount = festival.SCHEDULE.reduce((n, s) => n + s.artists.length, 0);
  const stageSentence = list(festival.STAGES.map((s) => s.name));
  const headliners = list(festival.headliners);
  const notable = festival.notableActs?.length
    ? `, plus ${list(festival.notableActs)}`
    : '';

  return `<div id="seo-prerender" aria-hidden="true" style="display:none">
<h1>${escHtml(festival.name)} Lineup &amp; Set Times</h1>
<p>${escHtml(festival.name)} runs ${escHtml(festival.dateRange)} at ${escHtml(festival.venue)}. ${actCount} sets across ${festival.STAGES.length} stages &mdash; ${escHtml(stageSentence)}. Headliners include ${escHtml(headliners)}${escHtml(notable)}. Use this tool to pick your must-see shows and plan with your crew.</p>
<p><a href="${escHtml(festival.officialUrl)}" rel="noopener noreferrer">Official ${escHtml(festival.shortName)} lineup &rarr;</a></p>
${dayGroups}
</div>`;
}

export function renderJsonLd(festival) {
  const days = festival.DAYS;
  const pad = (n) => String(n).padStart(2, '0');
  const hhmm = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

  const subEvents = festival.SCHEDULE.map((s) => {
    const day = days.find((d) => d.id === s.dayId);
    const stage = festival.stagesForDay(s.dayId).find((st) => st.id === s.stageId);
    return {
      '@type': 'MusicEvent',
      name: s.artist,
      startDate: toIso(festival, s.start, day.date),
      endDate: toIso(festival, s.end, day.date),
      location: {
        '@type': 'Place',
        name: `${stage?.name ?? s.stageId} — ${festival.place.name}`,
        address: { '@type': 'PostalAddress', ...festival.place, name: undefined },
      },
      // Co-billed slots carry one performer entry per act.
      performer: s.artists.map((name) => ({ '@type': 'MusicGroup', name })),
    };
  });

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MusicFestival',
    name: festival.name,
    // Derived from the schedule's own bounds rather than restated, so they
    // cannot drift from the set times below them.
    startDate: toIso(festival, hhmm(festival.GRID_START_MIN), days[0].date),
    endDate: toIso(festival, hhmm(festival.GRID_END_MIN), days[days.length - 1].date),
    location: {
      '@type': 'Place',
      name: festival.place.name,
      address: { '@type': 'PostalAddress', ...festival.place, name: undefined },
    },
    url: canonicalUrl(festival),
    subEvent: subEvents,
  };

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
