import test from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import { openDb, pruneStaleGroups } from '../server/db.js';
import { createStore } from '../server/groups.js';
import { getFestival, DEFAULT_FESTIVAL_SLUG } from '../shared/festivals/index.js';

const festival = getFestival(DEFAULT_FESTIVAL_SLUG);
const setId = (n = 0) => festival.SCHEDULE[n].id;

// Each test gets its own database so ordering never matters.
function fresh() {
  const db = openDb(':memory:');
  return { db, store: createStore(db) };
}

function groupWithMember(store, opts = {}) {
  const group = store.createGroup({ groupName: 'Test Crew', ...opts });
  const { member } = store.joinGroup(group.id, 'Alex');
  return { group, member };
}

test('a new group is bound to the default festival', () => {
  const { store } = fresh();
  const group = store.createGroup({ groupName: 'Crew' });
  assert.equal(group.festivalSlug, DEFAULT_FESTIVAL_SLUG);
  assert.equal(store.getGroupMeta(group.id).festivalSlug, DEFAULT_FESTIVAL_SLUG);
});

test('an alias is stored as its canonical slug', () => {
  // Otherwise the same festival could be recorded under two names and a
  // vote's festival check would depend on which URL created the group.
  const { store } = fresh();
  const group = store.createGroup({ groupName: 'Crew', festivalSlug: 'outside-lands' });
  assert.equal(group.festivalSlug, 'outside-lands-2026');
});

test('an unknown festival is rejected rather than defaulted', () => {
  const { store } = fresh();
  assert.deepEqual(
    store.createGroup({ groupName: 'Crew', festivalSlug: 'nope-2099' }),
    { error: 'unknown_festival' },
  );
});

test('votes round-trip', () => {
  const { store } = fresh();
  const { group, member } = groupWithMember(store);

  assert.deepEqual(store.setVote(group.id, member.key, setId(0), 3), { ok: true });
  assert.deepEqual(store.getMyVotes(group.id, member.key), { [setId(0)]: 3 });

  // Re-voting updates in place rather than inserting a second row.
  store.setVote(group.id, member.key, setId(0), 1);
  assert.deepEqual(store.getMyVotes(group.id, member.key), { [setId(0)]: 1 });

  // Score 0 clears.
  store.setVote(group.id, member.key, setId(0), 0);
  assert.deepEqual(store.getMyVotes(group.id, member.key), {});
});

test('a vote for another festival is refused', () => {
  // The whole point of namespacing set ids: this must be detectable.
  const { db, store } = fresh();
  const { group, member } = groupWithMember(store);
  db.prepare('UPDATE groups SET festival_slug = ? WHERE id = ?')
    .run('some-other-fest', group.id);

  assert.deepEqual(
    store.setVote(group.id, member.key, setId(0), 3),
    { error: 'wrong_festival' },
  );
  assert.deepEqual(store.getMyVotes(group.id, member.key), {});
});

test('a vote for an unknown set is refused', () => {
  const { store } = fresh();
  const { group, member } = groupWithMember(store);
  for (const bad of ['fri-landsend-0', 'outside-lands-2026:nope', '', 'x']) {
    assert.deepEqual(
      store.setVote(group.id, member.key, bad, 3),
      { error: 'invalid_artist' },
      bad,
    );
  }
});

test('bare pre-namespace ids no longer resolve', () => {
  // Guards the id format change: the old scheme must not silently work.
  const { store } = fresh();
  const { group, member } = groupWithMember(store);
  assert.deepEqual(
    store.setVote(group.id, member.key, 'fri-landsend-0', 3),
    { error: 'invalid_artist' },
  );
});

test('invalid scores and non-members are refused', () => {
  const { store } = fresh();
  const { group, member } = groupWithMember(store);
  for (const bad of [2, 4, -1, 'x', null]) {
    assert.equal(store.setVote(group.id, member.key, setId(0), bad).error, 'invalid_score', String(bad));
  }
  assert.equal(store.setVote(group.id, 'nobody', setId(0), 3).error, 'not_a_member');
  assert.equal(store.setVote('nogroup123', member.key, setId(0), 3).error, 'group_not_found');
});

