import { customAlphabet } from 'nanoid';
import { db as defaultDb, deleteGroupCascade } from './db.js';
import { getSetById, getFestival, DEFAULT_FESTIVAL_SLUG } from '../shared/festivals/index.js';
import { hasFestivalEnded, userSetId, userSetRowId } from '../shared/festival.js';

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

// Guest-entered sets (a userSets festival — see shared/festivals/lucky-13.js).
const MAX_USER_SET_LEN = 60;
const MAX_USER_SETS_PER_MEMBER = 3;

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
    firstGroupFor:    db.prepare('SELECT * FROM groups WHERE festival_slug = ? ORDER BY created_at, id LIMIT 1'),
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

    listUserSets:      db.prepare('SELECT id, artist, submitted_by, group_id, member_key, created_at FROM user_sets WHERE festival_slug = ? ORDER BY id'),
    getUserSet:        db.prepare('SELECT * FROM user_sets WHERE id = ? AND festival_slug = ?'),
    userSetByName:     db.prepare('SELECT id FROM user_sets WHERE festival_slug = ? AND LOWER(artist) = LOWER(?)'),
    countUserSetsBy:   db.prepare('SELECT COUNT(*) AS cnt FROM user_sets WHERE festival_slug = ? AND group_id = ? AND member_key = ?'),
    insertUserSet:     db.prepare('INSERT INTO user_sets (festival_slug, artist, submitted_by, group_id, member_key, created_at) VALUES (?, ?, ?, ?, ?, ?)'),
    deleteUserSet:     db.prepare('DELETE FROM user_sets WHERE id = ?'),
    deleteVotesForSet: db.prepare('DELETE FROM votes WHERE artist_id = ?'),
    festivalTally:     db.prepare(`
      SELECT v.artist_id, v.score, COUNT(*) AS cnt
      FROM votes v JOIN groups g ON g.id = v.group_id
      WHERE g.festival_slug = ?
      GROUP BY v.artist_id, v.score
    `),
    festivalVoterCount: db.prepare(`
      SELECT COUNT(DISTINCT v.group_id || ':' || v.member_key) AS cnt
      FROM votes v JOIN groups g ON g.id = v.group_id
      WHERE g.festival_slug = ?
    `),
  };

  const touch = (groupId) => stmts.touchGroup.run(Date.now(), groupId);

  function createGroup({ groupName, festivalSlug, creatorIp } = {}) {
    // Resolve through the registry so an alias is stored as its canonical
    // slug — the festival a group belongs to must never be ambiguous.
    const festival = getFestival(festivalSlug ?? DEFAULT_FESTIVAL_SLUG);
    if (!festival) return { error: 'unknown_festival' };
    if (hasFestivalEnded(festival)) return { error: 'festival_ended' };

    // A party (userSets event) is one room: everyone who opens its page lands
    // in the same group rather than each starting their own. That also keeps
    // a whole party on one Wi-Fi network clear of the per-IP limit below.
    if (festival.userSets) {
      const party = stmts.firstGroupFor.get(festival.slug);
      if (party) return { id: party.id, name: party.name, createdAt: party.created_at, festivalSlug: party.festival_slug };
    }

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

    // Not for a party: its guests share one network, so one IP is everyone.
    if (creatorIp && !festival?.userSets) {
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
    if (set) {
      // Set ids carry their festival, so a vote for another lineup's set is
      // detectable rather than silently stored against the wrong schedule.
      if (set.festivalSlug !== group.festival_slug) return { error: 'wrong_festival' };
    } else {
      // Not a hardcoded set — it may be one a guest entered, which only the
      // database knows about.
      const rowId = groupFestival?.userSets ? userSetRowId(groupFestival, artistId) : null;
      if (!rowId || !stmts.getUserSet.get(rowId, group.festival_slug)) return { error: 'invalid_artist' };
    }

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

  /*
   * Everyone's votes, as a guest may see them. A secretVotes event (a party
   * vote — see shared/festivals/lucky-13.js) shows nobody anyone else's picks:
   * the member list stays, the picks go. Each guest still gets their own from
   * getMyVotes, and the tally is only on the admin page. Every route that
   * hands out group-wide votes goes through this, so none can leak them.
   */
  function getVisibleVotes(groupId) {
    const all = getAllVotes(groupId);
    const festival = getFestival(stmts.getGroup.get(groupId)?.festival_slug);
    return festival?.secretVotes ? { members: all.members, perArtist: {} } : all;
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

  // ── Guest-entered sets ──────────────────────────────────────────────────────

  // Public: what every guest sees. No vote data.
  function listUserSets(festivalSlug) {
    return stmts.listUserSets.all(festivalSlug).map((r) => ({
      id: r.id, artist: r.artist, submittedBy: r.submitted_by,
    }));
  }

  function addUserSet(groupId, memberKey, artist) {
    const group = stmts.getGroup.get(groupId);
    if (!group) return { error: 'group_not_found' };
    const festival = getFestival(group.festival_slug);
    if (!festival?.userSets) return { error: 'not_allowed' };
    if (hasFestivalEnded(festival)) return { error: 'festival_ended' };
    const mem = stmts.getMember.get(groupId, memberKey);
    if (!mem) return { error: 'not_a_member' };

    const name = String(artist ?? '').trim().replace(/\s+/g, ' ').slice(0, MAX_USER_SET_LEN);
    if (!name) return { error: 'invalid_name' };
    if (stmts.userSetByName.get(festival.slug, name)) return { error: 'duplicate' };
    if (stmts.countUserSetsBy.get(festival.slug, groupId, memberKey).cnt >= MAX_USER_SETS_PER_MEMBER) {
      return { error: 'too_many' };
    }
    const info = stmts.insertUserSet.run(festival.slug, name, mem.display_name, groupId, memberKey, Date.now());
    touch(groupId);
    return { set: { id: Number(info.lastInsertRowid), artist: name, submittedBy: mem.display_name } };
  }

  // The guest who entered a set can take it back; an admin can remove any
  // (pass asAdmin). Its votes go with it.
  function removeUserSet(festivalSlug, rowId, { groupId, memberKey, asAdmin = false } = {}) {
    const festival = getFestival(festivalSlug);
    if (!festival?.userSets) return { error: 'not_allowed' };
    const row = stmts.getUserSet.get(Number(rowId), festival.slug);
    if (!row) return { error: 'set_not_found' };
    if (!asAdmin && (row.group_id !== groupId || row.member_key !== memberKey)) {
      return { error: 'not_yours' };
    }
    db.transaction(() => {
      stmts.deleteVotesForSet.run(userSetId(festival.slug, festival.days[0].id, row.id));
      stmts.deleteUserSet.run(row.id);
    })();
    return { ok: true };
  }

  /*
   * The running count across every group on a festival — the admin view for a
   * secretVotes event. Each set gets its 🔥 and 👍 counts and a score that
   * weighs them the way the app already does (must-see 3, want 1).
   */
  function festivalTally(festivalSlug) {
    const counts = {};
    for (const r of stmts.festivalTally.all(festivalSlug)) {
      counts[r.artist_id] ??= { must: 0, want: 0 };
      if (r.score === 3) counts[r.artist_id].must = r.cnt;
      else if (r.score === 1) counts[r.artist_id].want = r.cnt;
    }
    return { counts, voters: stmts.festivalVoterCount.get(festivalSlug).cnt };
  }

  return {
    createGroup, getGroupMeta, getGroupFestivalSlug, joinGroup, listMembers, setVote,
    getMyVotes, getAllVotes, updateGroupName, removeMember,
    updateMemberDisplayName,
    listUserSets, addUserSet, removeUserSet, festivalTally, getVisibleVotes,
  };
}

export const store = createStore(defaultDb);

export const {
  createGroup, getGroupMeta, getGroupFestivalSlug, joinGroup, listMembers, setVote,
  getMyVotes, getAllVotes, updateGroupName, removeMember,
  updateMemberDisplayName,
  listUserSets, addUserSet, removeUserSet, festivalTally, getVisibleVotes,
} = store;
