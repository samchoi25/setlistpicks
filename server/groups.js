import { customAlphabet } from 'nanoid';
import { db as defaultDb, deleteGroupCascade } from './db.js';
import { getSetById, getFestival, DEFAULT_FESTIVAL_SLUG } from '../shared/festivals/index.js';
import { hasFestivalEnded } from '../shared/festival.js';

const newGroupId   = customAlphabet('23456789abcdefghjkmnpqrstuvwxyz', 10);
const newMemberId  = customAlphabet('23456789abcdefghjkmnpqrstuvwxyz', 10);

const MAX_DISPLAY_NAME_LEN = 50;   // per-member name
const MAX_GROUP_NAME_LEN   = 100;  // long enough for a funny name, not a novel

/*
 * Group creation is capped per IP over a rolling window, not for all time.
 *
 * It used to be a flat lifetime count, which turned out to be a permanent
 * quota rather than a rate limit: groups are only pruned after 90 days of
 * *inactivity* (see db.js), so anyone who keeps opening their groups keeps
 * them alive and their count only ever climbs. That locks out the most
 * engaged users first, and it got tighter with every festival added — one
 * group per festival already spends a chunk of the allowance before anyone
 * has made a second crew for the same lineup.
 *
 * A window matches what the limit is actually defending against: someone
 * spraying groups in a burst. Twenty-five a day is far past normal use
 * (a person planning every festival on the site with a couple of crews each
 * stays well under it) while still capping abuse at a survivable rate.
 */
const MAX_GROUPS_PER_IP  = 25;
const GROUP_WINDOW_MS    = 24 * 60 * 60 * 1000;

// Members have no such window: this one counts rows a single IP has created
// across every group, and 25 is generous for one person joining crews.
const MAX_MEMBERS_PER_IP = 25;

const VALID_SCORES = new Set([0, 1, 3]);

function cleanDisplayName(name, maxLen = MAX_DISPLAY_NAME_LEN) {
  return String(name || '').trim().slice(0, maxLen);
}

/*
 * All group/member/vote access, bound to one database.
 *
 * A factory rather than module-level statements so tests can run against
 * openDb(':memory:'); the process-wide instance is created at the bottom and
 * re-exported by name, so callers are unchanged.
 */
