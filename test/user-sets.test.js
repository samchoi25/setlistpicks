import test from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from '../server/db.js';
import { createStore } from '../server/groups.js';
import { getFestival, listFestivals } from '../shared/festivals/index.js';
import { withUserSets, userSetId, userSetRowId, hasFestivalEnded } from '../shared/festival.js';
import { parsePath } from '../shared/routes.js';
import { pageTitle, renderJsonLd } from '../scripts/seo-prerender.js';

/*
 * Lucky 13 — a party voting on guest-entered cocktails (see
 * shared/festivals/lucky-13.js). Cocktails are sets: stored in user_sets,
 * merged in as untimed sets, voted on with the ordinary 👍/🔥 votes, and the
 * counts are visible to nobody but the admin tally.
 */
const SLUG = 'lucky-13';
const lucky = getFestival(SLUG);

function fresh() {
  const db = openDb(':memory:');
  return { db, store: createStore(db) };
}

function party(store, ...names) {
  const group = store.createGroup({ festivalSlug: SLUG, creatorIp: '10.0.0.1' });
  const members = names.map((n) => store.joinGroup(group.id, n, '10.0.0.1').member);
  return { group, members };
}

const setIdFor = (row) => userSetId(SLUG, lucky.days[0].id, row.id);

test('lucky-13 is registered as an unlisted, secret-vote, user-entered event', () => {
  assert.ok(lucky);
  assert.equal(lucky.name, "Sam and Sara's Lucky 13");
  assert.equal(lucky.userSets, true);
  assert.equal(lucky.secretVotes, true);
  assert.equal(lucky.unlisted, true);
  assert.equal(lucky.SCHEDULE.length, 0, 'no hardcoded sets');
  assert.equal(lucky.dayMode(lucky.days[0].id), 'untimed');
  assert.equal(hasFestivalEnded(lucky, new Date('2026-11-15T12:00:00Z')), false);
});

test('/lucky-13 routes like any festival page', () => {
  assert.deepEqual(parsePath('/lucky-13'), {
    kind: 'festival', slug: SLUG, canonicalSlug: SLUG, isAlias: false,
  });
});

test('its page has a plain title and no public schema', () => {
  assert.equal(pageTitle(lucky), "Sam and Sara's Lucky 13");
  assert.equal(renderJsonLd(lucky), '');
});

test('withUserSets merges rows as untimed sets with ids that never shift', () => {
  const a = withUserSets(lucky, [{ id: 7, artist: 'Negroni', submittedBy: 'Sam' }]);
  const b = withUserSets(lucky, [
    { id: 7, artist: 'Negroni', submittedBy: 'Sam' },
    { id: 9, artist: 'Aperol Spritz', submittedBy: 'Sara' },
  ]);
  const negroniA = a.SCHEDULE.find((s) => s.artist === 'Negroni');
  const negroniB = b.SCHEDULE.find((s) => s.artist === 'Negroni');
  // A new entry sorting ahead of it must not renumber it — votes key on this.
  assert.equal(negroniA.id, negroniB.id);
  assert.equal(negroniA.id, `${SLUG}:party-user-7`);
  assert.deepEqual(b.SCHEDULE.map((s) => s.artist), ['Aperol Spritz', 'Negroni']);
  assert.equal(b.SCHEDULE_BY_ID[negroniB.id].submittedBy, 'Sam');
  for (const s of b.SCHEDULE) {
    assert.equal(s.timed, false);
    assert.equal(s.stageId, null);
  }
  assert.equal(userSetRowId(lucky, negroniB.id), 7);
  assert.equal(userSetRowId(lucky, 'outside-lands-2026:fri-landsend-0'), null);
});

test('withUserSets leaves an ordinary festival untouched', () => {
  const other = listFestivals().find((f) => !f.userSets);
  assert.equal(withUserSets(other, [{ id: 1, artist: 'X' }]), other);
});

test('everyone opening the party page lands in the same group', () => {
  const { store } = fresh();
  const first = store.createGroup({ festivalSlug: SLUG, creatorIp: '10.0.0.1' });
  const second = store.createGroup({ festivalSlug: SLUG, creatorIp: '10.0.0.2' });
  assert.equal(second.id, first.id);
});

test('a whole party on one network is not capped per IP', () => {
  const { store } = fresh();
  const group = store.createGroup({ festivalSlug: SLUG, creatorIp: '10.0.0.1' });
  for (let i = 0; i < 40; i++) {
    const res = store.joinGroup(group.id, `Guest ${i}`, '10.0.0.1');
    assert.ok(res.member, `guest ${i}: ${res.error}`);
  }
});

