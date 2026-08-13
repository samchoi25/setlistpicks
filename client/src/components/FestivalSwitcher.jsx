import React, { useState, useRef, useEffect } from 'react';
import { useFestival } from '../festival-context.jsx';
import { getActiveGroup } from '../storage.js';
import { listFestivals } from '../../../shared/festivals/index.js';
import { hasFestivalEnded } from '../../../shared/festival.js';
import { groupPath, festivalPath } from '../../../shared/routes.js';

function ChevronIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"
      style={{ width: 9, height: 9, opacity: 0.6, flexShrink: 0 }}>
      <path d="M2 4l4 4 4-4z" />
    </svg>
  );
}

// The link a festival's row in the menu should go to: back to the crew this
// browser already has there, or that festival's landing page to start one —
// same resolution App.jsx does for a bare `/<slug>/` visit.
function targetFor(slug) {
  const stored = getActiveGroup(slug);
  return stored ? groupPath(slug, stored) : festivalPath(slug);
}

/*
 * Replaces the plain "Portola"-style wordmark with a switcher once there's
 * more than one live festival to switch to — lets a crew member with picks
 * in several festivals jump between them. Plain anchors, not a client-side
 * navigate() call: App.jsx already intercepts same-origin link clicks, and
 * this component is used both inside GroupView (which has that context) and
 * in App.jsx's own loading shell (which doesn't have a group yet).
 */
export default function FestivalSwitcher() {
  const festival = useFestival();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const upcoming = listFestivals().filter((f) => !hasFestivalEnded(f));

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

  // Nothing else live to switch to — the plain wordmark, no dropdown affordance.
  if (upcoming.length <= 1) {
    return <div className="brand-logo">{festival.shortName}</div>;
  }

  return (
    <div className="brand-logo-wrap" ref={rootRef}>
      <button
        type="button"
        className="brand-logo brand-logo-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {festival.shortName}
        <ChevronIcon />
      </button>
      {open && (
        <div className="brand-logo-dropdown" role="listbox">
          {upcoming.map((f) => {
            const isCurrent = f.slug === festival.slug;
            return isCurrent ? (
              <span key={f.slug} className="brand-logo-option current" aria-current="true">
                {f.shortName}
              </span>
            ) : (
              <a
                key={f.slug}
                href={targetFor(f.slug)}
                className="brand-logo-option"
                onClick={() => setOpen(false)}
              >
                {f.shortName}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
