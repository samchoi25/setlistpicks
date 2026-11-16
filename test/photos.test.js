import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openDb } from '../server/db.js';
import { createStore } from '../server/groups.js';
import { createPhotoStore, sniffImageType, MAX_PHOTO_BYTES } from '../server/photos.js';
import { getFestival, listFestivals } from '../shared/festivals/index.js';
import { userSetId } from '../shared/festival.js';

/*
 * Photos guests attach to a Lucky 13 cocktail (photos: true — see
 * shared/festivals/lucky-13.js and server/photos.js).
 */
const SLUG = 'lucky-13';
const lucky = getFestival(SLUG);

// Smallest buffers that pass the magic-number check.
const JPEG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(60, 1)]);
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(60, 1)]);

function fresh() {
  const db = openDb(':memory:');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'setlist-photos-'));
  const store = createStore(db);
  const photos = createPhotoStore(db, dir);
  const group = store.createGroup({ festivalSlug: SLUG });
  const sam = store.joinGroup(group.id, 'Sam').member;
  const { set } = store.addUserSet(group.id, sam.key, 'Negroni');
  const setId = userSetId(SLUG, lucky.days[0].id, set.id);
  return { db, dir, store, photos, group, sam, set, setId };
}

test('only Lucky 13 takes photos', () => {
  assert.equal(lucky.photos, true);
  assert.deepEqual(listFestivals().filter((f) => f.photos).map((f) => f.slug), [SLUG]);
});

