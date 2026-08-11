import express from 'express';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import {
  createGroup,
  getGroupMeta,
  getGroupFestivalSlug,
  joinGroup,
  listMembers,
  setVote,
  getMyVotes,
  getAllVotes,
  updateGroupName,
  updateMemberDisplayName,
  removeMember,
} from './groups.js';
import { adminRouter } from './admin.js';
import { getFestival, listFestivals, DEFAULT_FESTIVAL_SLUG } from '../shared/festivals/index.js';
import { parsePath, canonicalRedirect, isGroupPath } from '../shared/routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 8080;

const app = express();
// Trust the full X-Forwarded-For chain (needed for req.ip fallback in local dev).
app.set('trust proxy', true);
app.use(express.json({ limit: '32kb' }));

// Fly.io sets Fly-Client-IP to the real end-user IP before the request reaches
// the app machine, so prefer that over req.ip (which can resolve to a Fly infra IP).
function clientIp(req) {
  return req.headers['fly-client-ip'] || req.ip;
}

// ─── WebSocket rooms ──────────────────────────────────────────────────────────
// groupId → Set<WebSocket>. Single-process so no pub/sub needed.
const rooms = new Map();

function joinRoom(groupId, ws) {
  if (!rooms.has(groupId)) rooms.set(groupId, new Set());
  rooms.get(groupId).add(ws);
}

function leaveRoom(groupId, ws) {
  const room = rooms.get(groupId);
  if (!room) return;
  room.delete(ws);
  if (room.size === 0) rooms.delete(groupId);
}

function broadcastVotes(groupId) {
  const room = rooms.get(groupId);
  if (!room || room.size === 0) return;
  const meta = getGroupMeta(groupId);
  const payload = JSON.stringify({
    type: 'votes',
    groupName: meta?.name,
    ...getAllVotes(groupId),
  });
  for (const ws of room) {
    if (ws.readyState === 1 /* OPEN */) ws.send(payload);
  }
}

// ─── HTTP + WS server ─────────────────────────────────────────────────────────
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://localhost`);
  const groupId = url.searchParams.get('group');
  if (!groupId) return ws.close(1008, 'missing group');

  joinRoom(groupId, ws);

  // Send current votes immediately on connect so new joiners are in sync.
  try {
    const meta = getGroupMeta(groupId);
    if (meta) ws.send(JSON.stringify({ type: 'votes', ...getAllVotes(groupId) }));
  } catch { /* ignore */ }

  ws.on('close', () => leaveRoom(groupId, ws));
  ws.on('error', () => ws.close());
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.get('/healthz', (_req, res) => res.send('ok'));

// Defaults to the festival `/` serves, so existing callers keep working;
// `?festival=<slug>` selects another.
app.get('/api/schedule', (req, res) => {
  const festival = getFestival(req.query.festival ?? DEFAULT_FESTIVAL_SLUG);
  if (!festival) return res.status(404).json({ error: 'unknown_festival' });
  res.json({
    festival: { slug: festival.slug, name: festival.name },
    stages: festival.STAGES,
    days: festival.DAYS,
    schedule: festival.SCHEDULE,
  });
});

