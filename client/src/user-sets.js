import { useEffect, useMemo, useState } from 'react';
import { withUserSets } from '../../shared/festival.js';

/*
 * Guest-entered sets for a userSets event (a party voting on cocktails — see
 * shared/festivals/lucky-13.js), merged into the festival so the grid, the
 * vote buttons and everything else treat them as ordinary untimed sets.
 *
 * Polls so a cocktail someone else just entered shows up without a reload,
 * and refetches at once when this tab adds or removes one (notifyUserSetsChanged).
 * A festival without userSets is returned untouched and nothing is fetched.
 */
const CHANGED = 'user-sets-changed';
const POLL_MS = 15000;

export function notifyUserSetsChanged() {
  window.dispatchEvent(new Event(CHANGED));
}

export function useFestivalWithUserSets(festival) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    setRows([]);
    if (!festival.userSets) return undefined;
    let stopped = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/festivals/${encodeURIComponent(festival.slug)}/user-sets`);
        if (!res.ok) return;
        const { sets } = await res.json();
        // Only replace when something changed, so the merged festival keeps
        // its identity (and the grid doesn't re-render) on an idle poll.
        if (!stopped) setRows((prev) => (JSON.stringify(prev) === JSON.stringify(sets) ? prev : sets));
      } catch { /* offline — keep what we have */ }
    };
    load();
    const timer = setInterval(load, POLL_MS);
    window.addEventListener(CHANGED, load);
    return () => {
      stopped = true;
      clearInterval(timer);
      window.removeEventListener(CHANGED, load);
    };
  }, [festival]);

  return useMemo(() => withUserSets(festival, rows), [festival, rows]);
}