test('joining twice under the same name reuses the member', () => {
  const { store } = fresh();
  const group = store.createGroup({ groupName: 'Crew' });
  const a = store.joinGroup(group.id, 'Alex').member;
  const b = store.joinGroup(group.id, '  alex  ').member;
  assert.equal(a.key, b.key, 'name match should recover the same identity');
  assert.equal(store.listMembers(group.id).length, 1);
});

test('renaming a member keeps their votes', () => {
  const { store } = fresh();
  const { group, member } = groupWithMember(store);
  store.setVote(group.id, member.key, setId(0), 3);
  store.updateMemberDisplayName(group.id, member.key, 'Alexandra');
  assert.deepEqual(store.getMyVotes(group.id, member.key), { [setId(0)]: 3 });
});

test('getAllVotes groups voters by set', () => {
  const { store } = fresh();
  const group = store.createGroup({ groupName: 'Crew' });
  const a = store.joinGroup(group.id, 'Alex').member;
  const b = store.joinGroup(group.id, 'Bo').member;
  store.setVote(group.id, a.key, setId(0), 3);
  store.setVote(group.id, b.key, setId(0), 1);
  store.setVote(group.id, b.key, setId(1), 3);

  const { members, perArtist } = store.getAllVotes(group.id);
  assert.equal(members.length, 2);
  assert.equal(perArtist[setId(0)].length, 2);
  assert.equal(perArtist[setId(1)].length, 1);
  assert.deepEqual(
    perArtist[setId(0)].map((v) => v.score).sort(),
    [1, 3],
  );
});

test('leaving without keeping picks removes the member and their votes', () => {
  const { store } = fresh();
  const { group, member } = groupWithMember(store);
  store.setVote(group.id, member.key, setId(0), 3);
  store.removeMember(group.id, member.key);
  assert.deepEqual(store.getAllVotes(group.id).perArtist, {});
  assert.equal(store.listMembers(group.id).length, 0);
});

test('leaving but keeping picks hides the member yet keeps their votes visible', () => {
  // Regression: this path used to delete the member row, which the votes ->
  // members foreign key rejected, so the "Leave but keep my picks" button
  // threw and did nothing.
  const { store } = fresh();
  const group = store.createGroup({ groupName: 'Crew' });
  const leaver = store.joinGroup(group.id, 'Alex').member;
  const stayer = store.joinGroup(group.id, 'Bo').member;
  store.setVote(group.id, leaver.key, setId(0), 3);
  store.setVote(group.id, stayer.key, setId(0), 1);

  assert.deepEqual(store.removeMember(group.id, leaver.key, { keepVotes: true }), { ok: true });

  // Gone from the roster...
  assert.deepEqual(store.listMembers(group.id).map((m) => m.displayName), ['Bo']);
  // ...but their pick survives, still attributed by name.
  const voters = store.getAllVotes(group.id).perArtist[setId(0)];
  assert.equal(voters.length, 2);
  assert.ok(voters.some((v) => v.displayName === 'Alex' && v.score === 3));
});

test('a database predating the festival column is migrated and backfilled', () => {
  // Simulates the real production shape: create the old schema by hand, insert
  // a row, then let openDb's migration run over it.
  const db = new Database(':memory:');
  db.exec(`
    CREATE TABLE groups (
      id TEXT PRIMARY KEY, name TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL, last_active INTEGER NOT NULL
    );
  `);
  db.prepare('INSERT INTO groups (id, name, created_at, last_active) VALUES (?,?,?,?)')
    .run('legacy1234', 'Old Crew', 1, 1);

  const cols = () => db.prepare('PRAGMA table_info(groups)').all().map((c) => c.name);
  assert.ok(!cols().includes('festival_slug'), 'precondition: column absent');

  // Same statements openDb applies, run against this handle.
  for (const sql of [
    'ALTER TABLE groups ADD COLUMN creator_ip TEXT',
    `ALTER TABLE groups ADD COLUMN festival_slug TEXT NOT NULL DEFAULT '${DEFAULT_FESTIVAL_SLUG}'`,
  ]) {
    try { db.exec(sql); } catch (e) {
      if (!/duplicate column name/i.test(e.message)) throw e;
    }
  }

  assert.ok(cols().includes('festival_slug'));
  const row = db.prepare('SELECT festival_slug FROM groups WHERE id = ?').get('legacy1234');
  assert.equal(row.festival_slug, DEFAULT_FESTIVAL_SLUG, 'existing rows backfill');
});