app.post('/api/groups', (req, res) => {
  try {
    const meta = createGroup({
      groupName: req.body?.groupName,
      festivalSlug: req.body?.festivalSlug,
      creatorIp: clientIp(req),
    });
    if (meta.error === 'rate_limited') return res.status(429).json(meta);
    if (meta.error === 'unknown_festival') return res.status(400).json(meta);
    res.json(meta);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/groups/:groupId', (req, res) => {
  const meta = getGroupMeta(req.params.groupId);
  if (!meta) return res.status(404).json({ error: 'group_not_found' });
  const members = listMembers(req.params.groupId);
  res.json({ ...meta, members });
});

app.patch('/api/groups/:groupId', (req, res) => {
  const result = updateGroupName(req.params.groupId, req.body?.name);
  if (result.error) return res.status(400).json(result);
  broadcastVotes(req.params.groupId);
  res.json(result);
});

app.post('/api/groups/:groupId/join', (req, res) => {
  const result = joinGroup(req.params.groupId, req.body?.displayName, clientIp(req));
  if (result.error === 'rate_limited') return res.status(429).json(result);
  if (result.error) return res.status(400).json(result);
  // Broadcast updated member list to group
  broadcastVotes(req.params.groupId);
  res.json(result);
});

app.patch('/api/groups/:groupId/members/:memberKey', (req, res) => {
  const result = updateMemberDisplayName(req.params.groupId, req.params.memberKey, req.body?.displayName);
  if (result.error) return res.status(400).json(result);
  broadcastVotes(req.params.groupId);
  res.json(result);
});

app.delete('/api/groups/:groupId/members/:memberKey', (req, res) => {
  const keepVotes = req.query.keepVotes === 'true';
  const result = removeMember(req.params.groupId, req.params.memberKey, { keepVotes });
  if (result.error) return res.status(400).json(result);
  broadcastVotes(req.params.groupId);
  res.json(result);
});

app.get('/api/groups/:groupId/votes', (req, res) => {
  const meta = getGroupMeta(req.params.groupId);
  if (!meta) return res.status(404).json({ error: 'group_not_found' });
  res.json(getAllVotes(req.params.groupId));
});

app.get('/api/groups/:groupId/votes/:memberKey', (req, res) => {
  const meta = getGroupMeta(req.params.groupId);
  if (!meta) return res.status(404).json({ error: 'group_not_found' });
  res.json({ votes: getMyVotes(req.params.groupId, req.params.memberKey) });
});

app.post('/api/groups/:groupId/votes/:memberKey', (req, res) => {
  const { artistId, score } = req.body || {};
  const result = setVote(req.params.groupId, req.params.memberKey, artistId, score);
  if (result.error === 'group_not_found') return res.status(404).json(result);
  if (result.error) return res.status(400).json(result);
  // Push live vote update to everyone in the group
  broadcastVotes(req.params.groupId);
  res.json(result);
});

// ─── Admin ────────────────────────────────────────────────────────────────────
app.use('/admin', adminRouter);

// ─── Static / SPA ─────────────────────────────────────────────────────────────
const distDir = path.join(ROOT, 'dist');

if (fs.existsSync(distDir)) {
  // index:false so `/` falls through to the route handler below — otherwise
  // static serves dist/index.html directly and the redirect never runs.
  // redirect:false because dist now holds a directory per festival, and
  // serve-static would otherwise bounce /outside-lands-2026 to a trailing
  // slash before our router ever sees it.
  app.use(express.static(distDir, { index: false, redirect: false }));

  /*
   * Two cached variants per festival, read once at boot from the pages
   * build-pages.js generated:
   *   festivalHtml — that festival's page, indexable
   *   groupHtml    — the same page marked noindex, for a crew's private URL,
   *                  which would otherwise duplicate the festival page
   */
  const readPage = (slug) => {
    const file = slug
      ? path.join(distDir, slug, 'index.html')
      : path.join(distDir, 'index.html');
    return fs.readFileSync(fs.existsSync(file) ? file : path.join(distDir, 'index.html'), 'utf8');
  };

  const noindex = (html) => html
    .replace('<meta name="robots" content="index, follow" />',
             '<meta name="robots" content="noindex, follow" />');

  const pages = new Map(); // slug -> { festivalHtml, groupHtml }
  for (const festival of listFestivals()) {
    const html = readPage(festival.slug);
    pages.set(festival.slug, { festivalHtml: html, groupHtml: noindex(html) });
  }
  const fallbackHtml = readPage(null);

  app.get(/^(?!\/api\/|\/healthz).*/, (req, res) => {
    const parsed = parsePath(req.path);
    const target = canonicalRedirect(parsed, {
      defaultSlug: DEFAULT_FESTIVAL_SLUG,
      lookupFestival: getGroupFestivalSlug,
    });

    if (target) {
      const qs = req.originalUrl.slice(req.path.length); // keep ?utm=… intact
      // `/` is temporary — it becomes a festival picker, so it must not be
      // cached as permanent. Aliases and legacy group links are permanent.
      const status = parsed.kind === 'home' ? 302 : 301;
      return res.redirect(status, target + qs);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    const page = pages.get(parsed.canonicalSlug);
    if (parsed.kind === 'festival') return res.send(page.festivalHtml);
    if (parsed.kind === 'group') return res.send(page.groupHtml);
    // A legacy code whose group is gone, or an unrecognised path: the SPA
    // handles it, and it should not be indexed under any festival.
    return res.send(noindex(fallbackHtml));
  });
} else if (process.env.NODE_ENV === 'production') {
  console.warn('[server] dist/ not found; did you run `npm run build`?');
}

httpServer.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
