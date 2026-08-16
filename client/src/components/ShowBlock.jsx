import React from 'react';
import { useFestival } from '../festival-context.jsx';
import { useVoteBlock, WashSvg, GroupVotesEl, ArtistName, scoreClass } from './blockShared.jsx';

const minToSlot = (min, gridStartMin, slotMins) =>
  Math.round((min - gridStartMin) / slotMins);
function fmtTimeShort(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}` : `${h12}:${String(m).padStart(2, '0')}`;
}

const ShowBlock = React.memo(function ShowBlock({
  s, stage, myVote, groupVotes, memberKey, memberDisplayName,
  groupId, onVoteChange, onLongPress, onNotMember,
}) {
  const { GRID_START_MIN, GRID_END_MIN, SLOT_MINS, TOTAL_SLOTS } = useFestival();
  if (!stage) return null;
  const col = stage.col;
  const startSlot = minToSlot(Math.max(s.startMin, GRID_START_MIN), GRID_START_MIN, SLOT_MINS);
  const endSlot   = minToSlot(Math.min(s.endMin, GRID_END_MIN), GRID_START_MIN, SLOT_MINS);
  if (startSlot >= TOTAL_SLOTS || endSlot <= 0) return null;

  const { washDataRef, online, handleClick, startLongPress, cancelLongPress, handlePointerUp, longPressFired } =
    useVoteBlock({ id: s.id, artist: s.artist, artists: s.artists, myVote, groupId, memberKey, onVoteChange, onLongPress, onNotMember });

  return (
    <button
      className={`show-block ${scoreClass(myVote)}${s.followsPrevious ? ' follows-prev' : ''}${online ? '' : ' offline'}`}
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
      {s.artists.map((name, i) => <ArtistName key={i} name={name} />)}
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

export { ShowBlock };
