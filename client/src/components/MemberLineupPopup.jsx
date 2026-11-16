import React from 'react';
import Modal from './Modal.jsx';
import { fmtTime } from '../../../shared/festival.js';
import { useFestival } from '../festival-context.jsx';

export default function MemberLineupPopup({ memberKey, memberDisplayName, perArtistRaw, onClose }) {
  const { SCHEDULE, DAYS } = useFestival();
  // Build a votes map for this member from the already-fetched perArtistRaw
  const votes = {};
  for (const [artistId, voters] of Object.entries(perArtistRaw)) {
    const v = voters.find((v) => v.key === memberKey);
    if (v && v.score > 0) votes[artistId] = v.score;
  }

  // Group picked shows by day. Timed sets sort chronologically; a day with no
  // set times yet (see festival.dayMode()) has no startMin to sort by, so
  // those fall back to the alphabetical order they were built in.
  const byDay = DAYS.map((day) => {
    const shows = SCHEDULE
      .filter((s) => s.dayId === day.id && votes[s.id])
      .sort((a, b) => (a.timed ? a.startMin - b.startMin : a.artist.localeCompare(b.artist)));
    return { day, shows };
  }).filter(({ shows }) => shows.length > 0);

  const isEmpty = byDay.length === 0;

  return (
    <Modal onClose={onClose} label={`${memberDisplayName}’s picks`} className="modal-popover" backdropClassName="is-centered">
      <div className="picks-artist">{memberDisplayName}&rsquo;s picks</div>
      {isEmpty ? (
        <div className="picks-empty">No picks yet</div>
      ) : (
        byDay.map(({ day, shows }) => (
          <div key={day.id} className="picks-section">
            <div className="picks-section-head">{day.name}</div>
            {shows.map((s) => (
              <div key={s.id} className="picks-show">
                <span className="picks-show-mark">
                  {votes[s.id] === 3 ? '🔥' : (
                    <svg className="icon-check" viewBox="0 0 28 28" overflow="visible" aria-hidden="true">
                      <use href="#mark-check" />
                    </svg>
                  )}
                </span>
                <span className="picks-show-name">
                  {s.artist}
                </span>
                <span className="picks-show-time">
                  {s.timed ? fmtTime(s.start) : 'TBA'}
                </span>
              </div>
            ))}
          </div>
        ))
      )}
    </Modal>
  );
}
