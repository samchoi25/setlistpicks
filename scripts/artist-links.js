#!/usr/bin/env node
/*
 * Artist-link coverage report and generator — a step in adding any festival
 * (see the checklist at the top of shared/festivals/index.js).
 *
 *   node scripts/artist-links.js <slug>
 *       Report which acts on the festival's bill have no Spotify / Apple Music
 *       / SoundCloud links yet.
 *
 *   node scripts/artist-links.js <slug> --aeg <dataPath> [--itunes]
 *       Also generate entries for the missing acts, printed to stdout as lines
 *       to paste into the festival's `artistLinks` map.
 *
 * Sources, in order of trust:
 *
 *   --aeg <dataPath>  The festival's own artist records, for AEG/Goldenvoice
 *                     events (Coachella, Portola, Outside Lands, ...). The
 *                     dataPath is the `data-path` attribute on the lineup
 *                     page's embed, e.g.
 *                       curl -s https://www.coachella.com/lineup | grep -o 'data-path="[^"]*"'
 *                     There may be several (one per lineup view); try each.
 *                     Gives Spotify and SoundCloud — AEG doesn't publish
 *                     Apple Music.
 *
 *   --itunes          Apple's public iTunes Search API, for Apple Music links.
 *                     Accepted only on a single exact-name match, and still
 *                     marked `// check` in the output: a shared name is the
 *                     usual way a wrong link gets in, so every one of these
 *                     needs a human look before committing.
 *
 * Every URL is normalised the way the rest of the repo stores them: https,
 * the platform's canonical host, no query string (drops `?si=` and UTM
 * tracking). Nothing here edits a festival file; review and paste.
 */
import { getFestival } from '../shared/festivals/index.js';

const HOSTS = {
  spotify: 'open.spotify.com',
  appleMusic: 'music.apple.com',
  soundcloud: 'soundcloud.com',
};

function usage(msg) {
  if (msg) console.error(msg);
  console.error('usage: node scripts/artist-links.js <slug> [--aeg <dataPath>] [--itunes]');
  process.exit(2);
}

const args = process.argv.slice(2);
const slug = args.shift();
if (!slug) usage();
let aegPath; let useItunes = false;
while (args.length) {
  const a = args.shift();
  if (a === '--aeg') aegPath = args.shift() ?? usage('--aeg needs a dataPath');
  else if (a === '--itunes') useItunes = true;
  else usage(`unknown argument ${a}`);
}

const festival = getFestival(slug);
if (!festival) usage(`no festival '${slug}'`);

// Loose key for matching a source's spelling to the poster's: case, accents,
// punctuation and a leading "The" all vary between the two.
function nameKey(name) {
  return name.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/^the\s+/, '').replace(/[^a-z0-9]+/g, '');
}

function cleanUrl(platform, raw) {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  let url;
  try { url = new URL(raw.trim().replace(/^http:/, 'https:')); } catch { return undefined; }
  const host = url.hostname.replace(/^(www|m)\./, '');
  if (host !== HOSTS[platform]) return undefined;
  return `https://${HOSTS[platform]}${url.pathname.replace(/\/+$/, '')}`;
}

const acts = [...new Set(festival.SCHEDULE.flatMap((s) => s.artists))].sort();
const have = festival.artistLinks ?? {};
const missing = acts.filter((a) => !have[a]);
console.error(`${slug}: ${acts.length - missing.length}/${acts.length} acts have links`);

if (!aegPath && !useItunes) {
  for (const a of missing) console.error(`  missing  ${a}`);
  process.exit(0);
}

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'setlistpicks-artist-links' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

const found = new Map(); // act -> { links, notes[] }
const wanted = new Map(missing.map((a) => [nameKey(a), a]));

if (aegPath) {
  const base = `https://events.aegamp.com/app/${aegPath}`;
  const index = await getJson(`${base}/artists.json`);
  for (const rec of Object.values(index)) {
    const act = wanted.get(nameKey(rec.title ?? ''));
    if (!act) continue;
    let detail;
    try { detail = await getJson(`${base}/${rec._id}.json`); } catch (e) {
      console.error(`  aeg: no detail for ${rec.title}: ${e.message}`);
      continue;
    }
    const links = {};
    const spotify = cleanUrl('spotify', detail.spotifyUrl);
    const soundcloud = cleanUrl('soundcloud', detail.soundcloudUrl);
    // Not rendered by AEG's own app, but present on some records. Portola's
    // data had x.com links in this slot, which cleanUrl's host check rejects.
    const apple = cleanUrl('appleMusic', detail.appleMusicUrl ?? detail.appleUrl);
    if (spotify) links.spotify = spotify;
    if (apple) links.appleMusic = apple;
    if (soundcloud) links.soundcloud = soundcloud;
    if (Object.keys(links).length) found.set(act, { links, notes: [] });
  }
}

if (useItunes) {
  for (const act of missing) {
    if (found.get(act)?.links.appleMusic) continue;
    const q = new URLSearchParams({ term: act, entity: 'musicArtist', limit: '10', country: 'us' });
    let results = [];
    try { ({ results } = await getJson(`https://itunes.apple.com/search?${q}`)); } catch (e) {
      console.error(`  itunes: ${act}: ${e.message}`);
    }
    const exact = results.filter((r) => nameKey(r.artistName) === nameKey(act));
    if (exact.length === 1) {
      const url = cleanUrl('appleMusic', exact[0].artistLinkUrl);
      if (url) {
        const entry = found.get(act) ?? { links: {}, notes: [] };
        entry.links.appleMusic = url;
        entry.notes.push(`check Apple Music (${exact[0].primaryGenreName ?? 'no genre'})`);
        found.set(act, entry);
      }
    } else if (exact.length > 1) {
      console.error(`  itunes: ${act}: ${exact.length} artists share this name — look it up by hand`);
    }
    await new Promise((r) => setTimeout(r, 350)); // stay well inside Apple's rate limit
  }
}

const q = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
for (const act of missing) {
  const entry = found.get(act);
  if (!entry) continue;
  const order = ['spotify', 'appleMusic', 'soundcloud'].filter((k) => entry.links[k]);
  const body = order.map((k) => `${k}: ${q(entry.links[k])}`).join(', ');
  const note = entry.notes.length ? ` // ${entry.notes.join('; ')}` : '';
  console.log(`  ${q(act)}: { ${body} },${note}`);
}
const still = missing.filter((a) => !found.has(a));
console.error(`generated ${found.size}; still missing ${still.length}:`);
for (const a of still) console.error(`  missing  ${a}`);
