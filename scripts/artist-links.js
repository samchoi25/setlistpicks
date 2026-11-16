#!/usr/bin/env node
/*
 * Artist-link coverage report and generator — a step in adding any festival
 * (see the checklist at the top of shared/festivals/index.js).
 *
 *   node scripts/artist-links.js <slug>
 *       Report which acts on the festival's bill have no Spotify / Apple Music
 *       / SoundCloud links yet.
 *
 *   node scripts/artist-links.js <slug> [--aeg <dataPath>] [--musicbrainz] [--itunes]
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
 *                     Reliable for Spotify. Its `soundcloudUrl` field has held
 *                     TikTok links (Coachella 2027) and no Apple Music field
 *                     is published, so expect Spotify only from here.
 *
 *   --musicbrainz     For each act that already has a Spotify artist link,
 *                     asks MusicBrainz which artist that Spotify page belongs
 *                     to, then takes that artist's SoundCloud and Apple Music
 *                     links. Keyed on the Spotify ID rather than the name, so
 *                     no guessing between same-named acts; links here are
 *                     editor-curated. Rate-limited to one request a second.
 *
 *   --itunes          Apple's public iTunes Search API, for Apple Music links
 *                     MusicBrainz didn't have. Paced at ~20 requests a minute,
 *                     which is about what Apple tolerates before refusing.
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
  console.error('usage: node scripts/artist-links.js <slug> [--aeg <dataPath>] [--musicbrainz] [--itunes]');
  process.exit(2);
}

const args = process.argv.slice(2);
const slug = args.shift();
if (!slug) usage();
let aegPath; let useItunes = false; let useMb = false;
while (args.length) {
  const a = args.shift();
  if (a === '--aeg') aegPath = args.shift() ?? usage('--aeg needs a dataPath');
  else if (a === '--itunes') useItunes = true;
  else if (a === '--musicbrainz') useMb = true;
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

// What an artist profile's path looks like on each platform. Anything else —
// a Spotify /user/ page, a SoundCloud track or set, an Apple album — is not a
// profile and is dropped.
const PROFILE_PATHS = {
  spotify: /^\/artist\/[A-Za-z0-9]{22}$/,
  appleMusic: /^\/[a-z]{2}\/artist\/(?:[^/]+\/)?\d+$/,
  soundcloud: /^\/(?!search$|discover$|stream$)[^/]+$/,
};

function cleanUrl(platform, raw) {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  let url;
  try { url = new URL(raw.trim().replace(/^http:/, 'https:')); } catch { return undefined; }
  const host = url.hostname.replace(/^(www|m)\./, '');
  if (host !== HOSTS[platform]) return undefined;
  // Spotify's regional links (/intl-ko/artist/...) are the same page.
  const path = url.pathname.replace(/\/+$/, '').replace(/^\/intl-[a-z]{2}(?:-[a-z]{2})?(?=\/)/i, '');
  if (!PROFILE_PATHS[platform].test(path)) return undefined;
  return `https://${HOSTS[platform]}${path}`;
}

const acts = [...new Set(festival.SCHEDULE.flatMap((s) => s.artists))].sort();
const have = festival.artistLinks ?? {};
const missing = acts.filter((a) => !have[a]);
console.error(`${slug}: ${acts.length - missing.length}/${acts.length} acts have links`);

if (!aegPath && !useItunes && !useMb) {
  for (const a of missing) console.error(`  missing  ${a}`);
  process.exit(0);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// A generic client name: nothing identifying about who's running this.
async function getJson(url, { retryAfterMs = 0 } = {}) {
  const res = await fetch(url, { headers: { 'User-Agent': 'artist-links-script/1.0' } });
  if ((res.status === 429 || res.status === 403 || res.status === 503) && retryAfterMs) {
    await sleep(retryAfterMs);
    return getJson(url);
  }
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

const found = new Map(); // act -> { links, notes[] }
const wanted = new Map(missing.map((a) => [nameKey(a), a]));

if (aegPath) {
  const base = `https://events.aegamp.com/app/${aegPath}`;
  const index = await getJson(`${base}/artists.json`);
  for (const rec of Object.values(index)) {
    // AEG sometimes bills a show name the poster doesn't ("CHRIS STASSY
    // presents LINGER AV"), so fall back to the part before "presents".
    const title = rec.title ?? '';
    const act = wanted.get(nameKey(title)) ?? wanted.get(nameKey(title.split(/\s+presents\s+/i)[0]));
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

if (useMb) {
  const MB = 'https://musicbrainz.org/ws/2';
  for (const act of missing) {
    const spotify = found.get(act)?.links.spotify;
    if (!spotify) continue;
    try {
      await sleep(1100);
      const url = await getJson(`${MB}/url?resource=${encodeURIComponent(spotify)}&inc=artist-rels&fmt=json`, { retryAfterMs: 5000 });
      const ids = [...new Set((url.relations ?? []).map((r) => r.artist?.id).filter(Boolean))];
      if (ids.length !== 1) continue;
      await sleep(1100);
      const artist = await getJson(`${MB}/artist/${ids[0]}?inc=url-rels&fmt=json`, { retryAfterMs: 5000 });
      const entry = found.get(act);
      for (const rel of artist.relations ?? []) {
        const resource = rel.url?.resource;
        if (rel.ended || !resource) continue;
        for (const platform of ['soundcloud', 'appleMusic']) {
          const clean = cleanUrl(platform, resource);
          if (clean && !entry.links[platform]) entry.links[platform] = clean;
        }
      }
    } catch (e) {
      // 404 = MusicBrainz doesn't know this Spotify page; nothing to add.
      if (!/^404 /.test(e.message)) console.error(`  musicbrainz: ${act}: ${e.message}`);
    }
  }
}

if (useItunes) {
  for (const act of missing) {
    if (found.get(act)?.links.appleMusic) continue;
    const q = new URLSearchParams({ term: act, entity: 'musicArtist', limit: '10', country: 'us' });
    let results = [];
    try { ({ results } = await getJson(`https://itunes.apple.com/search?${q}`, { retryAfterMs: 60000 })); } catch (e) {
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
    await sleep(3200); // ~20/min; Apple starts refusing well before 1/s
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
