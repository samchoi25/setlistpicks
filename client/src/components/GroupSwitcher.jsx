import React, { useState, useRef, useEffect } from 'react';
import { useFestival } from '../festival-context.jsx';
import { hasFestivalEnded } from '../../../shared/festival.js';
import { getGroupHistory } from '../storage.js';
import { groupPath } from '../../../shared/routes.js';
import CreateGroupModal from './CreateGroupModal.jsx';

function ChevronIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"
      style={{ width: 9, height: 9, opacity: 0.6, flexShrink: 0 }}>
      <path d="M2 4l4 4 4-4z" />
    </svg>
  );
}

/*
 * Turns the group-name header into a switcher: every other group this
 * browser has opened for the same festival (most-recently-viewed first),
 * plus a "Create group" option to start a second crew from scratch. Plain
 * anchors for existing groups, same as FestivalSwitcher, so App.jsx's
 * same-origin click interceptor handles the actual navigation.
 */
// "(4)" after the group name — how many people are in it.
function MemberCount({ count }) {
  if (count == null) return null;
  return (
    <span className="brand-title-count" aria-label={`${count} ${count === 1 ? 'member' : 'members'}`}>
      ({count})
    </span>
  );
}

export default function GroupSwitcher({ groupId, groupName, memberCount, disabled }) {
  const festival = useFestival();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (disabled) {
    return <div className="brand-title">{groupName} <MemberCount count={memberCount} /></div>;
  }

  const others = getGroupHistory(festival.slug).filter((g) => g.groupId !== groupId);

  return (
    <div className="brand-title-wrap" ref={rootRef}>
      <button
        type="button"
        className="brand-title brand-title-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {groupName}
        <MemberCount count={memberCount} />
        <ChevronIcon />
      </button>
      {open && (
        <div className="brand-title-dropdown" role="listbox">
          <span className="brand-title-option current" aria-current="true">{groupName}</span>
          {others.map((g) => (
            <a
              key={g.groupId}
              href={groupPath(festival.slug, g.groupId)}
              className="brand-title-option"
              onClick={() => setOpen(false)}
            >
              {g.name || 'Unnamed crew'}
            </a>
          ))}
          {/* A party (userSets event, see shared/festivals/lucky-13.js) is one
              shared group — there's no second crew to start. */}
          {!hasFestivalEnded(festival) && !festival.userSets && (
            <>
              <div className="brand-title-divider" />
              <button
                type="button"
                className="brand-title-option create"
                onClick={() => { setOpen(false); setCreating(true); }}
              >
                + Create group
              </button>
            </>
          )}
        </div>
      )}
      {creating && (
        <CreateGroupModal festivalSlug={festival.slug} onClose={() => setCreating(false)} />
      )}
    </div>
  );
}
