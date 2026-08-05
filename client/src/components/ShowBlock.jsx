import React, { useRef, useCallback, useState } from 'react';
import { computeWashData } from '../svgDefs.js';
import { api } from '../api.js';
import { toast } from '../toast.js';
import {
  SCHEDULE, GRID_START_MIN, GRID_END_MIN, SLOT_MINS, TOTAL_SLOTS,
} from '../../../shared/schedule.js';

function minToSlot(min) { return Math.round((min - GRID_START_MIN) / SLOT_MINS); }
function fmtTimeShort(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}` : `${h12}:${String(m).padStart(2, '0')}`;
}
function scoreClass(score) {
  if (score >= 3) return 'vote-3';
  if (score >= 1) return 'vote-1';
  return 'vote-0';
}
function nextScore(cur) {
  if (cur === 3) return 0;
  if (cur === 1) return 3;
  return 1;
}

function WashSvg({ data }) {
  const { filterRef, rotation, returnOpacity, p1, p2 } = data;
  return (
    <svg className="wash" viewBox="0 0 100 100" preserveAspectRatio="none"
      aria-hidden="true" style={{ transform: `rotate(${rotation.toFixed(2)}deg)` }}>
      <path d={p1} fill="currentColor" opacity="0.85" filter={filterRef} />
      <path d={p2} fill="currentColor" opacity={returnOpacity} filter={filterRef} />
    </svg>
  );
}

function GroupVotesEl({ votes, myVote, memberKey, memberDisplayName }) {
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

const ShowBlock = React.memo(function ShowBlock({
  s, stage, myVote, groupVotes, memberKey, memberDisplayName,
  groupId, onVoteChange, onLongPress, onNotMember,
}) {
  if (!stage) return null;
  const col = stage.col;
  const startSlot = minToSlot(Math.max(s.startMin, GRID_START_MIN));
  const endSlot   = minToSlot(Math.min(s.endMin, GRID_END_MIN));
  if (startSlot >= TOTAL_SLOTS || endSlot <= 0) return null;

  // Stable wash data — created once per ShowBlock instance (useRef)
  const washDataRef = useRef(null);
  if (!washDataRef.current) washDataRef.current = computeWashData(s.id);

  const [saving, setSaving] = useState(false);

  const handleClick = useCallback(async () => {
    if (saving) return;
    // Clearing the ref here causes it to be recomputed on the very next render
    // (which is triggered by myVote changing). WS-only re-renders never clear
    // it, so peers' votes never disturb your brushstroke.
    washDataRef.current = null;
    const next = nextScore(myVote);
    onVoteChange(s.id, next); // optimistic
    setSaving(true);
    try {
      await api.setVote(groupId, memberKey, s.id, next);
    } catch (e) {
      onVoteChange(s.id, myVote); // revert
      if (e.message === 'not_a_member') {
        onNotMember?.();
      } else {
        toast(`Save failed: ${e.message}`);
      }
    } finally {
      setSaving(false);
    }
  }, [myVote, saving, s.id, groupId, memberKey, onVoteChange, onNotMember]);

  // Long-press
  const longPressTimer = useRef(null);
  const longPressFired = useRef(false);

  const startLongPress = useCallback((e) => {
    longPressFired.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onLongPress(s.id, s.artist);
    }, 500);
  }, [s.id, s.artist, onLongPress]);

  const cancelLongPress = useCallback(() => {
    clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  }, []);

  const handlePointerUp = useCallback(() => {
    cancelLongPress();
  }, [cancelLongPress]);

  return (
    <button
      className={`show-block ${scoreClass(myVote)}${s.followsPrevious ? ' follows-prev' : ''}`}
      data-stage={s.stageId}
      data-id={s.id}
      style={{
        gridColumn: String(col),
        gridRow: `${startSlot + 2} / ${endSlot + 2}`,
        background: `var(${stage.color})`,
        // Share the column when this set collides with another on the same
        // stage; laneCount is 1 for the overwhelming majority of sets.
        ...(s.laneCount > 1 && {
          width: `calc(100% / ${s.laneCount})`,
          marginLeft: `calc(100% * ${s.lane} / ${s.laneCount})`,
        }),
      }}
      onClick={longPressFired.current ? undefined : handleClick}
      onPointerDown={startLongPress}
      onPointerMove={cancelLongPress}
      onPointerUp={handlePointerUp}
      onPointerCancel={cancelLongPress}
    >
      {s.artists.map((name, i) => (
        <span className="artist-name" key={i}>
          {/* Each word is its own box so it can ellipsize on its own when it
              is wider than the column, instead of being split mid-word. */}
          {name.split(/\s+/).map((word, j) => (
            <React.Fragment key={j}>
              {j > 0 ? ' ' : null}
              <span className="word">{word}</span>
            </React.Fragment>
          ))}
        </span>
      ))}
      <span className="show-time">{fmtTimeShort(s.start)}&ndash;{fmtTimeShort(s.end)}</span>
      <WashSvg data={washDataRef.current} />
      <GroupVotesEl
        votes={groupVotes}
        myVote={myVote}
        memberKey={memberKey}
        memberDisplayName={memberDisplayName}
      />
    </button>
  );
}, (prev, next) => (
  // Only re-render if this show's vote or group picks changed
  prev.myVote        === next.myVote &&
  prev.groupVotes    === next.groupVotes &&
  prev.memberDisplayName === next.memberDisplayName &&
  prev.onNotMember   === next.onNotMember &&
  prev.stage         === next.stage
));

export { ShowBlock, minToSlot };
