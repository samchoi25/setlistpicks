import fs from 'node:fs';
import path from 'node:path';
import { customAlphabet } from 'nanoid';
import { db as defaultDb, PHOTO_DIR } from './db.js';
import { getFestival, getSetById } from '../shared/festivals/index.js';
import { userSetRowId, photosOpenFor, photosExpireAt } from '../shared/festival.js';

/*
 * Photos guests take of a set and attach to it — any festival's act, on that
 * act's day, or a Lucky 13 cocktail any time (see photosOpenFor in
 * shared/festival.js). The client
 * shrinks each picture before sending it, so these are a few hundred KB.
 *
 * Bytes go to disk under PHOTO_DIR, named by an unguessable id; the database
 * row ties that id to a set and an uploader. Only real images are accepted —
 * the type is read from the file's own leading bytes, not from what the
 * request claims.
 */

const newPhotoId = customAlphabet('23456789abcdefghjkmnpqrstuvwxyz', 16);

export const MAX_PHOTO_BYTES = 6 * 1024 * 1024;
export const MAX_PHOTOS_PER_MEMBER = 20;

// Magic numbers: what the file actually is, whatever it was labelled.
export function sniffImageType(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

export function createPhotoStore(db, dir = PHOTO_DIR) {
  const stmts = {
    getGroup:    db.prepare('SELECT * FROM groups WHERE id = ?'),
    getMember:   db.prepare('SELECT * FROM members WHERE group_id = ? AND member_key = ?'),
    getUserSet:  db.prepare('SELECT id FROM user_sets WHERE id = ? AND festival_slug = ?'),
    countByMember: db.prepare('SELECT COUNT(*) AS cnt FROM set_photos WHERE festival_slug = ? AND group_id = ? AND member_key = ?'),
    insert:      db.prepare(`INSERT INTO set_photos (id, festival_slug, set_id, group_id, member_key, uploaded_by, mime, bytes, created_at)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`),
    listForSet:  db.prepare('SELECT id, uploaded_by, group_id, member_key, created_at FROM set_photos WHERE festival_slug = ? AND set_id = ? ORDER BY created_at'),
    mineForSet:  db.prepare('SELECT id FROM set_photos WHERE festival_slug = ? AND set_id = ? AND group_id = ? AND member_key = ?'),
    deleteOne:   db.prepare('DELETE FROM set_photos WHERE id = ?'),
    get:         db.prepare('SELECT * FROM set_photos WHERE id = ?'),
    forSet:      db.prepare('SELECT id FROM set_photos WHERE festival_slug = ? AND set_id = ?'),
    deleteForSet: db.prepare('DELETE FROM set_photos WHERE festival_slug = ? AND set_id = ?'),
    festivalsWithPhotos: db.prepare('SELECT DISTINCT festival_slug FROM set_photos'),
    idsForFestival: db.prepare('SELECT id FROM set_photos WHERE festival_slug = ?'),
    deleteForFestival: db.prepare('DELETE FROM set_photos WHERE festival_slug = ?'),
  };

  const fileFor = (id) => path.join(dir, id);

  // Is this a set on this festival — a hardcoded one, or a guest-entered one
  // that still exists?
  function setExists(festival, setId) {
    const set = getSetById(setId);
    if (set) return set.festivalSlug === festival.slug;
    const rowId = festival.userSets ? userSetRowId(festival, setId) : null;
    return Boolean(rowId && stmts.getUserSet.get(rowId, festival.slug));
  }

  // Which of the festival's days a set is on — a guest-entered set is always
  // on the first (only) day.
  const dayOf = (festival, setId) => getSetById(setId)?.dayId ?? festival.days[0].id;

  function addPhoto(groupId, memberKey, setId, buf, now = new Date()) {
    const group = stmts.getGroup.get(groupId);
    if (!group) return { error: 'group_not_found' };
    const festival = getFestival(group.festival_slug);
    if (!festival?.photos) return { error: 'not_allowed' };
    const mem = stmts.getMember.get(groupId, memberKey);
    if (!mem) return { error: 'not_a_member' };
    if (!setExists(festival, setId)) return { error: 'invalid_artist' };
    if (!photosOpenFor(festival, dayOf(festival, setId), now)) return { error: 'photos_not_open' };
    if (!Buffer.isBuffer(buf) || !buf.length) return { error: 'no_image' };
    if (buf.length > MAX_PHOTO_BYTES) return { error: 'too_large' };
    const mime = sniffImageType(buf);
    if (!mime) return { error: 'not_an_image' };
    // One photo per guest per set: a new one replaces theirs rather than
    // adding a second, so it never counts against the overall cap.
    const previous = stmts.mineForSet.all(festival.slug, setId, groupId, memberKey).map((r) => r.id);
    if (!previous.length
        && stmts.countByMember.get(festival.slug, groupId, memberKey).cnt >= MAX_PHOTOS_PER_MEMBER) {
      return { error: 'too_many_photos' };
    }

    const id = newPhotoId();
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fileFor(id), buf);
    try {
      db.transaction(() => {
        for (const old of previous) stmts.deleteOne.run(old);
        stmts.insert.run(id, festival.slug, setId, groupId, memberKey, mem.display_name, mime, buf.length, Date.now());
      })();
    } catch (e) {
      fs.rmSync(fileFor(id), { force: true });
      throw e;
    }
    for (const old of previous) fs.rmSync(fileFor(old), { force: true });
    return { photo: { id, uploadedBy: mem.display_name }, replaced: previous.length > 0 };
  }

  // `viewer` ({ groupId, memberKey }) marks that guest's own photo as mine —
  // a flag, so the list never hands out anyone's member key.
  function listPhotos(festivalSlug, setId, viewer = {}) {
    return stmts.listForSet.all(festivalSlug, setId).map((r) => ({
      id: r.id,
      uploadedBy: r.uploaded_by,
      createdAt: r.created_at,
      mine: Boolean(viewer.memberKey) && r.group_id === viewer.groupId && r.member_key === viewer.memberKey,
    }));
  }

  // A guest takes back their own photo of a set. Only ever theirs: the
  // match is on group + member key, which only they hold.
  function removeMyPhoto(groupId, memberKey, setId) {
    const group = stmts.getGroup.get(groupId);
    if (!group) return { error: 'group_not_found' };
    const ids = stmts.mineForSet.all(group.festival_slug, setId, groupId, memberKey).map((r) => r.id);
    if (!ids.length) return { error: 'photo_not_found' };
    db.transaction(() => { for (const id of ids) stmts.deleteOne.run(id); })();
    for (const id of ids) fs.rmSync(fileFor(id), { force: true });
    return { ok: true };
  }

  // { mime, path } for serving, or null.
  function getPhotoFile(id) {
    if (typeof id !== 'string' || !/^[a-z0-9]{16}$/.test(id)) return null;
    const row = stmts.get.get(id);
    if (!row || !fs.existsSync(fileFor(id))) return null;
    return { mime: row.mime, path: fileFor(id) };
  }

  // When a set goes (a guest withdraws their cocktail, an admin removes it),
  // its photos go too — rows and files.
  function removePhotosForSet(festivalSlug, setId) {
    const ids = stmts.forSet.all(festivalSlug, setId).map((r) => r.id);
    stmts.deleteForSet.run(festivalSlug, setId);
    for (const id of ids) fs.rmSync(fileFor(id), { force: true });
    return ids.length;
  }

  /*
   * Once an event is over its photos are deleted — rows and files — rather
   * than kept on the server indefinitely. "Over" is the end of its last day
   * in its own timezone, plus the few hours a last-night set's photos stay
   * open (photosExpireAt). A festival that's no longer in the registry at all
   * counts as over too.
   */
  function pruneEndedEventPhotos(now = new Date()) {
    let removed = 0;
    for (const { festival_slug: slug } of stmts.festivalsWithPhotos.all()) {
      const festival = getFestival(slug);
      if (festival && now < photosExpireAt(festival)) continue;
      const ids = stmts.idsForFestival.all(slug).map((r) => r.id);
      stmts.deleteForFestival.run(slug);
      for (const id of ids) fs.rmSync(fileFor(id), { force: true });
      removed += ids.length;
    }
    return removed;
  }

  return { addPhoto, listPhotos, getPhotoFile, removePhotosForSet, removeMyPhoto, pruneEndedEventPhotos };
}

export const photoStore = createPhotoStore(defaultDb);

// Sweep at boot and then on the same 6-hour beat as the group prune in db.js,
// so an event's photos are gone within a few hours of it ending.
function pruneEnded() {
  const n = photoStore.pruneEndedEventPhotos();
  if (n) console.log(`[photos] deleted ${n} photo(s) from ended event(s)`);
}
pruneEnded();
setInterval(pruneEnded, 6 * 60 * 60 * 1000).unref();
