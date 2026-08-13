import React, { useRef, useEffect, useCallback } from 'react';
import { ShowBlock } from './ShowBlock.jsx';
import { LineupBlock } from './LineupBlock.jsx';
import { watchWordFit } from '../fitWords.js';
import { useFestival } from '../festival-context.jsx';

function timeAxisLabel(slotIndex, { GRID_START_MIN, SLOT_MINS, TOTAL_SLOTS }) {
  const totalMin = GRID_START_MIN + slotIndex * SLOT_MINS;
  const hour = Math.floor(totalMin / 60);
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const suffix = hour >= 12 ? ' PM' : ' AM';
  // Label the two ends with the meridiem for orientation; the rest are bare
  // hour numbers so the narrow axis stays readable.
  if (slotIndex === 0 || slotIndex === TOTAL_SLOTS) {
    return <>{h12}<span className="time-pm">{suffix}</span></>;
  }
  return String(h12);
}

function ordinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// Every act block, whichever grid it renders in, needs the same per-set vote
// data plus the handful of callbacks passed straight down from GroupView.
// Bundled into one helper so each grid body just spreads `voteProps(s)`.
function makeVoteProps({ myVotes, perArtistRaw, memberKey, memberDisplayName, groupId, onVoteChange, onLongPress, onNotMember }) {
  return (s) => ({
    myVote: myVotes[s.id] || 0,
    groupVotes: perArtistRaw[s.id] || [],
    memberKey, memberDisplayName, groupId, onVoteChange, onLongPress, onNotMember,
  });
}

function TimedDayBody({ festival, stages, daySets, stageById, voteProps }) {
  const { TOTAL_SLOTS, SLOTS_PER_HOUR } = festival;
  return (
    // --stage-count drives the column template, so the grid widens to
    // whatever this day's stage list holds.
    <div
      className="schedule-grid"
      style={{
        '--stage-count': stages.length,
        '--total-slots': TOTAL_SLOTS,
        // Tighten the gutters once the day is crowded, so eight stages
        // still fit a desktop window instead of forcing a sideways scroll.
        '--col-gap': stages.length > 6 ? '10px' : '20px',
      }}
    >
      {/* Stage headers */}
      {stages.map((stage) => (
        <div key={stage.id} className="stage-header" data-stage={stage.id}
          style={{ gridColumn: stage.col, gridRow: 1, color: `var(${stage.color})` }}>
          {stage.name}
        </div>
      ))}

      {/* Opaque strip behind the sticky time axis, so stage columns
          scrolling past it don't show through the gaps between labels. */}
      <div className="time-axis-backdrop" style={{ gridColumn: 1, gridRow: `1 / -1` }} />

      {/* Time axis labels — one per hour, whatever the slot size */}
      {Array.from(
        { length: TOTAL_SLOTS / SLOTS_PER_HOUR + 1 },
        (_, i) => i * SLOTS_PER_HOUR,
      ).map((slot) => (
        <div key={slot} className="time-label"
          style={{ gridColumn: 1, gridRow: slot + 2 }}>
          {timeAxisLabel(slot, festival)}
        </div>
      ))}

      {/* Show blocks */}
      {daySets.map((s) => (
        <ShowBlock key={s.id} s={s} stage={stageById[s.stageId]} {...voteProps(s)} />
      ))}
    </div>
  );
}

// Stage known, times not announced yet: same column-per-stage shape as the
// timed grid, minus the time axis, with each stage's acts listed
// alphabetically instead of positioned by time.
function StagedLineupBody({ stages, daySets, stageById, voteProps }) {
  return (
    <div
      className="lineup-grid"
      style={{
        '--stage-count': stages.length,
        '--col-gap': stages.length > 6 ? '10px' : '20px',
      }}
    >
      {stages.map((stage) => (
        <div key={stage.id} className="stage-header" data-stage={stage.id}
          style={{ gridColumn: stage.col, gridRow: 1, color: `var(${stage.color})` }}>
          {stage.name}
        </div>
      ))}
      {daySets.map((s) => (
        <LineupBlock key={s.id} s={s} stage={stageById[s.stageId]} {...voteProps(s)} />
      ))}
    </div>
  );
}

// Nothing announced but the artist names yet: no stages to group by, so the
// whole day's lineup flows alphabetically into a grid capped around 7
// columns wide (see .lineup-flow), narrowing on smaller screens.
function FlowLineupBody({ daySets, voteProps }) {
  return (
    <div className="lineup-flow">
      {daySets.map((s) => (
        <LineupBlock key={s.id} s={s} {...voteProps(s)} />
      ))}
    </div>
  );
}