test('migrations are idempotent', () => {
  const { db } = fresh();
  const before = db.prepare('PRAGMA table_info(groups)').all().length;
  const again = openDb(':memory:'); // fresh handle, same statements
  assert.equal(again.prepare('PRAGMA table_info(groups)').all().length, before);
});

test('pruning removes stale groups and their rows, and spares active ones', () => {
  const { db, store } = fresh();
  const stale = groupWithMember(store);
  store.setVote(stale.group.id, stale.member.key, setId(0), 3);
  const active = groupWithMember(store);

  const ancient = Date.now() - 200 * 24 * 60 * 60 * 1000;
  db.prepare('UPDATE groups SET last_active = ? WHERE id = ?').run(ancient, stale.group.id);

  assert.equal(pruneStaleGroups(db), 1);
  assert.equal(store.getGroupMeta(stale.group.id), null);
  assert.equal(db.prepare('SELECT COUNT(*) c FROM votes WHERE group_id = ?').get(stale.group.id).c, 0);
  assert.equal(db.prepare('SELECT COUNT(*) c FROM members WHERE group_id = ?').get(stale.group.id).c, 0);
  assert.ok(store.getGroupMeta(active.group.id), 'active group survives');
});

test('group ids look like group codes', () => {
  const { store } = fresh();
  for (let i = 0; i < 20; i++) {
    assert.match(store.createGroup({}).id, /^[23456789abcdefghjkmnpqrstuvwxyz]{10}$/);
  }
});

/* ─── Group-creation rate limit ──────────────────────────────────────────── */

test('an IP is capped at 25 new groups', () => {
  const { store } = fresh();
  for (let i = 0; i < 25; i++) {
    assert.ok(store.createGroup({ groupName: 'Crew', creatorIp: '1.2.3.4' }).id, `group ${i}`);
  }
  assert.deepEqual(
    store.createGroup({ groupName: 'Crew', creatorIp: '1.2.3.4' }),
    { error: 'rate_limited' },
  );
});

test('the cap is per IP, not global', () => {
  const { store } = fresh();
  for (let i = 0; i < 25; i++) store.createGroup({ groupName: 'Crew', creatorIp: '1.2.3.4' });
  assert.ok(store.createGroup({ groupName: 'Crew', creatorIp: '5.6.7.8' }).id);
});

test('the cap is a rolling 24h window, not a lifetime quota', () => {
  // The whole point of the window: an IP that filled its allowance yesterday
  // is not locked out today. Groups only prune after 90 days of inactivity,
  // so without this an active user's count would climb and never come down.
  const { db, store } = fresh();
  for (let i = 0; i < 25; i++) store.createGroup({ groupName: 'Crew', creatorIp: '1.2.3.4' });
  assert.deepEqual(
    store.createGroup({ groupName: 'Crew', creatorIp: '1.2.3.4' }),
    { error: 'rate_limited' },
    'capped while the window is full',
  );

  // Age every existing group past the window. last_active is left alone —
  // these are still live groups, they just weren't created today.
  const dayAgo = Date.now() - 25 * 60 * 60 * 1000;
  db.prepare('UPDATE groups SET created_at = ?').run(dayAgo);

  assert.ok(
    store.createGroup({ groupName: 'Crew', creatorIp: '1.2.3.4' }).id,
    'yesterday\'s groups no longer count against today',
  );
});

test('groups created just inside the window still count', () => {
  // Guards the boundary from being written as `>=` on the wrong side, which
  // would quietly let an IP create 25 groups every instant.
  const { db, store } = fresh();
  for (let i = 0; i < 25; i++) store.createGroup({ groupName: 'Crew', creatorIp: '1.2.3.4' });
  db.prepare('UPDATE groups SET created_at = ?').run(Date.now() - 23 * 60 * 60 * 1000);
  assert.deepEqual(
    store.createGroup({ groupName: 'Crew', creatorIp: '1.2.3.4' }),
    { error: 'rate_limited' },
  );
});

test('a request with no IP is not rate limited', () => {
  // Local dev and tests hit createGroup without a client IP; the limit is
  // skipped rather than treating "unknown" as one shared bucket.
  const { store } = fresh();
  for (let i = 0; i < 30; i++) assert.ok(store.createGroup({ groupName: 'Crew' }).id);
});
