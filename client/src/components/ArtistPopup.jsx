import React, { useState } from 'react';
import Modal from './Modal.jsx';
import { useFestival } from '../festival-context.jsx';
import { photosOpenFor } from '../../../shared/festival.js';
import { CameraButton, CameraView, PhotoGrid, usePhotos, deleteMyPhoto } from './SetPhotos.jsx';

function initials(name) {
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function MemberRow({ v, memberKey }) {
  return (
    <div className="picks-member">
      <span className="chip-avatar">{initials(v.displayName)}</span>
      <span>{v.displayName}</span>
      {v.key === memberKey && <span className="chip-you">(you)</span>}
    </div>
  );
}

const PLATFORMS = [
  { key: 'spotify', label: 'Spotify', className: 'listen-link-spotify' },
  { key: 'appleMusic', label: 'Apple Music', className: 'listen-link-apple' },
  { key: 'soundcloud', label: 'SoundCloud', className: 'listen-link-soundcloud' },
];

// One artist's row of "listen on ___" links — omitted entirely for an artist
// with no links on file yet (see artistLinks in shared/festivals/*.js). For a
// B2B pair, showName labels each artist's own row so it's clear which half
// of the pair the links belong to — the two often don't both have links.
function ListenLinks({ name, links, showName }) {
  const entries = PLATFORMS.filter((p) => links?.[p.key]);
  if (!entries.length) return null;
  return (
    <div className="listen-links-group">
      {showName && <div className="listen-links-name">{name}</div>}
      <div className="listen-links">
        {entries.map((p) => (
          <a
            key={p.key}
            href={links[p.key]}
            target="_blank"
            rel="noopener noreferrer"
            className={`listen-link ${p.className}`}
          >
            {p.label}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function ArtistPopup({ artistId, artistName, artists, votes, memberKey, groupId, onClose }) {
  const festival = useFestival();
  const { photos, reload } = usePhotos(artistId, { groupId, memberKey });
  const [cameraOpen, setCameraOpen] = useState(false);
  // The camera (and Retake) only appear while this act's photos are open —
  // on its day for a festival, any time at Lucky 13 (photosOpenFor). Photos
  // already taken stay visible either way.
  const canTakePhoto = Boolean(groupId)
    && photosOpenFor(festival, festival.SCHEDULE_BY_ID[artistId]?.dayId);
  const musts = votes.filter((v) => v.score === 3);
  const wants = votes.filter((v) => v.score === 1);
  const names = artists?.length ? artists : [artistName];

  return (
    <Modal onClose={onClose} label={artistName} className="modal-popover" backdropClassName="is-centered">
      <div className="picks-artist">
        <span>{artistName}</span>
        {canTakePhoto && !cameraOpen && (
          <CameraButton setId={artistId} groupId={groupId} memberKey={memberKey}
            hasPhoto={photos.some((p) => p.mine)}
            onUploaded={reload} onOpenCamera={() => setCameraOpen(true)} />
        )}
      </div>
      {canTakePhoto && cameraOpen && (
        <CameraView setId={artistId} groupId={groupId} memberKey={memberKey}
          onDone={() => { setCameraOpen(false); reload(); }}
          onCancel={() => setCameraOpen(false)} />
      )}
      {festival.photos && !cameraOpen && (
        <PhotoGrid
          photos={photos}
          onRetake={canTakePhoto ? () => setCameraOpen(true) : undefined}
          onDelete={async () => {
            if (await deleteMyPhoto({ groupId, setId: artistId, memberKey })) reload();
          }}
        />
      )}
      {names.map((name) => (
        <ListenLinks key={name} name={name} links={festival.artistLinks?.[name]} showName={names.length > 1} />
      ))}
      {musts.length > 0 && (
        <div className="picks-section">
          <div className="picks-section-head">🔥 Must See</div>
          {musts.map((v) => <MemberRow key={v.key} v={v} memberKey={memberKey} />)}
        </div>
      )}
      {wants.length > 0 && (
        <div className="picks-section">
          <div className="picks-section-head">
            <svg className="icon-check" viewBox="0 0 28 28" overflow="visible" aria-hidden="true">
              <use href={festival.maxPicks ? '#mark-heart' : '#mark-check'} />
            </svg>
            {festival.maxPicks ? 'Like' : 'Want'}
          </div>
          {wants.map((v) => <MemberRow key={v.key} v={v} memberKey={memberKey} />)}
        </div>
      )}
      {!musts.length && !wants.length && (
        // A secretVotes event (see shared/festivals/lucky-13.js) never shows
        // the group's picks, so "none yet" would mislead.
        <div className="picks-empty">{festival.secretVotes ? 'Votes are secret' : 'No group picks yet'}</div>
      )}
    </Modal>
  );
}