function DayGrid({ day, myVotes, perArtistRaw, memberKey, memberDisplayName, groupId, onVoteChange, onLongPress, onNotMember }) {
  const festival = useFestival();
  const { SCHEDULE } = festival;
  const daySets = SCHEDULE.filter((s) => s.dayId === day.id);
  const stages = festival.stagesForDay(day.id);
  const stageById = Object.fromEntries(stages.map((st) => [st.id, st]));
  const mode = festival.dayMode(day.id);
  const [dayMonth, dayNumStr] = day.date.split(' ');
  const dayNum = parseInt(dayNumStr, 10);
  const dayDate = `${dayNum}${ordinalSuffix(dayNum)}`;

  const voteProps = makeVoteProps({
    myVotes, perArtistRaw, memberKey, memberDisplayName, groupId, onVoteChange, onLongPress, onNotMember,
  });

  return (
    <div data-day={day.id}>
      <div className="day-heading">
        <span className="day-name">{day.name}</span>
        <span className="day-date">{dayMonth} {dayDate}</span>
      </div>
      <div className="schedule-wrap">
        {mode === 'timed' && (
          <TimedDayBody festival={festival} stages={stages} daySets={daySets} stageById={stageById} voteProps={voteProps} />
        )}
        {mode === 'staged-untimed' && (
          <StagedLineupBody stages={stages} daySets={daySets} stageById={stageById} voteProps={voteProps} />
        )}
        {mode === 'unstaged-untimed' && (
          <FlowLineupBody daySets={daySets} voteProps={voteProps} />
        )}
      </div>
    </div>
  );
}

// Scroll position is per festival — restoring a position from a different
// lineup's grid would land somewhere arbitrary.
const lastScrollKey = (slug) => `brsp.lastScroll.v2.${slug}`;

export default function ScheduleGrid({
  myVotes, perArtistRaw, memberKey, memberDisplayName,
  groupId, activeDay, setActiveDay, onVoteChange, onLongPress, onNotMember,
}) {
  const { DAYS, slug } = useFestival();
  const LAST_SCROLL_KEY = lastScrollKey(slug);
  const bodyRef = useRef(null);
  const observerRef = useRef(null);

  // Scale down any word too wide for its column (see fitWords). Runs once the
  // grid is laid out, then again on resize and after webfonts land.
  useEffect(() => watchWordFit(), []);

  // Restore saved scroll position after first paint.
  // Using rAF ensures the page has laid out before we scroll, which avoids
  // confusing iOS Safari's viewport after a pull-to-refresh.
  useEffect(() => {
    const saved = localStorage.getItem(LAST_SCROLL_KEY);
    if (!saved) return;
    const y = parseInt(saved, 10);
    if (!isNaN(y) && y > 0) {
      requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' }));
    }
  }, []); // eslint-disable-line

  // Save scroll position on every scroll
  useEffect(() => {
    const onScroll = () => localStorage.setItem(LAST_SCROLL_KEY, String(Math.round(window.scrollY)));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // IntersectionObserver: track which day is most visible → update active tab
  useEffect(() => {
    if (!bodyRef.current) return;
    observerRef.current?.disconnect();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
            const dayId = entry.target.dataset.day;
            if (dayId) setActiveDay(dayId);
          }
        }
      },
      { threshold: 0.3 },
    );
    bodyRef.current.querySelectorAll('[data-day]').forEach((el) => obs.observe(el));
    observerRef.current = obs;
    return () => obs.disconnect();
  }, []); // eslint-disable-line

  return (
    <div ref={bodyRef}>
      {DAYS.map((day) => (
        <DayGrid
          key={day.id}
          day={day}
          myVotes={myVotes}
          perArtistRaw={perArtistRaw}
          memberKey={memberKey}
          memberDisplayName={memberDisplayName}
          groupId={groupId}
          onVoteChange={onVoteChange}
          onLongPress={onLongPress}
          onNotMember={onNotMember}
        />
      ))}
      <footer style={{
        marginTop: '100px',
        paddingBottom: '40px',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--ink-soft)',
      }}>
        <a href="https://stuffbydan.com" target="_blank" rel="noopener noreferrer" style={{
          color: 'inherit',
          textDecoration: 'none',
          fontWeight: 600,
        }}>
          Made with ♥ in San Francisco
        </a>
        {/* <div style={{
          marginTop: '20px',
          fontSize: '0.7rem',
          color: 'var(--ink-dim)',
          lineHeight: 1.6,
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          We collect IP addresses for rate limiting and the names you enter. No tracking, marketing, or data sharing.
        </div> */}
      </footer>
    </div>
  );
}
