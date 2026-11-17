import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from './api.js';
import {
  getIdentity, setIdentity, getActiveGroup, setActiveGroup, clearActiveGroup,
  recordGroupVisit,
} from './storage.js';
import { isOnline } from './net-status.js';
import { ensureSvgDefs } from './svgDefs.js';
import GroupView from './views/GroupView.jsx';
import ReadOnlyView from './views/ReadOnlyView.jsx';
import LandingView from './views/LandingView.jsx';
import FestivalSwitcher from './components/FestivalSwitcher.jsx';
import Button from './components/Button.jsx';
import { FestivalProvider } from './festival-context.jsx';
import { useFestivalWithUserSets } from './user-sets.js';
import { getFestival, DEFAULT_FESTIVAL_SLUG } from '../../shared/festivals/index.js';
import { hasFestivalEnded } from '../../shared/festival.js';
import { parsePath, groupUrlPath, festivalPath } from '../../shared/routes.js';

const MEMBER_ADJS = ['Wild', 'Lucky', 'Golden', 'Breezy', 'Mellow', 'Groovy', 'Funky', 'Jazzy', 'Sunny', 'Foggy'];
const MEMBER_NOUNS = ['Dune', 'Cypress', 'Stage', 'Trail', 'Wave', 'Riff', 'Chord', 'Beat', 'Note', 'Sound'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
// The placeholder name a new member gets until they type their own. A
// festival can bring its own words (Lucky 13's are holiday themed).
function randomMemberName(festival) {
  const adjs = festival?.memberNameWords?.adjectives ?? MEMBER_ADJS;
  const nouns = festival?.memberNameWords?.nouns ?? MEMBER_NOUNS;
  return `${pick(adjs)} ${pick(nouns)} ${Math.floor(10 + Math.random() * 90)}`;
}
function randomGroupName(festival) { return pick(festival.groupNames); }

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

  // `api.getGroup`/`api.myVotes`/`api.allVotes` transparently resolve from
  // the offline cache (client/src/offline-cache.js) when there's no
  // connection and this group was loaded before — so the online and offline
  // paths below are the same code, and only truly-never-cached data throws
  // `e.offline`, caught the same way as a genuine network failure.
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
        if (hasFestivalEnded(getFestival(groupMeta.festivalSlug) ?? festival)) {
          setError({ readOnly: true });
          return;
        }
        // Joining is a write — it can't resolve from cache, so it must still
        // hard-fail offline even though the group itself just loaded fine.
        if (!isOnline()) {
          setError({
            msg: "You're offline, and you haven't joined this group on this device before. Connect once to join it, then it'll work offline.",
            canRetry: false,
          });
          return;
        }
        const { member } = await api.join(groupId, randomMemberName(getFestival(groupMeta.festivalSlug) ?? festival));
        setIdentity(groupId, member);
        identity = member;
        groupMeta = await api.getGroup(groupId);
        freshJoin = true;
      }

      const slug = groupMeta.festivalSlug ?? festival.slug;
      setActiveGroup(slug, groupId);
      recordGroupVisit(slug, groupId, groupMeta.name);
      setGroupState({ groupId, member: identity, groupMeta, freshJoin });
    } catch (e) {
      if (e.offline) {
        setError({
          msg: "You're offline, and this group hasn't been loaded on this device before. Connect once to load it, then it'll work offline.",
          canRetry: false,
        });
      } else if (e.status === 404) { clearActiveGroup(festival.slug); setError({ msg: 'That group link looks expired or invalid.', canRetry: true }); }
      else if (e.status === 429) setError({ msg: 'Too many groups or users created from this network. Try again later.', canRetry: false });
      else if (e.data?.error === 'festival_ended') setError({ readOnly: true });
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
  // Adds guest-entered sets for a userSets event; any other festival is
  // returned as is.
  const festivalWithSets = useFestivalWithUserSets(festival);

  // A festival page: resume this festival's stored group, else start one.
  useEffect(() => {
    if (route.kind !== 'festival') return;
    if (navigating.current) return;
    navigating.current = true;

    const slug = route.canonicalSlug ?? festival.slug;
    const stored = getActiveGroup(slug);

    /*
     * A single-group event (userSets — see shared/festivals/lucky-13.js)
     * shows its one group right here, at the event's own path, rather than
     * moving to /:slug/:code. createGroup hands back that shared group, so
     * asking it every time also corrects a stale stored id; offline, the
     * stored one is loaded from cache instead.
     */
    if (getFestival(slug)?.userSets) {
      navigating.current = false;
      if (groupState?.groupMeta?.festivalSlug === slug) return;
      if (hasFestivalEnded(getFestival(slug))) { setError({ readOnly: true }); return; }
      (async () => {
        try {
          const group = await api.createGroup(randomGroupName(getFestival(slug)), slug);
          loadGroup(group.id);
        } catch (e) {
          if (e.offline && stored) loadGroup(stored);
          else if (e.offline) setError({ msg: "You're offline — joining needs a connection.", canRetry: false });
          else if (e.data?.error === 'festival_ended') setError({ readOnly: true });
          else setError({ msg: e.message, canRetry: true });
        }
      })();
      return;
    }

    if (stored) {
      navigating.current = false;
      navigate(groupUrlPath(slug, stored), { replace: true });
      return;
    }

    if (hasFestivalEnded(getFestival(slug) ?? festival)) {
      navigating.current = false;
      setError({ readOnly: true });
      return;
    }

    if (!isOnline()) {
      navigating.current = false;
      setError({ msg: "You're offline — starting a new group needs a connection.", canRetry: false });
      return;
    }

    (async () => {
      try {
        const group = await api.createGroup(randomGroupName(getFestival(slug)), slug);
        navigating.current = false;
        navigate(groupUrlPath(slug, group.id), { replace: true });
      } catch (e) {
        navigating.current = false;
        if (e.offline) setError({ msg: "You're offline — starting a new group needs a connection.", canRetry: false });
        else if (e.status === 429) setError({ msg: 'Too many groups created from this network. Try again later.', canRetry: false });
        else if (e.data?.error === 'festival_ended') setError({ readOnly: true });
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
  // an old link or an alias should settle on one address. Only while the URL
  // is still about this group: leaving it (Back to `/`, another festival)
  // must not be bounced back here just because groupState is still set.
  useEffect(() => {
    if (!groupState?.groupMeta?.festivalSlug) return;
    const r = parsePath(path);
    const aboutThisGroup = ((r.kind === 'group' || r.kind === 'legacy-group') && r.code === groupState.groupId)
      || (r.kind === 'festival' && r.canonicalSlug === groupState.groupMeta.festivalSlug);
    if (!aboutThisGroup) return;
    const want = groupUrlPath(groupState.groupMeta.festivalSlug, groupState.groupId);
    if (path !== want) navigate(want, { replace: true });
  }, [groupState, path, navigate]);

  const shell = (children) => (
    <div className="app">
      <div className="brand">
        <FestivalSwitcher />
        <div><div className="brand-title">Setlist Picks</div></div>
      </div>
      {children}
    </div>
  );

  // `/` is the landing page — it wears the site's own palette, so it sits
  // outside FestivalProvider (see LandingView's useSiteTheme).
  if (route.kind === 'home') return <LandingView />;

  const content = (() => {
    if (error) {
      if (error.readOnly) return <ReadOnlyView />;
      return shell(
        <div className="card stack">
          <p className="card-message">{error.msg}</p>
          {error.canRetry && (
            <Button onClick={() => {
              clearActiveGroup(festival.slug);
              setError(null);
              // A single-group event is already at its festival path, so
              // navigating there would change nothing — start it afresh.
              if (festival.userSets) location.reload();
              else navigate(festivalPath(festival.slug));
            }}>Start over</Button>
          )}
        </div>
      );
    }

    // A single-group event's group renders at the festival path itself.
    const singleGroupHere = route.kind === 'festival' && festival.userSets
      && groupState?.groupMeta?.festivalSlug === festival.slug;

    if (loading || (route.kind === 'festival' && !singleGroupHere)) {
      return shell(
        <div className="card center loading-card">
          Setting up your crew…
        </div>
      );
    }

    if (groupState && (groupState.groupId === route.code || singleGroupHere)) {
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
    <FestivalProvider key={festival.slug} festival={festivalWithSets}>
      {content}
    </FestivalProvider>
  );
}
