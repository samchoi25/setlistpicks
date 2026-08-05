// Build-time SEO prerender helpers.
// Imported by vite.config.js via transformIndexHtml.
// Generates static HTML (lineup) and JSON-LD (MusicFestival schema) from the
// shared schedule so Googlebot sees real content at `/` without running JS.

import { SCHEDULE, STAGES, DAYS, stagesForDay } from '../shared/schedule.js';

const STAGE_NAMES = Object.fromEntries(STAGES.map((s) => [s.id, s.name]));

// 'HH:MM' (24h) → '12:30 PM' display form
function fmtTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = String(m).padStart(2, '0');
  return `${h12}:${mm} ${ampm}`;
}

// 'HH:MM' + date string → ISO 8601 datetime with PT offset
function toIso(hhmm, dateStr) {
  // dateStr is like 'Aug 7'
  const monthMap = { Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12 };
  const [mon, day] = dateStr.split(' ');
  const month = String(monthMap[mon]).padStart(2, '0');
  const dayPad = String(day).padStart(2, '0');
  return `2026-${month}-${dayPad}T${hhmm}:00-07:00`;
}

export function renderLineupHtml() {
  const dayGroups = DAYS.map((day) => {
    const sets = SCHEDULE.filter((s) => s.dayId === day.id);
    // Group by stage, in STAGES order, using each stage's name for this day.
    const stageBlocks = stagesForDay(day.id).map((stage) => {
      const stageSets = sets
        .filter((s) => s.stageId === stage.id)
        .sort((a, b) => a.startMin - b.startMin);
      if (!stageSets.length) return '';
      const items = stageSets
        .map((s) => `<li><time datetime="${toIso(s.start, day.date)}">${fmtTime(s.start)}</time> &ndash; ${escHtml(s.artist)}</li>`)
        .join('');
      return `<div class="seo-stage"><h3>${escHtml(stage.name)}</h3><ul>${items}</ul></div>`;
    }).join('');
    return `<section class="seo-day"><h2>${escHtml(day.name)}, ${escHtml(day.date)}</h2>${stageBlocks}</section>`;
  }).join('');

  const artistCount = SCHEDULE.length;

  const stageList = STAGES.map((s) => s.name);
  const stageSentence = `${stageList.slice(0, -1).join(', ')}, and ${stageList[stageList.length - 1]}`;

  return `<div id="seo-prerender" aria-hidden="true" style="display:none">
<h1>Outside Lands 2026 Lineup &amp; Set Times</h1>
<p>Outside Lands 2026 runs August 7&ndash;9 in Golden Gate Park, San Francisco. ${artistCount} sets across ${STAGES.length} stages &mdash; ${escHtml(stageSentence)}. Headliners include Charli xcx, The Strokes, RÜFÜS DU SOL, and Baby Keem, plus Turnstile, The xx, PinkPantheress, Death Cab for Cutie, Ethel Cain, and Lucy Dacus. Use this tool to pick your must-see shows and plan with your crew.</p>
<p><a href="https://sfoutsidelands.com/lineup/" rel="noopener noreferrer">Official Outside Lands lineup &rarr;</a></p>
${dayGroups}
</div>`;
}

export function renderJsonLd() {
  const subEvents = SCHEDULE.map((s) => {
    const day = DAYS.find((d) => d.id === s.dayId);
    return {
      '@type': 'MusicEvent',
      name: s.artist,
      startDate: toIso(s.start, day.date),
      endDate: toIso(s.end, day.date),
      location: {
        '@type': 'Place',
        name: `${STAGE_NAMES[s.stageId]} — Golden Gate Park`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: '501 Stanyan St',
          addressLocality: 'San Francisco',
          addressRegion: 'CA',
          postalCode: '94117',
          addressCountry: 'US',
        },
      },
      performer: { '@type': 'MusicGroup', name: s.artist },
    };
  });

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MusicFestival',
    name: 'Outside Lands 2026',
    startDate: '2026-08-07T12:00:00-07:00',
    endDate: '2026-08-09T22:00:00-07:00',
    location: {
      '@type': 'Place',
      name: 'Golden Gate Park',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '501 Stanyan St',
        addressLocality: 'San Francisco',
        addressRegion: 'CA',
        postalCode: '94117',
        addressCountry: 'US',
      },
    },
    url: 'https://setlistpicks.com/',
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
