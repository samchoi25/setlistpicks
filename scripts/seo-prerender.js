// Build-time SEO prerender helpers.
// Imported by vite.config.js via transformIndexHtml.
// Generates static HTML (lineup) and JSON-LD (MusicFestival schema) so
// Googlebot sees real content without running JS.
//
// Everything here is a function of the festival passed in — nothing reads a
// module-level schedule — so one build can emit a page per festival.

export const SITE_ORIGIN = 'https://setlistpicks.com';

// Every festival is canonical at its own slug. `/` redirects to the default
// one rather than serving it, so `/` is never a canonical address.
export function canonicalPath(festival) {
  return `/${festival.slug}/`;
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
        .sort((a, b) => (a.timed ? a.startMin - b.startMin : a.artist.localeCompare(b.artist)));
      if (!stageSets.length) return '';
      // A stage's sets are all timed or all not (see festival.dayMode()) — no
      // set times yet means no <time> tag, just the name.
      const items = stageSets
        .map((s) => s.timed
          ? `<li><time datetime="${toIso(festival, s.start, day.date)}">${fmtTime(s.start)}</time> &ndash; ${escHtml(s.artist)}</li>`
          : `<li>${escHtml(s.artist)}</li>`)
        .join('');
      return `<div class="seo-stage"><h3>${escHtml(stage.name)}</h3><ul>${items}</ul></div>`;
    }).join('');
    // Acts with no stage assigned yet (nothing announced but the name) sit in
    // their own section, alphabetically.
    const unstaged = sets.filter((s) => !s.stageId).sort((a, b) => a.artist.localeCompare(b.artist));
    const unstagedBlock = unstaged.length
      ? `<div class="seo-stage"><ul>${unstaged.map((s) => `<li>${escHtml(s.artist)}</li>`).join('')}</ul></div>`
      : '';
    return `<section class="seo-day"><h2>${escHtml(day.name)}, ${escHtml(day.date)}</h2>${stageBlocks}${unstagedBlock}</section>`;
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

  // A MusicEvent needs a real date to be worth emitting — an act with no set
  // time yet (see festival.dayMode()) is skipped here, though it still shows
  // up in the visible HTML lineup above.
  const subEvents = festival.SCHEDULE.filter((s) => s.timed).map((s) => {
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
    // cannot drift from the set times below them. Omitted entirely if no set
    // times have been announced yet — GRID_START_MIN/END_MIN are both 0 then,
    // which would otherwise assert a false midnight start.
    ...(festival.SCHEDULE.some((s) => s.timed) && {
      startDate: toIso(festival, hhmm(festival.GRID_START_MIN), days[0].date),
      endDate: toIso(festival, hhmm(festival.GRID_END_MIN), days[days.length - 1].date),
    }),
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

/* ─── Page assembly ──────────────────────────────────────────────────────── */

export function pageTitle(festival) {
  return `${festival.name} Setlist Picker | ${festival.headliners.join(', ')}`;
}

export function pageDescription(festival) {
  const actCount = festival.SCHEDULE.reduce((n, s) => n + s.artists.length, 0);
  const named = [...festival.headliners, ...(festival.notableActs ?? [])];
  const rest = actCount - named.length;
  return `${festival.name} (${festival.dateRange}, ${festival.venue}): full lineup with `
    + `official set times across all ${festival.STAGES.length} stages. `
    + `${named.join(', ')}, and ${rest}+ more. Plan your weekend with friends.`;
}

// Tokens the template carries. Kept in one place so the tests can assert that
// a built page has none left unresolved.
export const PAGE_TOKENS = ['{{TITLE}}', '{{DESCRIPTION}}', '{{CANONICAL}}', '{{JSON_LD}}', '{{SEO_BODY}}'];

/*
 * Fill a template for one festival. Used by the dev-server plugin and by the
 * build script that writes a page per festival, so what you see while
 * developing is assembled the same way as what ships.
 */
export function renderPage(template, festival) {
  return template
    .replaceAll('{{TITLE}}', escHtml(pageTitle(festival)))
    .replaceAll('{{DESCRIPTION}}', escHtml(pageDescription(festival)))
    .replaceAll('{{CANONICAL}}', escHtml(canonicalUrl(festival)))
    .replace('{{JSON_LD}}', renderJsonLd(festival))
    .replace('{{SEO_BODY}}', renderLineupHtml(festival));
}

export function renderSitemap(festivals) {
  const urls = festivals.map((f) => [
    '  <url>',
    `    <loc>${escHtml(canonicalUrl(f))}</loc>`,
    f.dataVerifiedOn ? `    <lastmod>${f.dataVerifiedOn}</lastmod>` : '',
    '    <changefreq>weekly</changefreq>',
    '    <priority>1.0</priority>',
    '  </url>',
  ].filter(Boolean).join('\n')).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
