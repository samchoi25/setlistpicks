import React, { useRef, useEffect, useCallback } from 'react';
import {
  SCHEDULE, DAYS, stagesForDay,
  TOTAL_SLOTS, GRID_START_MIN, SLOT_MINS, SLOTS_PER_HOUR,
} from '../../../shared/schedule.js';
import { ShowBlock, minToSlot } from './ShowBlock.jsx';

function timeAxisLabel(slotIndex) {
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

function DayGrid({ day, myVotes, perArtistRaw, memberKey, memberDisplayName, groupId, onVoteChange, onLongPress, onNotMember }) {
  const daySets = SCHEDULE.filter((s) => s.dayId === day.id);
  const stages = stagesForDay(day.id);
  const stageById = Object.fromEntries(stages.map((st) => [st.id, st]));
  const [dayMonth, dayNumStr] = day.date.split(' ');
  const dayNum = parseInt(dayNumStr, 10);
  const dayDate = `${dayNum}${ordinalSuffix(dayNum)}`;

  return (
    <div data-day={day.id}>
      <div className="day-heading">
        <span className="day-name">{day.name}</span>
        <span className="day-date">{dayMonth} {dayDate}</span>
      </div>
      <div className="schedule-wrap">
        {/* --stage-count drives the column template, so the grid widens to
            whatever this day's stage list holds. */}
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
              {timeAxisLabel(slot)}
            </div>
          ))}

          {/* Show blocks */}
          {daySets.map((s) => (
            <ShowBlock
              key={s.id}
              s={s}
              stage={stageById[s.stageId]}
              myVote={myVotes[s.id] || 0}
              groupVotes={perArtistRaw[s.id] || []}
              memberKey={memberKey}
              memberDisplayName={memberDisplayName}
              groupId={groupId}
              onVoteChange={onVoteChange}
              onLongPress={onLongPress}
              onNotMember={onNotMember}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const LAST_SCROLL_KEY = 'brsp.lastScroll.v1';

export default function ScheduleGrid({
  myVotes, perArtistRaw, memberKey, memberDisplayName,
  groupId, activeDay, setActiveDay, onVoteChange, onLongPress, onNotMember,
}) {
  const bodyRef = useRef(null);
  const observerRef = useRef(null);

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
