import React, { useState, useCallback } from 'react';
import { useFestival } from '../festival-context.jsx';
import FestivalSwitcher from '../components/FestivalSwitcher.jsx';
import ScheduleGrid from '../components/ScheduleGrid.jsx';
import ArtistPopup from '../components/ArtistPopup.jsx';

// Shown in place of a group once a festival has ended and there's no group
// on this device to resume — joining and creating groups are both closed by
// then, so there's nothing left to sign into. Just the lineup: browsable,
// long-pressable for artist info, with every vote/membership affordance
// gone rather than present-but-disabled.
export default function ReadOnlyView() {
  const festival = useFestival();
  const [activeDay, setActiveDay] = useState(festival.DAYS[0].id);
  const [popup, setPopup] = useState(null); // { id, artist, artists }

  const handleLongPress = useCallback((artistId, artistName, artists) => {
    setPopup({ id: artistId, artist: artistName, artists: artists ?? [artistName] });
  }, []);

  const noop = useCallback(() => {}, []);

  return (
    <div className="app">
      <div className="toolbar">
        <div className="brand">
          <FestivalSwitcher />
          <div className="brand-info">
            <div className="brand-title">{festival.shortName}</div>
          </div>
        </div>
        <div className="offline-banner">
          This festival has ended — here&rsquo;s the full schedule. Voting and joining are closed.
        </div>
      </div>

      <ScheduleGrid
        myVotes={{}}
        perArtistRaw={{}}
        memberKey={null}
        memberDisplayName={null}
        groupId={null}
        activeDay={activeDay}
        setActiveDay={setActiveDay}
        onVoteChange={noop}
        onLongPress={handleLongPress}
        onNotMember={noop}
      />

      {popup && (
        <ArtistPopup
          artistId={popup.id}
          artistName={popup.artist}
          artists={popup.artists}
          votes={[]}
          memberKey={null}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
