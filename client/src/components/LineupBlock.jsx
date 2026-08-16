import React from 'react';
import { useVoteBlock, WashSvg, GroupVotesEl, ArtistNames, scoreClass } from './blockShared.jsx';

// An act with no set time yet — used for both untimed layouts (see
// shared/festival.js dayModeOf). Three ways it can be positioned:
//  - `stage` set: placed in that stage's column, in the flyer's own order
//    (`s.order`) — the only signal a per-stage flyer gives without times.
//  - `flowColumn`/`flowRow` set: an act not yet placed on any stage, packed
//    into the leftover alphabetical columns beside the known stages.
//  - neither: no inline position at all — the surrounding .lineup-flow grid
//    places blocks itself in document order (already alphabetical), for a
//    day with no stages announced at all.
const LineupBlock = React.memo(function LineupBlock({
  s, stage, flowColumn, flowRow, myVote, groupVotes, memberKey, memberDisplayName,
  groupId, onVoteChange, onLongPress, onNotMember,
}) {
  const { washDataRef, online, handleClick, startLongPress, cancelLongPress, handlePointerUp, longPressFired } =
    useVoteBlock({ id: s.id, artist: s.artist, artists: s.artists, myVote, groupId, memberKey, onVoteChange, onLongPress, onNotMember });

  const style = stage
    ? { gridColumn: String(stage.col), gridRow: String(s.order + 2), background: `var(${stage.color})` }
    : (flowColumn != null ? { gridColumn: String(flowColumn), gridRow: String(flowRow) } : undefined);

  return (
    <button
      className={`show-block lineup-block ${scoreClass(myVote)}${online ? '' : ' offline'}`}
      data-stage={s.stageId ?? undefined}
      data-id={s.id}
      style={style}
      onClick={longPressFired.current ? undefined : handleClick}
      onPointerDown={startLongPress}
      onPointerMove={cancelLongPress}
      onPointerUp={handlePointerUp}
      onPointerCancel={cancelLongPress}
    >
      <ArtistNames names={s.artists} />
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
  prev.myVote        === next.myVote &&
  prev.groupVotes    === next.groupVotes &&
  prev.memberDisplayName === next.memberDisplayName &&
  prev.onNotMember   === next.onNotMember &&
  prev.stage         === next.stage &&
  prev.flowColumn    === next.flowColumn &&
  prev.flowRow       === next.flowRow
));

export { LineupBlock };
