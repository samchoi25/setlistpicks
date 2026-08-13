import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFestival } from '../festival-context.jsx';

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
// with no links on file yet (see artistLinks in shared/festivals/*.js).
function ListenLinks({ name, links }) {
  const entries = PLATFORMS.filter((p) => links?.[p.key]);
  if (!entries.length) return null;
  return (
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
  );
}

export default function ArtistPopup({ artistId, artistName, artists, votes, memberKey, onClose }) {
  const festival = useFestival();
  const musts = votes.filter((v) => v.score === 3);
  const wants = votes.filter((v) => v.score === 1);
  const names = artists?.length ? artists : [artistName];

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="picks-backdrop" onClick={onClose}>
      <div className="picks-popup" onClick={(e) => e.stopPropagation()}>
        <div className="picks-artist">{artistName}</div>
        {names.map((name) => (
          <ListenLinks key={name} name={name} links={festival.artistLinks?.[name]} />
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
              <svg viewBox="0 0 28 28" overflow="visible" aria-hidden="true"
                style={{ width: 12, height: 12, opacity: 1, verticalAlign: 'middle', marginRight: 4 }}>
                <use href="#mark-check" />
              </svg>
              Want
            </div>
            {wants.map((v) => <MemberRow key={v.key} v={v} memberKey={memberKey} />)}
          </div>
        )}
        {!musts.length && !wants.length && (
          <div className="picks-empty">No group picks yet</div>
        )}
      </div>
    </div>,
    document.body,
  );
}