test('image type comes from the bytes, not the label', () => {
  assert.equal(sniffImageType(JPEG), 'image/jpeg');
  assert.equal(sniffImageType(PNG), 'image/png');
  assert.equal(sniffImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')), null);
  assert.equal(sniffImageType(Buffer.alloc(4)), null);
});

test('a guest can attach a photo to a cocktail; it is listed and served', () => {
  const { photos, group, sam, setId } = fresh();
  const { photo } = photos.addPhoto(group.id, sam.key, setId, JPEG);
  assert.equal(photo.uploadedBy, 'Sam');
  const listed = photos.listPhotos(SLUG, setId);
  assert.deepEqual(listed.map((p) => [p.id, p.uploadedBy]), [[photo.id, 'Sam']]);
  const file = photos.getPhotoFile(photo.id);
  assert.equal(file.mime, 'image/jpeg');
  assert.deepEqual(fs.readFileSync(file.path), JPEG);
});

test('uploads are refused for non-members, unknown sets, non-images and oversize files', () => {
  const { photos, group, sam, setId } = fresh();
  assert.deepEqual(photos.addPhoto(group.id, 'nobody', setId, JPEG), { error: 'not_a_member' });
  assert.deepEqual(photos.addPhoto(group.id, sam.key, `${SLUG}:party-user-999`, JPEG), { error: 'invalid_artist' });
  assert.deepEqual(photos.addPhoto(group.id, sam.key, setId, Buffer.from('not an image at all')), { error: 'not_an_image' });
  assert.deepEqual(photos.addPhoto(group.id, sam.key, setId, Buffer.alloc(MAX_PHOTO_BYTES + 1)), { error: 'too_large' });
  assert.deepEqual(photos.addPhoto('nogroup123', sam.key, setId, JPEG), { error: 'group_not_found' });
});

test('photo ids that are not ours never reach the filesystem', () => {
  const { photos } = fresh();
  for (const bad of ['../../etc/passwd', '', 'ABCDEFGHJKLMNPQR', 'x'.repeat(16)]) {
    assert.equal(photos.getPhotoFile(bad), null, bad);
  }
});

test('removing a cocktail takes its photos with it, files included', () => {
  const { photos, group, sam, setId } = fresh();
  const { photo } = photos.addPhoto(group.id, sam.key, setId, PNG);
  const filePath = photos.getPhotoFile(photo.id).path;
  assert.equal(photos.removePhotosForSet(SLUG, setId), 1);
  assert.deepEqual(photos.listPhotos(SLUG, setId), []);
  assert.equal(fs.existsSync(filePath), false);
});

test('one photo per guest per cocktail: a new one replaces theirs', () => {
  const { store, photos, group, sam, setId } = fresh();
  const first = photos.addPhoto(group.id, sam.key, setId, JPEG).photo;
  const firstPath = photos.getPhotoFile(first.id).path;
  const second = photos.addPhoto(group.id, sam.key, setId, PNG);
  assert.equal(second.replaced, true);
  assert.deepEqual(photos.listPhotos(SLUG, setId).map((p) => p.id), [second.photo.id]);
  assert.equal(fs.existsSync(firstPath), false, 'the replaced file is deleted');
  // Someone else's photo is their own, not a replacement of Sam's.
  const sara = store.joinGroup(group.id, 'Sara').member;
  assert.equal(photos.addPhoto(group.id, sara.key, setId, JPEG).replaced, false);
  assert.equal(photos.listPhotos(SLUG, setId).length, 2);
});

test('the list marks the viewer’s own photo without exposing member keys', () => {
  const { store, photos, group, sam, setId } = fresh();
  const sara = store.joinGroup(group.id, 'Sara').member;
  photos.addPhoto(group.id, sam.key, setId, JPEG);
  photos.addPhoto(group.id, sara.key, setId, PNG);
  const forSara = photos.listPhotos(SLUG, setId, { groupId: group.id, memberKey: sara.key });
  assert.deepEqual(forSara.map((p) => [p.uploadedBy, p.mine]), [['Sam', false], ['Sara', true]]);
  assert.ok(forSara.every((p) => !('memberKey' in p) && !('member_key' in p)));
  // No viewer: nothing is anyone's.
  assert.ok(photos.listPhotos(SLUG, setId).every((p) => p.mine === false));
});

test('a guest can delete their own photo, and only their own', () => {
  const { store, photos, group, sam, setId } = fresh();
  const sara = store.joinGroup(group.id, 'Sara').member;
  const samPhoto = photos.addPhoto(group.id, sam.key, setId, JPEG).photo;
  photos.addPhoto(group.id, sara.key, setId, PNG);
  const samPath = photos.getPhotoFile(samPhoto.id).path;
  assert.deepEqual(photos.removeMyPhoto(group.id, sam.key, setId), { ok: true });
  assert.deepEqual(photos.listPhotos(SLUG, setId).map((p) => p.uploadedBy), ['Sara']);
  assert.equal(fs.existsSync(samPath), false);
  // Nothing left of Sam's to delete; a stranger's key matches nothing.
  assert.deepEqual(photos.removeMyPhoto(group.id, sam.key, setId), { error: 'photo_not_found' });
  assert.deepEqual(photos.removeMyPhoto(group.id, 'nobody', setId), { error: 'photo_not_found' });
  assert.equal(photos.listPhotos(SLUG, setId).length, 1);
});


test('photos are deleted once their event is over, and kept until then', () => {
  const { db, dir, photos, group, sam, setId } = fresh();
  const { photo } = photos.addPhoto(group.id, sam.key, setId, JPEG);
  const filePath = photos.getPhotoFile(photo.id).path;

  // During the event: nothing goes.
  assert.equal(photos.pruneEndedEventPhotos(new Date('2026-12-31T12:00:00-08:00')), 0);
  assert.equal(photos.listPhotos(SLUG, setId).length, 1);

  // The morning after its last day: rows and files are gone.
  assert.equal(photos.pruneEndedEventPhotos(new Date('2027-01-01T09:00:00-08:00')), 1);
  assert.deepEqual(photos.listPhotos(SLUG, setId), []);
  assert.equal(fs.existsSync(filePath), false);

  // A festival that has left the registry entirely counts as over too.
  db.prepare(`INSERT INTO set_photos (id, festival_slug, set_id, uploaded_by, mime, bytes, created_at)
              VALUES ('orphanphoto12345', 'long-gone-2020', 'x', 'Old', 'image/jpeg', 1, 0)`).run();
  fs.writeFileSync(path.join(dir, 'orphanphoto12345'), JPEG);
  assert.equal(photos.pruneEndedEventPhotos(new Date('2026-12-31T12:00:00-08:00')), 1);
  assert.equal(fs.existsSync(path.join(dir, 'orphanphoto12345')), false);
});