export function createStore(db) {
  const stmts = {
    insertGroup:      db.prepare('INSERT INTO groups (id, name, created_at, last_active, creator_ip, festival_slug) VALUES (?, ?, ?, ?, ?, ?)'),
    countGroupsByIp:  db.prepare('SELECT COUNT(*) AS cnt FROM groups WHERE creator_ip = ? AND created_at > ?'),
    getGroup:         db.prepare('SELECT * FROM groups WHERE id = ?'),
    touchGroup:       db.prepare('UPDATE groups SET last_active = ? WHERE id = ?'),
    updateGroupName:  db.prepare('UPDATE groups SET name = ?, last_active = ? WHERE id = ?'),

    getMember:        db.prepare('SELECT * FROM members WHERE group_id = ? AND member_key = ?'),
    getMemberByName:  db.prepare('SELECT * FROM members WHERE group_id = ? AND LOWER(TRIM(display_name)) = LOWER(TRIM(?))'),
    countMembersByIp: db.prepare('SELECT COUNT(*) AS cnt FROM members WHERE creator_ip = ?'),
    insertMember:     db.prepare('INSERT INTO members (group_id, member_key, display_name, joined_at, last_seen, creator_ip) VALUES (?, ?, ?, ?, ?, ?)'),
    touchMember:      db.prepare('UPDATE members SET last_seen = ? WHERE group_id = ? AND member_key = ?'),
    updateMemberName: db.prepare('UPDATE members SET display_name = ?, last_seen = ? WHERE group_id = ? AND member_key = ?'),
    listMembers:      db.prepare('SELECT member_key, display_name FROM members WHERE group_id = ?'),
    countMembers:     db.prepare('SELECT COUNT(*) AS cnt FROM members WHERE group_id = ?'),

    clearVotes:   db.prepare('DELETE FROM votes WHERE group_id = ? AND member_key = ?'),
    deleteMember: db.prepare('DELETE FROM members WHERE group_id = ? AND member_key = ?'),

    upsertVote:   db.prepare(`
      INSERT INTO votes (group_id, member_key, artist_id, score) VALUES (?, ?, ?, ?)
      ON CONFLICT(group_id, member_key, artist_id) DO UPDATE SET score = excluded.score
    `),
    deleteVote:   db.prepare('DELETE FROM votes WHERE group_id = ? AND member_key = ? AND artist_id = ?'),
    getMyVotes:   db.prepare('SELECT artist_id, score FROM votes WHERE group_id = ? AND member_key = ?'),
    getAllVotes:  db.prepare('SELECT member_key, artist_id, score FROM votes WHERE group_id = ?'),
  };

  const touch = (groupId) => stmts.touchGroup.run(Date.now(), groupId);

  function createGroup({ groupName, festivalSlug, creatorIp } = {}) {
    // Resolve through the registry so an alias is stored as its canonical
    // slug — the festival a group belongs to must never be ambiguous.
    const festival = getFestival(festivalSlug ?? DEFAULT_FESTIVAL_SLUG);
    if (!festival) return { error: 'unknown_festival' };
    if (hasFestivalEnded(festival)) return { error: 'festival_ended' };

    const now = Date.now();
    if (creatorIp) {
      const { cnt } = stmts.countGroupsByIp.get(creatorIp, now - GROUP_WINDOW_MS);
      if (cnt >= MAX_GROUPS_PER_IP) return { error: 'rate_limited' };
    }
    const id = newGroupId();
    const name = cleanDisplayName(groupName, MAX_GROUP_NAME_LEN) || '';
    stmts.insertGroup.run(id, name, now, now, creatorIp ?? null, festival.slug);
    return { id, name, createdAt: now, festivalSlug: festival.slug };
  }

  // Which festival a group belongs to, without touching last_active — this
  // answers redirects for legacy links, and a bot following an old URL should
  // not keep a dead group alive past the prune window.
  function getGroupFestivalSlug(groupId) {
    return stmts.getGroup.get(groupId)?.festival_slug ?? null;
  }

  function getGroupMeta(groupId) {
    const row = stmts.getGroup.get(groupId);
    if (!row) return null;
    stmts.touchGroup.run(Date.now(), groupId);
    return {
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
      festivalSlug: row.festival_slug,
    };
  }

  function joinGroup(groupId, displayName, creatorIp) {
    const group = stmts.getGroup.get(groupId);
    if (!group) return { error: 'group_not_found' };
    // A group's festival_slug can only fail to resolve if its festival was
    // since dropped from the registry entirely — not this check's concern.
    const festival = getFestival(group.festival_slug);
    if (festival && hasFestivalEnded(festival)) return { error: 'festival_ended' };

    const display = cleanDisplayName(displayName);
    if (!display) return { error: 'invalid_name' };

    const now = Date.now();

    // Dedup by normalized display name — this is how session recovery works.
    // The member_key is an opaque nanoid; updating display_name later never
    // breaks the mapping between identity and votes.
    const existing = stmts.getMemberByName.get(groupId, display);
    if (existing) {
      stmts.touchMember.run(now, groupId, existing.member_key);
      return { member: { key: existing.member_key, displayName: existing.display_name } };
    }

    if (creatorIp) {
      const { cnt } = stmts.countMembersByIp.get(creatorIp);
      if (cnt >= MAX_MEMBERS_PER_IP) return { error: 'rate_limited' };
    }

    const key = newMemberId();
    stmts.insertMember.run(groupId, key, display, now, now, creatorIp ?? null);
    return { member: { key, displayName: display } };
  }

  function listMembers(groupId) {
    return stmts.listMembers.all(groupId).map((r) => ({
      key: r.member_key,
      displayName: r.display_name,
    }));
  }

  function setVote(groupId, memberKey, artistId, score) {
    const group = stmts.getGroup.get(groupId);
    if (!group) return { error: 'group_not_found' };
    // See the same guard in joinGroup — an unresolvable festival_slug falls
    // through to the wrong_festival check below instead.
    const groupFestival = getFestival(group.festival_slug);
    if (groupFestival && hasFestivalEnded(groupFestival)) return { error: 'festival_ended' };

    const set = getSetById(artistId);
    if (!set) return { error: 'invalid_artist' };
    // Set ids carry their festival, so a vote for another lineup's set is
    // detectable rather than silently stored against the wrong schedule.
    if (set.festivalSlug !== group.festival_slug) return { error: 'wrong_festival' };

    // Guard the coercion: Number(null) and Number('') are both 0, which is a
    // meaningful score here (clear the vote), so a missing field would have
    // silently wiped a pick instead of being rejected.
    if (score === null || score === undefined || score === '') {
      return { error: 'invalid_score' };
    }
    const numeric = Number(score);
    if (!VALID_SCORES.has(numeric)) return { error: 'invalid_score' };

    const mem = stmts.getMember.get(groupId, memberKey);
    if (!mem) return { error: 'not_a_member' };

    if (numeric === 0) {
      stmts.deleteVote.run(groupId, memberKey, artistId);
    } else {
      stmts.upsertVote.run(groupId, memberKey, artistId, numeric);
    }
    touch(groupId);
    return { ok: true };
  }

  function getMyVotes(groupId, memberKey) {
    const rows = stmts.getMyVotes.all(groupId, memberKey);
    return Object.fromEntries(rows.map((r) => [r.artist_id, r.score]));
  }

  function getAllVotes(groupId) {
    const members = listMembers(groupId);
    const memberMap = Object.fromEntries(members.map((m) => [m.key, m]));
    const rows = stmts.getAllVotes.all(groupId);
    const perArtist = {};
    for (const row of rows) {
      const m = memberMap[row.member_key];
      if (!m) continue;
      if (!perArtist[row.artist_id]) perArtist[row.artist_id] = [];
      perArtist[row.artist_id].push({ key: m.key, displayName: m.displayName, score: row.score });
    }
    return { members, perArtist };
  }

  function updateGroupName(groupId, newName) {
    const name = cleanDisplayName(newName, MAX_GROUP_NAME_LEN);
    if (!name) return { error: 'invalid_name' };
    const info = stmts.updateGroupName.run(name, Date.now(), groupId);
    if (!info.changes) return { error: 'group_not_found' };
    return { name };
  }

  // Leaving always takes the member's votes with them. If that empties the
  // group, the group itself goes too — there's no one left to see it.
  function removeMember(groupId, memberKey) {
    const mem = stmts.getMember.get(groupId, memberKey);
    if (!mem) return { error: 'not_a_member' };
    stmts.clearVotes.run(groupId, memberKey);
    stmts.deleteMember.run(groupId, memberKey);
    if (stmts.countMembers.get(groupId).cnt === 0) {
      deleteGroupCascade(db, groupId);
      return { ok: true, groupDeleted: true };
    }
    touch(groupId);
    return { ok: true };
  }

  function updateMemberDisplayName(groupId, memberKey, newDisplayName) {
    const display = cleanDisplayName(newDisplayName);
    if (!display) return { error: 'invalid_name' };
    const info = stmts.updateMemberName.run(display, Date.now(), groupId, memberKey);
    if (!info.changes) return { error: 'not_a_member' };
    return { member: { key: memberKey, displayName: display } };
  }

  return {
    createGroup, getGroupMeta, getGroupFestivalSlug, joinGroup, listMembers, setVote,
    getMyVotes, getAllVotes, updateGroupName, removeMember,
    updateMemberDisplayName,
  };
}

export const store = createStore(defaultDb);

export const {
  createGroup, getGroupMeta, getGroupFestivalSlug, joinGroup, listMembers, setVote,
  getMyVotes, getAllVotes, updateGroupName, removeMember,
  updateMemberDisplayName,
} = store;
