import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from './api.js';
import { getIdentity, setIdentity, getActiveGroup, setActiveGroup, clearActiveGroup } from './storage.js';
import { ensureSvgDefs } from './svgDefs.js';
import GroupView from './views/GroupView.jsx';
import { FestivalProvider } from './festival-context.jsx';
import { getFestival, DEFAULT_FESTIVAL_SLUG } from '../../shared/festivals/index.js';
import { parsePath, groupPath, festivalPath } from '../../shared/routes.js';

const GROUP_NAMES = [
  'Golden Gate Crew', 'The Fog Chasers', 'Polo Field Posse', 'Stage Hoppers',
  'Karl the Fog Fan Club', 'Sunset Squad', 'Bay Area Vibes', 'Festival Fam',
  'The Lineup Committee', 'Wristband Warriors',
];
const MEMBER_ADJS = ['Wild', 'Lucky', 'Golden', 'Breezy', 'Mellow', 'Groovy', 'Funky', 'Jazzy', 'Sunny', 'Foggy'];
const MEMBER_NOUNS = ['Dune', 'Cypress', 'Stage', 'Trail', 'Wave', 'Riff', 'Chord', 'Beat', 'Note', 'Sound'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomMemberName() { return `${pick(MEMBER_ADJS)} ${pick(MEMBER_NOUNS)} ${Math.floor(10 + Math.random() * 90)}`; }
function randomGroupName() { return pick(GROUP_NAMES); }

function getPath() { return location.pathname; }

export default function App() {
  return <AppRoutes />;
}

function AppRoutes() {
  const [path, setPath] = useState(getPath);
  const [groupState, setGroupState] = useState(null); // { groupId, member, groupMeta, freshJoin }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigating = useRef(false);

  // Inject SVG defs once on mount
  useEffect(() => { ensureSvgDefs(); }, []);

  const navigate = useCallback((to, { replace = false } = {}) => {
    if (replace) history.replaceState({}, '', to);
    else history.pushState({}, '', to);
    setPath(to);
  }, []);

  useEffect(() => {
    const onPop = () => setPath(getPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Intercept same-origin link clicks
  useEffect(() => {
    const handler = (e) => {
      const a = e.target.closest?.('a[href]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:')) return;
      if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      navigate(href);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [navigate]);

  async function loadGroup(groupId) {
    if (navigating.current) return;
    navigating.current = true;
    setLoading(true);
    setError(null);
    setGroupState(null);

    try {
      let groupMeta = await api.getGroup(groupId);
      let identity = getIdentity(groupId);
      if (identity) {
        const stillMember = groupMeta.members?.some((m) => m.key === identity.key);
        if (!stillMember) identity = null;
      }

      let freshJoin = false;
      if (!identity) {
        const { member } = await api.join(groupId, randomMemberName());
        setIdentity(groupId, member);
        identity = member;
        groupMeta = await api.getGroup(groupId);
        freshJoin = true;
      }

      setActiveGroup(groupMeta.festivalSlug ?? festival.slug, groupId);
      setGroupState({ groupId, member: identity, groupMeta, freshJoin });
    } catch (e) {
      if (e.status === 404) { clearActiveGroup(festival.slug); setError({ msg: 'That group link looks expired or invalid.', canRetry: true }); }
      else if (e.status === 429) setError({ msg: 'Too many groups or users created from this network. Try again later.', canRetry: false });
      else setError({ msg: e.message, canRetry: true });
    } finally {
      setLoading(false);
      navigating.current = false;
    }
  }

  const route = parsePath(path);

  /*
   * Which festival this page is showing. Read from the URL, not fixed to the
   * default — that was the bug: with only one festival a hardcoded default
   * looked correct, and the second one rendered the first one's lineup.
   *
   * A legacy bare-code link carries no slug, so until the group loads and
   * reports its festival we fall back to the default. The server 301s those
   * links anyway, so this is only reachable via in-app history.
   */
  const festival =
    getFestival(groupState?.groupMeta?.festivalSlug)
    ?? getFestival(route.canonicalSlug)
    ?? getFestival(DEFAULT_FESTIVAL_SLUG);

  // A festival page (or `/`, which the server redirects but the SPA can also
  // reach via history): resume this festival's stored group, else start one.
  useEffect(() => {
    if (route.kind !== 'festival' && route.kind !== 'home') return;
    if (navigating.current) return;
    navigating.current = true;

    const slug = route.canonicalSlug ?? festival.slug;
    const stored = getActiveGroup(slug);
    if (stored) {
      navigating.current = false;
      navigate(groupPath(slug, stored), { replace: true });
      return;
    }

    (async () => {
      try {
        const group = await api.createGroup(randomGroupName(), slug);
        navigating.current = false;
        navigate(groupPath(slug, group.id), { replace: true });
      } catch (e) {
        navigating.current = false;
        if (e.status === 429) setError({ msg: 'Too many groups created from this network. Try again later.', canRetry: false });
        else setError({ msg: e.message, canRetry: true });
      }
    })();
  }, [path, navigate]); // eslint-disable-line

  // A group page. Legacy bare-code links are normally redirected by the
  // server; handling them here too covers in-app history navigation.
  useEffect(() => {
    if (route.kind !== 'group' && route.kind !== 'legacy-group') return;
    if (groupState?.groupId === route.code) return;
    loadGroup(route.code);
  }, [path]); // eslint-disable-line

  // Once a group is loaded, put the URL on its festival's canonical path —
  // an old link or an alias should settle on one address.
  useEffect(() => {
    if (!groupState?.groupMeta?.festivalSlug) return;
    const want = groupPath(groupState.groupMeta.festivalSlug, groupState.groupId);
    if (path !== want) navigate(want, { replace: true });
  }, [groupState, path, navigate]);

  const shell = (children) => (
    <div className="app">
      <div className="brand">
        <div className="brand-logo">{festival.shortName}</div>
        <div><div className="brand-title">Setlist Picks</div></div>
      </div>
      {children}
    </div>
  );

  const content = (() => {
    if (error) {
      return shell(
        <div className="card stack">
          <p style={{ margin: 0 }}>{error.msg}</p>
          {error.canRetry && (
            <button className="btn" onClick={() => {
              clearActiveGroup(festival.slug);
              setError(null);
              navigate(festivalPath(festival.slug));
            }}>Start over</button>
          )}
        </div>
      );
    }

    if (loading || route.kind === 'home' || route.kind === 'festival') {
      return shell(
        <div className="card center" style={{ padding: '40px 20px', color: 'var(--ink-soft)', fontSize: '0.9rem' }}>
          Setting up your crew…
        </div>
      );
    }

    if (groupState?.groupId === route.code) {
      return (
        <GroupView
          key={groupState.groupId}
          groupId={groupState.groupId}
          member={groupState.member}
          groupMeta={groupState.groupMeta}
          freshJoin={groupState.freshJoin}
          onLeave={() => {
            clearActiveGroup(festival.slug);
            navigate(festivalPath(festival.slug));
          }}
        />
      );
    }

    return null;
  })();

  // Keyed by slug so switching festivals remounts the tree rather than
  // reusing grid state built for a different lineup.
  return (
    <FestivalProvider key={festival.slug} festival={festival}>
      {content}
    </FestivalProvider>
  );
}
