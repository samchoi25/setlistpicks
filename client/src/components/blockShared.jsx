import React, { useRef, useCallback, useState } from 'react';
import { computeWashData } from '../svgDefs.js';
import { api } from '../api.js';
import { toast } from '../toast.js';

export function scoreClass(score) {
  if (score >= 3) return 'vote-3';
  if (score >= 1) return 'vote-1';
  return 'vote-0';
}

export function nextScore(cur) {
  if (cur === 3) return 0;
  if (cur === 1) return 3;
  return 1;
}

export function WashSvg({ data }) {
  const { filterRef, rotation, returnOpacity, p1, p2 } = data;
  return (
    <svg className="wash" viewBox="0 0 100 100" preserveAspectRatio="none"
      aria-hidden="true" style={{ transform: `rotate(${rotation.toFixed(2)}deg)` }}>
      <path d={p1} fill="currentColor" opacity="0.85" filter={filterRef} />
      <path d={p2} fill="currentColor" opacity={returnOpacity} filter={filterRef} />
    </svg>
  );
}

export function GroupVotesEl({ votes, myVote, memberKey, memberDisplayName }) {
  const serverOthers = votes.filter((v) => v.key !== memberKey);
  const allVoters = [
    ...serverOthers,
    ...(myVote > 0 ? [{ key: memberKey, displayName: memberDisplayName, score: myVote }] : []),
  ].filter((v) => v.score === 1 || v.score === 3);

  if (!allVoters.length) return null;

  // Up to three voters are listed by name, one per line — side by side they
  // ran past the edge of the block. Beyond three there is no room for names,
  // so the icons stand on their own.
  const showNames = allVoters.length <= 3;
  const fName = (v) => v.displayName.split(' ')[0];
  const icon = (v) => v.score === 3 ? '🔥' : '✓';
  const cls  = (v) => v.score === 3 ? 'gv-fire' : 'gv-check';

  return (
    <div className={`group-votes${showNames ? ' with-names' : ''}`}>
      {allVoters.map((v, i) => (
        showNames ? (
          <span className="gv-row" key={v.key ?? i}>
            <span className={cls(v)}>{icon(v)}</span>
            <span className="gv-name">{fName(v)}</span>
          </span>
        ) : (
          <span className={cls(v)} key={v.key ?? i}>{icon(v)}</span>
        )
      ))}
    </div>
  );
}

// Shared vote-toggle + long-press behavior for any tappable act block
// (ShowBlock's time-positioned version and LineupBlock's untimed one). Both
// only differ in how they're laid out on the grid, not in how a tap or a
// long-press behaves, so that logic lives here once.
export function useVoteBlock({ id, artist, artists, myVote, groupId, memberKey, onVoteChange, onLongPress, onNotMember }) {
  // Stable wash data — created once per block instance (useRef)
  const washDataRef = useRef(null);
  if (!washDataRef.current) washDataRef.current = computeWashData(id);

  const [saving, setSaving] = useState(false);

  const handleClick = useCallback(async () => {
    if (saving) return;
    // Clearing the ref here causes it to be recomputed on the very next render
    // (which is triggered by myVote changing). WS-only re-renders never clear
    // it, so peers' votes never disturb your brushstroke.
    washDataRef.current = null;
    const next = nextScore(myVote);
    onVoteChange(id, next); // optimistic
    setSaving(true);
    try {
      await api.setVote(groupId, memberKey, id, next);
    } catch (e) {
      onVoteChange(id, myVote); // revert
      if (e.message === 'not_a_member') {
        onNotMember?.();
      } else {
        toast(`Save failed: ${e.message}`);
      }
    } finally {
      setSaving(false);
    }
  }, [myVote, saving, id, groupId, memberKey, onVoteChange, onNotMember]);

  // Long-press
  const longPressTimer = useRef(null);
  const longPressFired = useRef(false);

  const startLongPress = useCallback(() => {
    longPressFired.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onLongPress(id, artist, artists);
    }, 500);
  }, [id, artist, artists, onLongPress]);

  const cancelLongPress = useCallback(() => {
    clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  }, []);

  const handlePointerUp = useCallback(() => {
    cancelLongPress();
  }, [cancelLongPress]);

  return { washDataRef, saving, handleClick, startLongPress, cancelLongPress, handlePointerUp, longPressFired };
}

// Word-by-word markup so fitWords can shrink an individual overlong word
// without rescaling the whole name — shared by every act block.
export function ArtistName({ name }) {
  return (
    <span className="artist-name">
      {name.split(/\s+/).map((word, j) => (
        <React.Fragment key={j}>
          {j > 0 ? ' ' : null}
          <span className="word">{word}</span>
        </React.Fragment>
      ))}
    </span>
  );
}
