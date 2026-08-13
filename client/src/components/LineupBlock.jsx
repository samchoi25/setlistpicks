import React from 'react';
import { useVoteBlock, WashSvg, GroupVotesEl, ArtistName, scoreClass } from './blockShared.jsx';

// An act with no set time yet — used for both untimed modes (see
// shared/festival.js dayModeOf). With a known stage, `stage` positions it in
// that stage's column at its alphabetical row (`s.order`); without one, no
// inline position is set and the surrounding .lineup-flow grid places blocks
// itself in document order, which is already alphabetical.
const LineupBlock = React.memo(function LineupBlock({
  s, stage, myVote, groupVotes, memberKey, memberDisplayName,
  groupId, onVoteChange, onLongPress, onNotMember,
}) {
  const { washDataRef, handleClick, startLongPress, cancelLongPress, handlePointerUp, longPressFired } =
    useVoteBlock({ id: s.id, artist: s.artist, myVote, groupId, memberKey, onVoteChange, onLongPress, onNotMember });

  return (
    <button
      className={`show-block lineup-block ${scoreClass(myVote)}`}
      data-stage={s.stageId ?? undefined}
      data-id={s.id}
      style={stage ? {
        gridColumn: String(stage.col),
        gridRow: String(s.order + 2),
        background: `var(${stage.color})`,
      } : undefined}
      onClick={longPressFired.current ? undefined : handleClick}
      onPointerDown={startLongPress}
      onPointerMove={cancelLongPress}
      onPointerUp={handlePointerUp}
      onPointerCancel={cancelLongPress}
    >
      <ArtistName name={s.artist} />
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
  prev.stage         === next.stage
));

export { LineupBlock };
