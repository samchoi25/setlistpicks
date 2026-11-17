import React, { useLayoutEffect, useMemo } from 'react';
import { useFestivalSuggestions } from '../components/FestivalSearchModal.jsx';
import { getActiveGroup } from '../storage.js';
import { hasFestivalEnded } from '../../../shared/festival.js';
import { groupUrlPath, festivalPath } from '../../../shared/routes.js';
import { DEFAULT_THEME_COLOR } from '../../../shared/theme.js';

const HOME_TITLE = 'Setlist Picks | Plan your festival sets with your crew';

/*
 * The landing page at `/`: what Setlist Picks is, and every public festival
 * with a search box over them. Filtering is shared/festival-search.js, the
 * same forgiving matcher as the festival lookup (initials, venue, city…).
 *
 * Rendered outside FestivalProvider, so it clears whatever festival palette
 * was last applied — arriving here from a themed festival via back/forward
 * should not leave its colours behind. The next FestivalProvider to mount
 * rewrites the element again.
 */
function useSiteTheme() {
  useLayoutEffect(() => {
    const el = document.getElementById('festival-theme');
    if (el) el.textContent = '';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = DEFAULT_THEME_COLOR;
    // Festival pages get their title baked in by the server and never set it
    // client-side, so hand back whatever was there when leaving.
    const prevTitle = document.title;
    document.title = HOME_TITLE;
    return () => { if (prevTitle !== HOME_TITLE) document.title = prevTitle; };
  }, []);
}

// Back to the crew this browser already has at a festival, else its page.
function targetFor(slug) {
  const stored = getActiveGroup(slug);
  return stored ? groupUrlPath(slug, stored) : festivalPath(slug);
}

function FestivalRow({ festival, ended }) {
  const hasCrew = !!getActiveGroup(festival.slug);
  return (
    <li>
      <a className={`landing-festival${ended ? ' is-ended' : ''}`} href={targetFor(festival.slug)}>
        <span className="landing-festival-name">{festival.shortName}</span>
        <span className="landing-festival-meta">
          {festival.dateRange}
          {festival.venue && <> · {festival.venue}</>}
        </span>
        {festival.headliners?.length > 0 && (
          <span className="landing-festival-acts">{festival.headliners.join(' · ')}</span>
        )}
        {hasCrew && <span className="landing-festival-tag">Your crew</span>}
      </a>
    </li>
  );
}

export default function LandingView() {
  useSiteTheme();
  const { query, setQuery, results } = useFestivalSuggestions('', { limit: Infinity });

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const groups = { upcoming: [], past: [] };
    for (const f of results) (hasFestivalEnded(f, now) ? groups.past : groups.upcoming).push(f);
    return groups;
  }, [results]);

  return (
    <div className="app landing">
      <header className="landing-hero">
        <h1 className="landing-title">Setlist Picks</h1>
        <p className="landing-lede">
          Plan a music festival with your friends. Pick the sets you want to see,
          share one link with your crew, and see everyone&rsquo;s picks together
          on the festival schedule.
        </p>
        <ul className="landing-steps">
          <li><strong>Pick</strong> a festival below and mark the acts you want or must see.</li>
          <li><strong>Share</strong> your crew&rsquo;s link. Friends join with one tap, no account.</li>
          <li><strong>Plan</strong> the day from one grid that shows who wants to see what.</li>
        </ul>
      </header>

      <section className="landing-festivals" aria-labelledby="landing-festivals-heading">
        <h2 id="landing-festivals-heading" className="landing-heading">Festivals</h2>
        <input
          type="text"
          className="landing-search"
          placeholder="Search by festival, city or venue"
          aria-label="Search festivals"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />

        {results.length === 0 && (
          <p className="landing-empty">No festivals match &ldquo;{query.trim()}&rdquo;.</p>
        )}

        {upcoming.length > 0 && (
          <>
            <h3 className="landing-subheading">Upcoming</h3>
            <ul className="landing-list">
              {upcoming.map((f) => <FestivalRow key={f.slug} festival={f} />)}
            </ul>
          </>
        )}

        {past.length > 0 && (
          <>
            <h3 className="landing-subheading">Past</h3>
            <ul className="landing-list">
              {past.map((f) => <FestivalRow key={f.slug} festival={f} ended />)}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
