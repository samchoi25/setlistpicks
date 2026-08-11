import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { DEFAULT_FESTIVAL_SLUG } from '../shared/festivals/index.js';

const DEFAULT_DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(process.cwd(), 'data', 'setlistpicks.db');

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS groups (
    id            TEXT    PRIMARY KEY,
    name          TEXT    NOT NULL DEFAULT '',
    created_at    INTEGER NOT NULL,
    last_active   INTEGER NOT NULL,
    creator_ip    TEXT,
    -- Which festival's lineup this group is voting on. Defaulted so a database
    -- created before multi-festival support backfills to the original one.
    festival_slug TEXT    NOT NULL DEFAULT '${DEFAULT_FESTIVAL_SLUG}'
  );

  CREATE TABLE IF NOT EXISTS members (
    group_id     TEXT    NOT NULL REFERENCES groups(id),
    member_key   TEXT    NOT NULL,
    display_name TEXT    NOT NULL,
    joined_at    INTEGER NOT NULL,
    last_seen    INTEGER NOT NULL,
    creator_ip   TEXT,
    -- Set when someone leaves but asks to keep their picks. The row has to
    -- survive: votes reference it, and their name is needed to attribute the
    -- picks they left behind. Departed members are hidden from the roster.
    left_at      INTEGER,
    PRIMARY KEY (group_id, member_key)
  );

  CREATE TABLE IF NOT EXISTS votes (
    group_id   TEXT    NOT NULL,
    member_key TEXT    NOT NULL,
    artist_id  TEXT    NOT NULL,
    score      INTEGER NOT NULL CHECK(score IN (1, 3)),
    PRIMARY KEY (group_id, member_key, artist_id),
    FOREIGN KEY (group_id, member_key) REFERENCES members(group_id, member_key)
  );

  CREATE INDEX IF NOT EXISTS idx_votes_group ON votes(group_id);
  CREATE INDEX IF NOT EXISTS idx_members_group ON members(group_id);
  CREATE INDEX IF NOT EXISTS idx_groups_last_active ON groups(last_active);
  CREATE INDEX IF NOT EXISTS idx_groups_festival ON groups(festival_slug);
`;

// Columns added after the original schema shipped. Re-running is harmless:
// SQLite rejects a duplicate column and we swallow that specific case.
const MIGRATIONS = [
  'ALTER TABLE groups  ADD COLUMN creator_ip TEXT',
  'ALTER TABLE members ADD COLUMN creator_ip TEXT',
  `ALTER TABLE groups  ADD COLUMN festival_slug TEXT NOT NULL DEFAULT '${DEFAULT_FESTIVAL_SLUG}'`,
  'ALTER TABLE members ADD COLUMN left_at INTEGER',
];

/*
 * Open a database and bring it up to the current schema.
 *
 * Takes a path so tests can use ':memory:' — the module used to resolve
 * DB_PATH at import time, which made isolation impossible.
 */
export function openDb(dbPath = DEFAULT_DB_PATH) {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = new Database(dbPath);

  // WAL mode: concurrent readers + one writer, no blocking.
  db.pragma('journal_mode = WAL');
  // NORMAL sync is safe with WAL — only risks data loss on OS crash, not DB corruption.
  db.pragma('synchronous = NORMAL');
  // 16 MB in-process page cache.
  db.pragma('cache_size = -16000');
  db.pragma('foreign_keys = ON');

  db.exec(SCHEMA);
  for (const sql of MIGRATIONS) {
    try {
      db.exec(sql);
    } catch (e) {
      if (!/duplicate column name/i.test(e.message)) throw e;
    }
  }
  return db;
}

// Remove groups that have had no activity for 90 days.
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export function pruneStaleGroups(db, now = Date.now()) {
  const cutoff = now - NINETY_DAYS_MS;
  const stale = db.prepare('SELECT id FROM groups WHERE last_active < ?').all(cutoff);
  if (!stale.length) return 0;

  const delVotes = db.prepare('DELETE FROM votes   WHERE group_id = ?');
  const delMembers = db.prepare('DELETE FROM members WHERE group_id = ?');
  const delGroup = db.prepare('DELETE FROM groups  WHERE id = ?');

  db.transaction((rows) => {
    for (const { id } of rows) {
      delVotes.run(id);
      delMembers.run(id);
      delGroup.run(id);
    }
  })(stale);

  return stale.length;
}

// The process-wide database. Tests build their own with openDb(':memory:'),
// so pruning is scheduled here rather than inside openDb.
export const db = openDb();

const pruned = pruneStaleGroups(db);
if (pruned) console.log(`[db] pruned ${pruned} stale group(s)`);
setInterval(() => {
  const n = pruneStaleGroups(db);
  if (n) console.log(`[db] pruned ${n} stale group(s)`);
}, 6 * 60 * 60 * 1000).unref(); // every 6 hours, non-blocking

console.log(`[db] SQLite open at ${DEFAULT_DB_PATH}`);