test('a guest can enter a cocktail, and it is listed for everyone', () => {
  const { store } = fresh();
  const { group, members: [sam] } = party(store, 'Sam');
  const { set } = store.addUserSet(group.id, sam.key, '  Lucky   Negroni ');
  assert.equal(set.artist, 'Lucky Negroni');
  assert.deepEqual(store.listUserSets(SLUG), [{ id: set.id, artist: 'Lucky Negroni', submittedBy: 'Sam' }]);
});

test('entering is refused for duplicates, blanks, non-members and past the cap', () => {
  const { store } = fresh();
  const { group, members: [sam, sara] } = party(store, 'Sam', 'Sara');
  store.addUserSet(group.id, sam.key, 'Negroni');
  assert.deepEqual(store.addUserSet(group.id, sara.key, 'negroni'), { error: 'duplicate' });
  assert.deepEqual(store.addUserSet(group.id, sara.key, '   '), { error: 'invalid_name' });
  assert.deepEqual(store.addUserSet(group.id, 'nobody', 'Mojito'), { error: 'not_a_member' });
  // One cocktail each.
  assert.deepEqual(store.addUserSet(group.id, sam.key, 'Mojito'), { error: 'too_many' });
});

test('removing your cocktail frees your one slot', () => {
  const { store } = fresh();
  const { group, members: [sam] } = party(store, 'Sam');
  const { set } = store.addUserSet(group.id, sam.key, 'Negroni');
  store.removeUserSet(SLUG, set.id, { groupId: group.id, memberKey: sam.key });
  assert.ok(store.addUserSet(group.id, sam.key, 'Mojito').set);
});

test('guests vote on cocktails with the ordinary scores', () => {
  const { store } = fresh();
  const { group, members: [sam, sara] } = party(store, 'Sam', 'Sara');
  const { set } = store.addUserSet(group.id, sam.key, 'Negroni');
  const id = setIdFor(set);
  assert.deepEqual(store.setVote(group.id, sara.key, id, 3), { ok: true });
  assert.deepEqual(store.getMyVotes(group.id, sara.key), { [id]: 3 });
  // A user-set id for a row that doesn't exist is still refused.
  assert.deepEqual(store.setVote(group.id, sara.key, `${SLUG}:party-user-999`, 3), { error: 'invalid_artist' });
});

test('guests never see anyone else’s picks', () => {
  const { store } = fresh();
  const { group, members: [sam, sara] } = party(store, 'Sam', 'Sara');
  const { set } = store.addUserSet(group.id, sam.key, 'Negroni');
  store.setVote(group.id, sara.key, setIdFor(set), 3);
  const visible = store.getVisibleVotes(group.id);
  assert.deepEqual(visible.perArtist, {});
  assert.equal(visible.members.length, 2);
  // The raw data is still there for the admin tally.
  assert.equal(Object.keys(store.getAllVotes(group.id).perArtist).length, 1);
});

test('the admin tally counts 🔥 and 👍 per cocktail and distinct voters', () => {
  const { store } = fresh();
  const { group, members: [sam, sara, alex] } = party(store, 'Sam', 'Sara', 'Alex');
  const negroni = setIdFor(store.addUserSet(group.id, sam.key, 'Negroni').set);
  const mojito = setIdFor(store.addUserSet(group.id, sara.key, 'Mojito').set);
  store.setVote(group.id, sara.key, negroni, 3);
  store.setVote(group.id, alex.key, negroni, 1);
  store.setVote(group.id, alex.key, mojito, 3);
  const { counts, voters } = store.festivalTally(SLUG);
  assert.deepEqual(counts[negroni], { must: 1, want: 1 });
  assert.deepEqual(counts[mojito], { must: 1, want: 0 });
  assert.equal(voters, 2);
});

test('only the guest who entered a cocktail (or an admin) can remove it, and its votes go too', () => {
  const { store } = fresh();
  const { group, members: [sam, sara] } = party(store, 'Sam', 'Sara');
  const { set } = store.addUserSet(group.id, sam.key, 'Negroni');
  store.setVote(group.id, sara.key, setIdFor(set), 3);

  assert.deepEqual(
    store.removeUserSet(SLUG, set.id, { groupId: group.id, memberKey: sara.key }),
    { error: 'not_yours' },
  );
  assert.deepEqual(store.removeUserSet(SLUG, set.id, { groupId: group.id, memberKey: sam.key }), { ok: true });
  assert.deepEqual(store.listUserSets(SLUG), []);
  assert.deepEqual(store.getMyVotes(group.id, sara.key), {});

  const { set: again } = store.addUserSet(group.id, sam.key, 'Mojito');
  assert.deepEqual(store.removeUserSet(SLUG, again.id, { asAdmin: true }), { ok: true });
});
