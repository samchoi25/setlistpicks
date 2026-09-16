import React, { createContext, useContext, useLayoutEffect } from 'react';
import { themeCss, themeColor } from '../../shared/theme.js';

/*
 * The festival currently being viewed. Components used to import SCHEDULE,
 * DAYS and the grid bounds straight from a module, which hardcoded exactly one
 * festival per build; they now read whichever one the route resolved to.
 *
 * The value is a frozen object built once per slug, so it is referentially
 * stable and consumers never re-render because of the context itself.
 */
const FestivalContext = createContext(null);

/*
 * Apply this festival's palette by taking ownership of the <style> element the
 * prerender baked into the page, rather than layering a second mechanism over
 * it.
 *
 * Writing custom properties onto documentElement instead would look simpler and
 * be wrong in two ways. The baked element still holds the *previous* festival's
 * rule, so any token the new festival does not define would keep applying from
 * it — the leak is in the element you did not touch, and removing the
 * properties you set does not help. And it would leave two sources for one
 * palette with no way to check they agree. Rewriting the element means
 * themeCss() is genuinely the only thing that decides what a theme looks like.
 *
 * It also corrects the two cases where the baked rule is always the wrong
 * festival's: the dev-server plugin fills every URL with DEFAULT_FESTIVAL_SLUG,
 * and the service worker answers offline navigations with the precached `/`,
 * which is the default festival's page. Both are corrected the moment React
 * mounts. The shell does paint once in the default palette before that — the
 * same staleness already accepted for <title> and the prerendered lineup
 * offline, and not worth a blocking script to avoid.
 *
 * useLayoutEffect, not useEffect: FestivalProvider is keyed by slug, so a
 * client-side switch unmounts the old provider and mounts the new one in the
 * same commit as the new grid. Layout effects run before paint; a passive
 * effect would show exactly one frame of the new lineup in the old colours.
 */
function useFestivalTheme(festival) {
  useLayoutEffect(() => {
    let el = document.getElementById('festival-theme');
    if (!el) {
      el = document.createElement('style');
      el.id = 'festival-theme';
      document.head.appendChild(el);
    }
    el.textContent = themeCss(festival);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = themeColor(festival);
  }, [festival]);
}

export function FestivalProvider({ festival, children }) {
  useFestivalTheme(festival);
  return (
    <FestivalContext.Provider value={festival}>
      {children}
    </FestivalContext.Provider>
  );
}

export function useFestival() {
  const festival = useContext(FestivalContext);
  if (!festival) {
    throw new Error('useFestival() must be used inside <FestivalProvider>');
  }
  return festival;
}
