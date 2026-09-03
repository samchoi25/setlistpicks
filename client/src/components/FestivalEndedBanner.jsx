import React from 'react';
import { useFestival } from '../festival-context.jsx';
import { hasFestivalEnded } from '../../../shared/festival.js';

// Non-dismissible, same as OfflineBanner — there's nothing to do about a
// festival being over other than look back at it.
export default function FestivalEndedBanner() {
  const festival = useFestival();
  if (!hasFestivalEnded(festival)) return null;
  return (
    <div className="offline-banner">
      This festival has ended — showing everyone's final picks. Voting and joining are closed.
    </div>
  );
}
